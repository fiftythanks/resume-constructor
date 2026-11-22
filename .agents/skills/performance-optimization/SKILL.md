---
name: performance-optimization
description: Optimises application performance across frontend, backend, queries and databases. Use when performance requirements exist, when you suspect performance regressions, when Core Web Vitals or load times need improvement, when N+1 query patterns need fixing or when profiling reveals bottlenecks.
---

# Performance Optimisation

## Overview

Measure before optimising. Performance work without measurement is guessing — and guessing leads to premature optimisation that adds complexity without improving what matters. Diagnose first; only authorised remediation proceeds to a fix and re-measurement.

Under the [root authority](../../../AGENTS.md#authority), an audit or review ends at findings and recommendations. Change only a measured bottleneck covered by a user-approved implementation and testing plan. Evidence that a fix is worth trying is not permission to try it.

## When to Use

- Performance requirements exist in the spec (load time budgets, response time SLAs)
- Users or monitoring report slow behaviour
- Core Web Vitals indicate a possible problem or miss an applicable approved budget
- You suspect a change introduced a regression
- Building features that handle large datasets or high traffic

**When NOT to optimise:** Without measurements, use the skill to identify supported hypotheses and the next measurement, not to implement a fix.

## Core Web Vitals Targets

These are [industry reference bands](../../references/performance-checklist.md#core-web-vitals-targets) for field data at the 75th percentile, not project budgets or release gates.

| Metric                              | Good    | Needs Improvement | Poor    |
| ----------------------------------- | ------- | ----------------- | ------- |
| **LCP** (Largest Contentful Paint)  | ≤ 2.5s  | ≤ 4.0s            | > 4.0s  |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms           | > 500ms |
| **CLS** (Cumulative Layout Shift)   | ≤ 0.1   | ≤ 0.25            | > 0.25  |

## The Optimisation Workflow

```
1. MEASURE  → Use supplied evidence or an authorised baseline; otherwise name the next measurement
2. IDENTIFY → Attribute the bottleneck the evidence supports; audit stops at findings
3. FIX      → Address only the measured bottleneck under an approved implementation and testing plan
4. VERIFY   → Re-measure on comparable terms; decide from the evidence and applicable checks
5. GUARD    → Apply an approved guard or propose one and report what remains unverified
```

### Step 1: Measure

- **Source only:** Cite the relevant code, label impact as potential and name a measurement that could distinguish the hypothesis from alternatives. Do not infer timings, scores or a confirmed bottleneck from source.
- **Supplied measurements:** Use only evidence that matches the target and claim. Record the source, target, conditions and scope; mark missing values as not measured.
- **Authorised synthetic measurement (Lighthouse, DevTools Performance tab):** Use a representative device, workload and network to isolate the bottleneck and produce a repeatable baseline. Timing a named interaction in a local trace is not field INP.
- **Existing in-scope field data (RUM or CrUX):** State the population, URL or origin, collection period and percentile where known. A claim of population improvement needs comparable field evidence. Missing field data neither invalidates a supported local result nor establishes a field win.

For browser evidence, use the [web performance auditor's procedure](../../agents/web-performance-auditor.md#evidence) directly; no separate agent is required. For non-browser work, select evidence for the affected layer. Prefer existing approved tools. New telemetry, collection, external service queries and package fetches or installations require separate approval unless already covered by the plan. Existing instrumentation such as Speed Insights is not a supplied dataset or permission to collect more. Use synthetic content for CV diagnostics; do not collect CV content for performance telemetry.

**Frontend examples** (synthetic measurement within scope; RUM instrumentation only if separately authorised):

```javascript
// Synthetic: Lighthouse in Chrome DevTools (or CI)
// Chrome DevTools → Performance tab → Record
// Chrome DevTools MCP → Performance trace

// RUM: Web Vitals library in code
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

**Backend examples** (use an authorised target and existing approved tooling; adding logging or APM is separate work):

```javascript
// Response time logging
// Application Performance Monitoring (APM)
// Database query logging with timing

// Simple timing
console.time('db-query');
const result = await db.query(...);
console.timeEnd('db-query');
```

### Where to Start Measuring

Use the symptom to decide what to measure first:

```
What is slow?
├── First page load
│   ├── Large bundle? --> Measure bundle size, check code splitting
│   ├── Slow server response? --> Measure TTFB in DevTools Network waterfall
│   │   ├── DNS long? --> Assess dns-prefetch / preconnect for known origins
│   │   ├── TCP/TLS long? --> Assess HTTP/2, edge deployment and keep-alive
│   │   └── Waiting (server) long? --> Profile backend, check queries and caching
│   └── Render-blocking resources? --> Check network waterfall for CSS/JS blocking
├── Interaction feels sluggish
│   ├── UI freezes on click? --> Profile main thread, look for long tasks (>50ms)
│   ├── Form input lag? --> Check re-renders, controlled component overhead
│   └── Animation jank? --> Check layout thrashing, forced reflows
├── Page after navigation
│   ├── Data loading? --> Measure API response times, check for waterfalls
│   └── Client rendering? --> Profile component render time, check for N+1 fetches
└── Backend / API
    ├── Single endpoint slow? --> Profile database queries, check indexes
    ├── All endpoints slow? --> Check connection pool, memory, CPU
    └── Intermittent slowness? --> Check for lock contention, GC pauses, external deps
```

### Step 2: Identify the Bottleneck

Common diagnostic leads by category. Test the cause against evidence; these symptoms do not select a fix on their own.

**Frontend:**

| Symptom                                    | Likely Cause                                                 | Investigation                                                                             |
| ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Slow LCP                                   | Large images, render-blocking resources, slow server         | Check network waterfall, image sizes                                                      |
| High CLS                                   | Images without dimensions, late-loading content, font shifts | Check layout shift attribution                                                            |
| Slow interaction locally or poor field INP | Heavy JavaScript on main thread, large DOM updates           | Trace the affected interaction and attribute input delay, processing or presentation work |
| Slow initial load                          | Large bundle, many network requests                          | Check bundle size, code splitting                                                         |

**Backend:**

| Symptom            | Likely Cause                                         | Investigation                    |
| ------------------ | ---------------------------------------------------- | -------------------------------- |
| Slow API responses | N+1 queries, missing indexes, unoptimised queries    | Check database query log         |
| Memory growth      | Leaked references, unbounded caches, large payloads  | Heap snapshot analysis           |
| CPU spikes         | Synchronous heavy computation, regex backtracking    | CPU profiling                    |
| High latency       | Missing caching, redundant computation, network hops | Trace requests through the stack |

### Step 3: Fix the Bottleneck

For remediation, require both a measured bottleneck and a user-approved implementation and testing plan for the change. For an audit, report the evidence, observed versus potential impact and the smallest recommendation or next measurement, then stop. The anti-patterns below give diagnostic leads and link to worked fixes in [`references/optimization-patterns.md`](references/optimization-patterns.md). Open only the pattern relevant to the finding; a worked fix is not permission to apply it.

**Backend**

- **N+1 queries.** One query per row is the most common backend bottleneck. Fetch the relation in the same query (join/include) instead of in the loop. [Pattern](references/optimization-patterns.md#n1-queries-backend).
- **Unbounded data fetching.** Bound the result when the collection can grow, even if the endpoint does not paginate. A small, inherently bounded list need not be paginated. When paginating, use a limit and a unique deterministic total order. Add a tie-breaker only if the chosen sort can tie: a primary key alone already qualifies, but timestamps that happen to be distinct today do not. An offset can still shift when rows change between page requests. [Pattern](references/optimization-patterns.md#unbounded-data-fetching).
- **Queries that ignore their index.** "Add an index" is the guess; `EXPLAIN ANALYZE` is the measurement on an authorised target (it executes the query). A `Seq Scan` may mean an index is missing or unusable, or the scan is cheaper. A large `rows=` error may reflect stale statistics, skew or correlated predicates even with fresh statistics. A `Sort` may reflect an ordering mismatch or a cheaper overall plan. Check the cause before proposing `ANALYZE` or an index. Index for the shape of the query (in the linked example, the equality column comes before the sort column). A plain index often will not help a dominant value (consider a partial index for the rare value), a leading wildcard (consider trigram or full-text) or a function applied to the column (consider an expression index, as in `WHERE lower(email) = ?`). Compare before/after plans and representative read timings, and weigh the write cost; revert an owned experiment without a defensible benefit. [Pattern](references/optimization-patterns.md#queries-that-ignore-their-index).
- **Connection pool exhaustion.** Signature: _Every_ endpoint slows at once. Requests spend the extra time waiting for a connection rather than executing and the database shows mostly idle sessions. One pool per process, sized so `instances × max` stays under the database's connection ceiling. Bigger is not faster; it relocates the queue to the database where it is harder to see. With unbounded instance counts (serverless, autoscaling), multiplex through a proxy (pgbouncer, RDS Proxy) instead of raising `max`. [Pattern](references/optimization-patterns.md#connection-pool-exhaustion).
- **Missing caching.** Cache what is expensive to produce and read far more often than it changes; caching an already-fast query adds a network hop and a staleness bug in exchange for nothing. Pick the layer deliberately (in-process, shared, CDN). Every input that changes the response belongs in the key (tenant, locale, permissions, feature flags): a key that omits the viewer is how one user's data gets served to another. For shared HTTP caching, confirm that reuse is explicitly permitted, applicable HTTP rules allow it and the representation matches the request. Verify recipient eligibility independently of the cache key. Separately, use `immutable` only when the representation's bytes at that URL are guaranteed not to change throughout the advertised freshness lifetime, whether caching is public or private. The worked example guarantees this with content addressing; a public version URL that is never reused for different bytes can also qualify. Cache private responses only when privacy and freshness requirements permit it. Choose one invalidation strategy (TTL, event or tag based, versioned keys) and state the acceptable staleness window explicitly. Guard hot keys against the stampede: serve stale while one request recomputes, or coalesce concurrent misses behind a single in-flight promise. Never cache what must be fresh (balances, permissions, inventory at checkout). [Pattern](references/optimization-patterns.md#missing-caching-backend); request coalescing, write strategies and negative caching in `../../references/performance-checklist.md`.

**Frontend**

- **Missing image optimisation.** Reserve space with dimensions to avoid layout shifts. For an LCP image, avoid lazy loading; consider `fetchpriority="high"`, modern formats (AVIF, WebP) through `<picture>` and `srcset`/`sizes` where useful. For off-screen images, consider `loading="lazy"` and `decoding="async"`. [Pattern](references/optimization-patterns.md#missing-image-optimisation-frontend).
- **Unnecessary re-renders.** A fresh object or function prop can defeat the default `React.memo` comparison because it has a different reference. Hoisting a constant can preserve that boundary; hoisting alone does not stop an ordinary child rendering with its parent. Find where identity is observed and profile the work saved before introducing `React.memo` or `useMemo`, which have costs of their own. [Pattern](references/optimization-patterns.md#unnecessary-re-renders-react).
- **Large bundle size.** Modern bundlers tree-shake ESM named imports on their own; the real gains are route-level code splitting and lazy-loading heavy, rarely-used features behind `Suspense`. Profile before changing import styles. [Pattern](references/optimization-patterns.md#large-bundle-size).

### Step 4: Verify (Keep or Revert)

A fix is a hypothesis until you re-measure. The decisions below apply to an authorised experiment, not to an audit.

**Re-measure the way you measured the baseline:** same command, target, conditions and fixed sampling budget (wall-clock, sample count or request count). A baseline taken on a cold cache against a result taken on a warm one measures the cache, not your change. A comparable synthetic result supports a claim about the tested conditions, not a field improvement.

**Change one thing at a time.** Three optimisations landed together produce one number, and you cannot attribute it. If they must ship together, measure each in isolation first.

**Beat the noise, not just the mean.** Repeat the measurement and compare the delta against run-to-run variance. A 3% gain inside ±5% variance is not a gain; it is a different sample.

**Weigh bundle growth on affected browser paths.** Measure before and after, then report material growth and assess its user-facing cost (for example, extra transfer, parsing or execution on the initial load). Weigh that cost against the measured gain even when the extra bytes are explained.

Then decide, strictly:

| Result vs. baseline                                                                                                                                                 | Action                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Improvement beyond run-to-run variance, with correctness checks and applicable approved budgets satisfied and any material costs justified within the approved plan | **Keep.** Record the before/after numbers and the scope of the claim. When committing a kept permanent fix under the normal approved workflow, include those numbers and their scope in the commit message. This does not authorise opening a PR or publishing. |
| Within noise (no measurable change)                                                                                                                                 | **Revert.**                                                                                                                                                                                                                                                     |
| Worse                                                                                                                                                               | **Revert.**                                                                                                                                                                                                                                                     |
| Improved, but correctness regressed                                                                                                                                 | **Revert.** A regression wearing a win's clothing.                                                                                                                                                                                                              |
| Measurements not comparable or insufficient                                                                                                                         | **Inconclusive.** Correct the comparison within scope or report it unresolved; do not keep the experiment as a verified win.                                                                                                                                    |
| Applicable approved budget missed or required evidence missing                                                                                                      | **Unmet.** Report the failed or blocked gate; neither a local gain nor an industry band substitutes for satisfying it.                                                                                                                                          |
| Measured gain with a material cost whose acceptance would change an approved criterion or policy                                                                    | **Unresolved.** Report the trade-off and wait for the user's decision. Any failed or blocked gate remains unmet.                                                                                                                                                |

**"Neutral" is a revert, not a keep.** This is the step teams skip: the change is already written, throwing it away feels wasteful, so it lands unmeasured, and the codebase accretes complexity that never bought anything. Code you keep, you maintain forever. Make it pay for itself.

Revert only your own experimental changes. If they cannot be separated from other work, stop and report the conflict rather than undoing someone else's edits.

**Correctness gates the metric.** The required tests stay green _and_ the number moves. An "optimisation" that wins by dropping work the product needed (skipping a validation, caching something that must be fresh, removing an `await` that was load-bearing) is a regression, not a win. When a change could affect the standard preview or PDF, compare selected content, typography, geometry, line wrapping and pagination under [Product](../../../docs/reference/product.md#previewexport-parity), and exercise affected [accessibility](../../../docs/reference/accessibility.md) requirements. A browser trace does not verify exported PDF parity or accessibility. Do not require PDF evidence for unrelated work.

#### Log every attempt, including the reverted ones

Reverted work leaves no trace in git history, which is exactly why the same dead idea gets tried again next quarter. Record the metric, scope and conditions with the verdict so a discarded idea stays discarded. In this illustrative ledger, repeat the same list-filter interaction for the first two rows and the same lab page load for the third, under matching conditions. None of these are field measurements.

| Idea                         | Baseline → Result                      | Verdict  | Why                                                                 |
| ---------------------------- | -------------------------------------- | -------- | ------------------------------------------------------------------- |
| Memoise the row component    | Local interaction timing 240ms → 235ms | reverted | Inside noise (±15ms); the experiment did not show a gain.           |
| Virtualise the list          | Local interaction timing 240ms → 90ms  | kept     | Long tasks gone from the trace; required correctness checks passed. |
| Preconnect to the API origin | Lab LCP 2.8s → 2.8s                    | reverted | Already same-origin.                                                |

Use the existing task or verification record, or a PR description if a PR is already authorised. Keep this ledger whether or not a commit is made; commit-message evidence for a kept permanent fix is additional. No new repository file is required. What matters is that the next person (or the next agent) reads it before proposing an experiment and doesn't re-run one that already failed.

### Step 5: Guard Against Regression

After a demonstrated fix, identify a guard for the primary metric at the scope the evidence supports. Enforce any applicable approved budget. If a suitable guard is not approved, propose it and record what remains unverified rather than adding CI, thresholds or monitoring.

- **Synthetic CI gate:** Catch reproducible regressions before merge with an approved performance budget. Repeat noisy measurements or compare a median/trend so normal run-to-run variance does not turn the gate into a flaky check. A local interaction timing guard is not a field INP guard.
- **Field monitoring:** Where approved, alert on a meaningful p75 movement in RUM data. Use attributed `web-vitals` data to locate the cause; treat CrUX's rolling window as confirmation rather than an immediate alert.

When an approved guard fires, return to Step 1 and establish a fresh baseline before proposing another fix.

**Illustrative budgets, not project defaults or release gates:**

```
JavaScript bundle: < 200KB gzipped (initial load)
CSS: < 50KB gzipped
Images: < 200KB per image (above the fold)
Fonts: < 100KB total
API response time: < 200ms (p95)
Time to Interactive: < 3.5s on 4G
Lighthouse Performance score: ≥ 90
```

**Example CI commands for separately authorised tooling and CI work:** Prefer existing approved project commands. These invocations can fetch packages; do not run them as audit setup or a fallback for missing evidence. Any package fetch or installation and any new CI gate need their own approval unless already covered by the plan.

```bash
# Bundle size check
npx bundlesize --config bundlesize.config.json

# Lighthouse CI. The CLI package is @lhci/cli; unscoped `lhci` on npm is not it.
npx --package=@lhci/cli lhci autorun
```

## See Also

For detailed performance checklists, optimisation commands and the anti-pattern reference, see `../../references/performance-checklist.md`.

## Common Rationalisations

| Rationalisation                                         | Reality                                                                                                                                                                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "We'll optimize later"                                  | Record supported findings and their next measurements; fix only the measured bottleneck under an approved implementation and testing plan.                                                                                                              |
| "It's fast on my machine"                               | A local result covers its test conditions. Use representative hardware and networks for a local claim and comparable field data for a population claim.                                                                                                 |
| "This optimization is obvious"                          | Source supports a hypothesis, not a timing. Name a measurement or run it if authorised.                                                                                                                                                                 |
| "Users won't notice 100ms"                              | Assess the affected interaction under representative conditions rather than assuming the delay is harmless.                                                                                                                                             |
| "The framework handles performance"                     | Frameworks prevent some issues but can't fix N+1 queries or oversized bundles.                                                                                                                                                                          |
| "The query is slow, add an index"                       | Read the plan first. A scan can be cheaper, a sort can be intentional and a row estimate error need not mean stale statistics. Measure read benefit and write cost before keeping an index.                                                             |
| "Just cache it"                                         | Caching an already-cheap call buys nothing and adds a staleness bug. Cache what is expensive _and_ re-read far more than written. Decide who may cache the response separately from whether its bytes stay unchanged throughout the freshness lifetime. |
| "Raise the pool size, we're running out of connections" | A pool bigger than the database can serve moves the queue somewhere less visible. Find what holds connections.                                                                                                                                          |
| "It didn't help much, but it doesn't hurt"              | A comparable result within noise is a revert for an owned experiment. A non-comparable result is inconclusive, not a win.                                                                                                                               |
| "We already wrote it, may as well keep it"              | Sunk cost. The measurement doesn't care how long the change took to write.                                                                                                                                                                              |
| "The improvement is obvious, no need to re-measure"     | Repeat the comparable measurement; the apparent gain may be noise.                                                                                                                                                                                      |

## Red Flags

- Implementing a fix from an audit, without a measured bottleneck or outside the approved implementation and testing plan
- Presenting source as measured impact, a local interaction timing as field INP or missing field data as a pass or fail without an applicable approved requirement
- N+1 query patterns in data fetching
- An index added without comparative plans, read benefit and write cost to justify it, or a planner symptom treated as proof of its cause
- A cache key that omits an input the response depends on (tenant, locale, viewer)
- A cache with no stated staleness window and no invalidation strategy
- Shared HTTP caching that lacks explicit permission for reuse, violates applicable HTTP rules, serves a mismatched representation or serves an ineligible recipient; `immutable` without a guarantee that the representation stays unchanged throughout its advertised freshness lifetime
- Connection pool size raised in response to exhaustion, without finding what holds connections
- An unbounded fetch from a collection that can grow, or pagination without a limit or a unique deterministic total order
- Images that shift layout, an LCP image deferred by lazy loading or off-screen images causing unnecessary transfer
- Material bundle growth on an affected path without a reported assessment weighing its user-facing cost against the gain, even if the growth itself is measured and explained
- An applicable approved guard lacking required evidence, or new thresholds, CI, tooling or telemetry introduced without approval
- Manual memoisation without a measured benefit, or assuming stable props alone stop an ordinary child rendering
- Optimisations kept without a re-measurement that justifies them
- Several optimisations bundled into one measurement, so no single change can be attributed
- A "win" that drops required behaviour (including affected preview/PDF parity or accessibility) or relies on changing test expectations, removing coverage or bypassing checks without approval
- The same failed optimisation attempted more than once because nobody recorded the first attempt

## Verification

**Audit or review:** Record the selected target, evidence and its limitations. Cite the supported findings, distinguish potential from observed impact and give the smallest recommendation or next measurement. Note checks that could not run and stop before remediation.

**Authorised experiment:** Follow [Verification](../../../docs/reference/verification.md) for applicable checks and record what ran.

- [ ] The specific measured bottleneck and experiment are within the approved implementation and testing plan.
- [ ] Before and after measurements name the metric, target, conditions and evidence type. Local interaction timing is not field INP; population claims have comparable field evidence.
- [ ] The comparison repeats the baseline method under matching conditions with the same sampling budget, and isolates one change at a time.
- [ ] A kept improvement exceeds run-to-run variance. Neutral, worse or incorrect experiments are reverted only within owned changes. Non-comparable evidence stays inconclusive.
- [ ] Attempts are logged, kept and reverted alike, so a dead idea isn't re-run. When a kept permanent fix is committed under the normal approved workflow, its commit message also includes the scoped before/after numbers.
- [ ] Where browser bundle size is affected, compare it before and after on the affected paths. Report material growth and weigh its user-facing cost against the measured gain. Leave trade-offs that would change an approved criterion or policy unresolved pending the user's decision.
- [ ] New data fetching avoids N+1 queries and bounds results that could grow with the collection. Pagination uses a limit and a unique deterministic total order, adding a tie-breaker only when the chosen sort can tie.
- [ ] Any new index has before/after plan and timing evidence for its read benefit and accounts for write cost.
- [ ] Any new cache states what it keys on, how it goes stale and which responses qualify. Shared HTTP reuse has explicit permission, complies with applicable HTTP rules and serves the matching representation only to eligible recipients. Private caching meets privacy and freshness requirements. For either kind of caching, `immutable` requires a guarantee that the representation stays unchanged at that URL throughout the advertised freshness lifetime.
- [ ] Applicable approved performance budgets are checked; failed or blocked ones remain unmet. Industry bands are diagnostic only. Identify a relevant regression guard; if it needs approval, propose it and record what remains unverified.
- [ ] Required correctness checks pass, including affected product and accessibility requirements and standard preview/PDF parity where relevant.
