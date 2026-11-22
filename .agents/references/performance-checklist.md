# Performance Checklist

Diagnostic prompts for web performance, not enforced project policy. Consult only the sections relevant to the selected symptom and stack. Database, caching and infrastructure checks apply only when evidence implicates those layers.

## Table of Contents

- [Core Web Vitals Targets](#core-web-vitals-targets)
- [TTFB Diagnosis](#ttfb-diagnosis)
- [Frontend Checklist](#frontend-checklist)
- [Backend Checklist](#backend-checklist)
- [Caching Strategies](#caching-strategies)
- [Measurement Commands](#measurement-commands)
- [Common Anti-Patterns](#common-anti-patterns)

## Core Web Vitals Targets

Industry reference bands for interpreting field data at the 75th percentile. They are not a project budget or a release gate.

| Metric                          | Good    | Needs Work | Poor    |
| ------------------------------- | ------- | ---------- | ------- |
| LCP (Largest Contentful Paint)  | ≤ 2.5s  | ≤ 4.0s     | > 4.0s  |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms    | > 500ms |
| CLS (Cumulative Layout Shift)   | ≤ 0.1   | ≤ 0.25     | > 0.25  |

## TTFB Diagnosis

If time to first byte appears to constrain the selected load, use the network waterfall to separate connection setup, server response and redirects. Which phase dominates under the recorded conditions? Investigate only that phase before recommending an intervention.

## Frontend Checklist

### Images

- Which images contribute to transfer cost or LCP on the selected path? Check the sizes actually downloaded, format and priority in the waterfall.
- Do shifts coincide with image rendering? Check whether the layout reserves the right space, including for art-directed sources.

### JavaScript

- Which scripts account for initial transfer, parse or execution time? Check whether the measured path needs them before proposing a split or deferral.
- Does a trace show long tasks or work ahead of presentation delaying a named interaction? Attribute the cost to the handler, computation or third-party script before considering scheduling changes or a worker.
- Does profiling show repeated expensive renders with stable inputs? Compare the cost before recommending memoisation.

### CSS

- Do stylesheets or runtime style work delay the first relevant paint? Identify the blocking resources or work before proposing changes.

### Fonts

- Which browser font files and weights are transferred on the measured path? Do font loading or fallback metrics contribute to delayed text or layout shift?
- Check the browser asset format and loading strategy separately from assets used by the PDF renderer. Preserve [parity between preview and PDF](../../docs/reference/product.md) and [accessibility](../../docs/reference/accessibility.md) rather than changing fonts or hiding content to improve a score.

### Network

- What dominates the waterfall: transfer size, repeated requests, redirects, connection setup or response time? Check actual cache behaviour and request priority before proposing changes.

### Rendering

- Which work dominates the trace: rerenders, forced layout, paint or animation? Attribute it to the affected element or component.
- If a long list or off-screen content dominates render time, could less work help without changing content availability, focus or reading order?
- If back/forward navigation is the measured problem, check reported cache eligibility and its causes before changing handlers or cache policy.

## Backend Checklist

### Database

- [ ] No N+1 query patterns (use eager loading / joins)
- [ ] Queries have appropriate indexes
- [ ] List endpoints paginated (never `SELECT * FROM table`)
- [ ] Connection pooling configured
- [ ] Slow query logging enabled

#### Query plans

- [ ] `EXPLAIN ANALYZE` captured **before** the fix, not just after — it is the baseline
- [ ] `Seq Scan` on a large table understood: index missing, unusable or genuinely not worth it
- [ ] Estimated vs actual `rows=` within an order of magnitude (if not, refresh statistics before touching indexes)
- [ ] No `Sort` node that a composite index could absorb
- [ ] Plan re-checked after the change — an index that did not change the plan gets reverted

#### Index strategy

- [ ] Composite index column order is equality first, then range/sort
- [ ] Index covers the query shape (filter + sort), not just one column in isolation
- [ ] Covering index considered for hot read paths (index-only scan avoids the heap fetch)
- [ ] Not indexing low-selectivity columns _for the dominant value_; a partial index still serves the rare-value query (`WHERE status = 'failed'`)
- [ ] Expression index used where the query applies a function (`lower(email)`)
- [ ] Full-text or trigram index used for leading-wildcard search, not a B-tree
- [ ] Write cost measured on write-heavy tables (every index taxes every `INSERT`/`UPDATE`)
- [ ] Unused and duplicate indexes dropped (they cost writes and buy nothing)

#### Connection pooling

- [ ] One pool per process, not per request or per module
- [ ] `instances × pool max` stays under the database's `max_connections`
- [ ] `connectionTimeoutMillis` set so exhaustion fails fast instead of queueing forever
- [ ] Exhaustion diagnosed before resizing: find what holds connections (long transactions, missing `await`, leaked clients)
- [ ] Serverless or autoscaling deployments fronted by a multiplexing proxy (PgBouncer, RDS Proxy) rather than a larger pool

### API

- [ ] Response times < 200ms (p95)
- [ ] No synchronous heavy computation in request handlers
- [ ] Bulk operations instead of loops of individual calls
- [ ] Response compression (gzip/brotli)
- [ ] Appropriate caching (in-memory, Redis, CDN)

### Infrastructure

- [ ] CDN for static assets
- [ ] Server located close to users (or edge deployment)
- [ ] Horizontal scaling configured (if needed)
- [ ] Health check endpoint for load balancer

## Caching Strategies

The decision material (which layer, which invalidation strategy, what never to cache) lives in the `performance-optimization` skill. This section covers the read/write patterns and the checklist.

### Read and write patterns

| Pattern                       | How it works                                           | Use when                                                    | Watch out for                                                                        |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Cache-aside** (lazy)        | App checks cache, on miss reads origin and populates   | Default choice; read-heavy, tolerant of a cold first hit    | Every miss hits the origin, so it needs stampede protection                          |
| **Read-through**              | Cache layer itself loads on miss                       | You want the load path in one place, not at every call site | Hides origin latency; a slow origin looks like a slow cache                          |
| **Write-through**             | Write goes to cache and origin together, synchronously | Reads must never see a stale value after a write            | Adds cache latency to every write                                                    |
| **Write-behind** (write-back) | Write hits cache, origin updated asynchronously        | Write-heavy, and the origin is the bottleneck               | Data loss window if the cache dies before the flush. Needs durability you can defend |

### Negative caching

Cache the _absence_ of a result too. A key that misses on every lookup (a nonexistent user ID probed in a loop, a 404 asset) sends every request to the origin, which is a cache that only protects the happy path.

- Store an explicit "not found" sentinel with a **shorter** TTL than positive entries
- Keep the negative TTL short enough that a newly created record appears promptly
- Never let an origin _error_ become a negative cache entry, or one failing minute becomes many

### Request coalescing (stampede protection)

One recompute, N waiters. Prevents a hot key's expiry from delivering the full concurrent load to the origin:

```typescript
const inFlight = new Map<string, Promise<unknown>>();

function loadOnce<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = fetcher().finally(() => inFlight.delete(key));
  inFlight.set(key, p);
  return p;
}
```

For a shared cache, the same idea needs a distributed lock, or `stale-while-revalidate` so waiters serve the stale value instead of blocking.

### Cache checklist

- [ ] The cached call was measured as expensive first (caching a fast call adds a hop and buys nothing)
- [ ] Read/write ratio justifies the cache (re-read far more often than written)
- [ ] Cache key includes every input the response varies on: tenant, viewer, locale, permissions, feature flags
- [ ] No per-user data cached under a key that does not identify the user
- [ ] One invalidation strategy chosen (TTL, event/tag or versioned keys), not an accidental mix
- [ ] Acceptable staleness window written down, not implied by whatever TTL was typed
- [ ] Stampede protection on hot keys (coalescing, lock or `stale-while-revalidate`)
- [ ] Negative results cached with a shorter TTL; origin errors never cached
- [ ] Eviction policy and memory ceiling set (an unbounded cache is a memory leak)
- [ ] Hit rate monitored — a cache nobody measures is an assumption, and a low hit rate is pure overhead
- [ ] Nothing cached whose staleness is a correctness bug (balances, permissions, inventory at checkout)

## Measurement Commands

1. **Supplied evidence:** Interpret only fields in the supplied report or trace that match the target. Distinguish lab values, trace observations and real-user field data.
2. **Authorised local trace:** Record the named load or interaction on the authorised page. If a desktop trace does not explain a slow interaction reported on lower-powered hardware, compare the same interaction on a representative slower device or with CPU throttling. Record the conditions; a local trace is not a population measurement.
3. **Field evidence:** Use existing real-user data when available. Note its scope and conditions. Collecting new telemetry or querying an external service is separate work requiring authorisation.

The CLI and instrumentation examples below are options for separately authorised work with existing tools or approved dependencies. Do not run them as audit setup or as fallbacks for missing evidence.

```bash
# Lighthouse CLI
npx lighthouse http://localhost:3000 --output json --output-path ./report.json

# Bundle analysis
npx webpack-bundle-analyzer stats.json
# or for Vite:
npx vite-bundle-visualizer

# Check bundle size
npx bundlesize
```

```javascript
// Web Vitals in code
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(console.log);
onINP(console.log);
onCLS(console.log);

// INP with interaction-level detail (attribution build). The attribution build
// exports the same names, so alias it when both builds share a module.
import { onINP as onINPWithAttribution } from 'web-vitals/attribution';
onINPWithAttribution(({ value, attribution }) => {
  const {
    interactionTarget,
    inputDelay,
    processingDuration,
    presentationDelay,
  } = attribution;
  console.log({
    value,
    interactionTarget,
    inputDelay,
    processingDuration,
    presentationDelay,
  });
});
```

## Common Anti-Patterns

| Anti-Pattern                      | Impact                                         | Fix                                                                                |
| --------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| N+1 queries                       | Linear DB load growth                          | Use joins, includes or batch loading                                               |
| Unbounded queries                 | Memory exhaustion, timeouts                    | Always paginate and add `LIMIT`                                                    |
| Missing indexes                   | Slow reads as data grows                       | Add indexes for filtered/sorted columns                                            |
| Indexing without reading the plan | Write cost paid, read gain unproven            | `EXPLAIN ANALYZE` before and after; revert if the plan is unchanged                |
| Redundant or unused indexes       | Every write pays for them                      | Audit usage stats, drop what nothing reads                                         |
| Connection pool per request       | Exhausts `max_connections` under load          | One pool per process; proxy for serverless                                         |
| Cache key missing the viewer      | One user's data served to another              | Key on tenant, viewer, locale, permissions                                         |
| Unbounded cache                   | Memory leak wearing an optimisation's clothing | Set eviction policy and a memory ceiling                                           |
| Cache stampede on a hot key       | Origin takes full concurrent load at expiry    | Coalesce misses, or `stale-while-revalidate`                                       |
| Layout thrashing                  | Jank, dropped frames                           | Batch DOM reads, then batch writes                                                 |
| Unoptimised images                | Slow LCP, wasted bandwidth                     | Use WebP, responsive sizes, lazy load                                              |
| Large bundles                     | Slow Time to Interactive                       | Code split, tree shake, audit deps                                                 |
| Blocking main thread              | Poor INP, unresponsive UI                      | Chunk long tasks with `scheduler.yield()` or `yieldToMain`, offload to Web Workers |
| Memory leaks                      | Growing memory, eventual crash                 | Clean up listeners, intervals, refs                                                |
