# Optimization Patterns

Worked fixes for the anti-patterns named in [Step 3](../SKILL.md#step-3-fix-the-bottleneck) of the `performance-optimization` skill. Open only the section relevant to the selected finding. These cross-stack examples can inform a recommendation; apply a fix only to a measured bottleneck covered by a user-approved implementation and testing plan. An audit stops at findings.

Checklists, measurement commands, TTFB diagnosis, and caching read/write strategies live in `../../../references/performance-checklist.md`. Use the measurement and tooling examples only for separately authorised work, not as audit setup.

## N+1 Queries (Backend)

```typescript
// BAD: N+1 — one query per task for the owner
const tasks = await db.tasks.findMany();
for (const task of tasks) {
  task.owner = await db.users.findUnique({ where: { id: task.ownerId } });
}

// GOOD: Single query with join/include
const tasks = await db.tasks.findMany({
  include: { owner: true },
});
```

## Unbounded Data Fetching

An unbounded fetch from a growing collection can increase query time, memory use and payload size. Bound the result even if the caller does not paginate. A small, inherently bounded list need not be paginated.

```typescript
// BAD: Fetching all records from a growing collection
const allTasks = await db.tasks.findMany();

// GOOD: Paginated with a limit and a unique tie-breaker
const tasks = await db.tasks.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
});
```

The unique `id` resolves equal `createdAt` values, so page boundaries are deterministic on unchanged data. Inserts, deletes or updates between requests can still shift offsets.

## Queries That Ignore Their Index

"Add an index" is the guess. Compare execution plans on authorised, representative data. `EXPLAIN ANALYZE` executes the query:

```sql
EXPLAIN ANALYZE
SELECT id, title FROM tasks
WHERE owner_id = 42 ORDER BY created_at DESC LIMIT 20;
```

Use the output to distinguish causes, not to select a fix by node name:

| What you see                                               | What to check                                                                                                                                                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Seq Scan` where you expected an index                     | Is the index missing or unusable for this predicate, or is scanning cheaper because the table is small or the query returns many rows?                                                                      |
| Estimated `rows=` off from actual by an order of magnitude | Check for stale statistics, skew or correlated predicates. Fresh per-column statistics can still miss correlation; check whether multivariate statistics describe the predicates before proposing a change. |
| A `Sort` node above the scan                               | Check whether an index can supply the requested order and whether doing so beats the chosen scan and sort at the measured cardinality.                                                                      |

Index for the **shape of the query**, not the column in isolation. For this equality filter and sort, the equality column comes first, then the sort column:

```sql
CREATE INDEX idx_tasks_owner_created ON tasks (owner_id, created_at DESC);
```

**When to question a plain index:**

| Situation                                                                                                   | Why                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Low selectivity, querying the dominant value (a `status` column that is 95% `active`, filtered on `active`) | A sequential scan can be cheaper; a partial index can instead serve queries for the rare value  |
| Leading wildcard (`LIKE '%term'`)                                                                           | A B-tree cannot seek without a prefix; needs trigram or full-text                               |
| Function on the column (`WHERE lower(email) = ?`)                                                           | The plain column index is unusable; index the expression instead                                |
| Write-heavy table                                                                                           | Every index is a tax on every `INSERT`/`UPDATE`; measure the write cost, not just the read gain |

Repeat `EXPLAIN ANALYZE` and compare representative timings. Keep the index only for a defensible measured benefit that justifies the write cost; a changed plan on its own is not a win. Otherwise revert the owned index experiment under [Step 4](../SKILL.md#step-4-verify-keep-or-revert).

## Connection Pool Exhaustion

The signature is distinctive: **every** endpoint slows at once, the slow time is spent waiting for a connection rather than executing, and the database reports mostly idle sessions.

```typescript
// BAD: a pool per request or per module — under serverless this multiplies
// by instance count and exhausts the database's connection limit
// GOOD: one pool per process, sized against the database's ceiling
const pool = new Pool({
  max: 10, // instances × max must stay under max_connections
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000, // fail fast instead of queueing forever
});
```

**Bigger is not faster.** A pool larger than what the database can execute concurrently just relocates the queue from your app to the database, where it is harder to see. When instance count is unbounded (serverless, autoscaling), a proxy that multiplexes connections (pgbouncer, RDS Proxy) is the fix, not a higher `max`.

## Missing Image Optimization (Frontend)

```html
<!-- BAD: No dimensions, no format optimization -->
<img src="/hero.jpg" />

<!-- GOOD: Hero / LCP image — art direction + resolution switching, high priority -->
<!--
  Two techniques combined:
  - Art direction (media): different crop/composition per breakpoint
  - Resolution switching (srcset + sizes): right file size per screen density
-->
<picture>
  <!-- Mobile: portrait crop (8:10) -->
  <source
    media="(max-width: 767px)"
    srcset="/hero-mobile-400.avif 400w, /hero-mobile-800.avif 800w"
    sizes="100vw"
    width="800"
    height="1000"
    type="image/avif"
  />
  <source
    media="(max-width: 767px)"
    srcset="/hero-mobile-400.webp 400w, /hero-mobile-800.webp 800w"
    sizes="100vw"
    width="800"
    height="1000"
    type="image/webp"
  />
  <!-- Desktop: landscape crop (2:1) -->
  <source
    srcset="/hero-800.avif 800w, /hero-1200.avif 1200w, /hero-1600.avif 1600w"
    sizes="(max-width: 1200px) 100vw, 1200px"
    width="1200"
    height="600"
    type="image/avif"
  />
  <source
    srcset="/hero-800.webp 800w, /hero-1200.webp 1200w, /hero-1600.webp 1600w"
    sizes="(max-width: 1200px) 100vw, 1200px"
    width="1200"
    height="600"
    type="image/webp"
  />
  <img
    src="/hero-desktop.jpg"
    width="1200"
    height="600"
    fetchpriority="high"
    alt="Hero image description"
  />
</picture>

<!-- GOOD: Below-the-fold image — lazy loaded + async decoding -->
<img
  src="/content.webp"
  width="800"
  height="400"
  loading="lazy"
  decoding="async"
  alt="Content image description"
/>
```

## Unnecessary Re-renders (React)

Profile before adding memoisation: the saved render or computation must pay for it. Here `TaskFilters` is an ordinary component that renders from its `options` prop.

```tsx
import { memo } from 'react';

type FilterOptions = Readonly<{ sortBy: 'date'; order: 'asc' | 'desc' }>;

const MemoTaskFilters = memo(TaskFilters);
const ASC_OPTIONS: FilterOptions = { sortBy: 'date', order: 'asc' };
const DESC_OPTIONS: FilterOptions = { sortBy: 'date', order: 'desc' };

function TaskList({ order }: { order: FilterOptions['order'] }) {
  const options = order === 'asc' ? ASC_OPTIONS : DESC_OPTIONS;

  return (
    <>
      {/* Ordinary child: stable options alone do not prevent rendering. */}
      <TaskFilters options={options} />
      {/* Memoised child: a fresh options object defeats prop comparison. */}
      <MemoTaskFilters options={{ sortBy: 'date', order }} />
      {/* Memoised child: stable options let it skip an unchanged render. */}
      <MemoTaskFilters options={options} />
    </>
  );
}
```

When `TaskList` renders again with the same `order`, only the last child can skip the render through the default memo comparison. When `order` changes, both memoised children receive changed props and update.

```tsx
// Use React.memo for expensive components
const TaskItem = React.memo(function TaskItem({ task }: Props) {
  return <div>{/* expensive render */}</div>;
});

// Use useMemo for expensive computations
function TaskStats({ tasks }: Props) {
  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  return (
    <div>
      {stats.completed} / {stats.total}
    </div>
  );
}
```

## Large Bundle Size

```typescript
// Modern bundlers (Vite, webpack 5+) handle named imports with tree-shaking automatically,
// provided the dependency ships ESM and is marked `sideEffects: false` in package.json.
// Profile before changing import styles — the real gains come from splitting and lazy loading.

// GOOD: Dynamic import for heavy, rarely-used features
const ChartLibrary = lazy(() => import('./ChartLibrary'));

// GOOD: Route-level code splitting wrapped in Suspense
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
  );
}
```

## Missing Caching (Backend)

Cache what is expensive to produce and read far more often than it changes. Caching a query that was already fast adds a network hop, a staleness bug, and an eviction policy to maintain, in exchange for nothing.

**Pick the layer deliberately:**

| Layer                     | Visible to        | Use when                                                     | Cost                                                                           |
| ------------------------- | ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| In-process (`Map`, LRU)   | One instance      | Small, hot, per-instance staleness is acceptable             | Each instance drifts independently; invalidation reaches only one              |
| Shared (Redis, Memcached) | All instances     | Instances must agree, or the value is expensive to recompute | A network hop, and another service to run and monitor                          |
| CDN / edge                | Everyone, per URL | Responses are public and identical for a given key           | Invalidation is the hard part; assume you cannot recall a bad response quickly |

```typescript
// Cache frequently-read, rarely-changed data
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedConfig: AppConfig | null = null;
let cacheExpiry = 0;

async function getAppConfig(): Promise<AppConfig> {
  if (cachedConfig && Date.now() < cacheExpiry) {
    return cachedConfig;
  }
  cachedConfig = await db.config.findFirst();
  cacheExpiry = Date.now() + CACHE_TTL;
  return cachedConfig;
}
```

**HTTP caching:** Decide shared-cache eligibility separately from freshness. Confirm that reuse is explicitly permitted, the applicable HTTP directives and restrictions on requests with `Authorization` allow it and the representation matches the request. Verify recipient eligibility independently of the cache key. Use `immutable` only when the representation's bytes at that URL are guaranteed not to change throughout the advertised freshness lifetime. A public version URL that is never reused for different bytes can satisfy this contract just as the content-hash URL below does. A URL that merely looks versioned or bytes that happen to match today do not establish that guarantee. Public eligibility and private cache keys do not establish it either. The guarantee applies to both public and private caches; cache private responses only if privacy and freshness requirements permit it. For mutable responses, bound the freshness lifetime by the acceptable staleness window. The two routes below serve public, viewer-independent representations that are invariant for their cache keys: a content-addressed asset with a long immutable lifetime and an API response with a bounded public lifetime. These are examples, not the only valid combinations. Set each policy on the eligible response, not on all static files or API routes.

```javascript
import { createHash } from 'node:crypto';
import express from 'express';

const app = express();
const stylesheet = 'body { margin: 0; }';
const digest = createHash('sha256').update(stylesheet).digest('hex');
const assetPath = `/public/assets/${digest}/theme.css`;

app.get(assetPath, (_req, res) => {
  res
    .type('css')
    .set('Cache-Control', 'public, max-age=31536000, immutable')
    .send(stylesheet);
});

app.get('/api/public/units', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=300').json({ units: ['cm', 'in'] });
});
```

**Key design decides correctness.** Every input that changes the response belongs in the key: tenant, locale, permissions, feature flags. A key that omits the viewer is how one user's data gets served to another, and that ships as a performance win.

**Choose one invalidation strategy, not three:**

| Strategy                              | Trade-off                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| TTL                                   | Simplest. You accept staleness up to the TTL, so state the acceptable window explicitly |
| Event or tag based                    | Fresh on write, but writers now have to know the cache topology                         |
| Versioned keys (`user:42:profile:v7`) | Never invalidate, just stop reading old keys. Costs memory until eviction               |

**Guard against the stampede.** A hot key expires, every concurrent request misses together, and the origin takes the full load at once, which is how a cache turns into an outage instead of preventing one. Serve stale while a single request recomputes (`stale-while-revalidate`), or coalesce concurrent misses behind one in-flight promise so N waiters cause one recompute.

**Do not cache:** anything whose staleness is a correctness bug (balances, permissions, inventory at checkout), or per-user data under a key that does not identify the user. See `../../../references/performance-checklist.md#caching-strategies` for request coalescing, write strategies, negative caching, and the cache checklist.
