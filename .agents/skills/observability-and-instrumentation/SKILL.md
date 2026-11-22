---
name: observability-and-instrumentation
description: Use when assessing a production visibility gap or adding or changing logging, metrics, tracing or alerts. Start from the operational question and existing evidence; new collection requires approval.
---

# Observability and Instrumentation

## Overview

Observability answers "what is the system doing and why?" using evidence from outside the code. Use existing evidence first. Build approved instrumentation alongside the feature where it is needed; neither assessing readiness nor shipping a change authorises new collection.

## When to Use

- A feature, service, endpoint, job or integration has an operational question that existing evidence may not answer
- A production incident took too long to diagnose ("we couldn't tell what happened")
- Setting up or reviewing alerting rules
- Reviewing visibility for changes to I/O, retries, queues or cross-service calls

**NOT for:**

- Diagnosing a failure happening right now — use the `debugging-and-error-recovery` skill (observability is what makes that skill fast next time)
- Profiling and optimising measured slowness — use the `performance-optimization` skill
- Launch-day monitoring checklists and rollback triggers — see the `shipping-and-launch` skill; this skill covers the instrumentation that feeds them

## Process

### 1. Define "working" before instrumenting

Telemetry without a question is noise. Write down 2–4 questions an on-call engineer will ask and identify which existing evidence answers them. For any gap, distinguish a required signal from one that does not apply. Before adding a signal, agree its purpose, fields, recipients and retention under [Verification](../../../docs/reference/verification.md#definition-of-done) and [Personal data and privacy](../security-and-hardening/SKILL.md#personal-data-and-privacy). Report a missing required signal as unmet; do not add a sink, SDK or alert to satisfy a generic checklist.

```
FEATURE: checkout payment retry
QUESTIONS ON-CALL WILL ASK:
1. What fraction of payments succeed on first attempt vs after retry?
2. When a payment fails permanently, why? (provider error? timeout? validation?)
3. Is the payment provider slower than usual?
→ Every signal below must help answer one of these.
```

If you can't name the questions, you're not ready to instrument — you'll log everything and learn nothing.

### 2. Pick the right signal for each question

| Signal             | Answers                                | Cost profile                     | Example                                          |
| ------------------ | -------------------------------------- | -------------------------------- | ------------------------------------------------ |
| **Structured log** | "What happened in this specific case?" | Per-event; grows with traffic    | `payment_failed` with a bounded failure category |
| **Metric**         | "How often / how fast, in aggregate?"  | Fixed per series; cheap to query | p99 latency of provider calls                    |
| **Trace**          | "Where did time go across services?"   | Per-request; usually sampled     | One slow checkout, broken down by hop            |

Rule of thumb: metrics tell you **that** something is wrong, traces tell you **where**, logs tell you **why**.

### 3. Structured logging

Log events, not prose. Every log line is a JSON object with a stable event name and machine-readable fields. In this service example, `logger` is the request-scoped child logger and `n` is the retry count in a known timeout branch:

```typescript
// BAD: free-form text instead of queryable fields
logger.info(`Payment timed out after ${n} retries`);

// GOOD: stable event name + allowlisted metadata
logger.warn(
  {
    event: 'payment_failed',
    provider: 'stripe',
    reason: 'timeout',
    attempt: n,
  },
  'payment failed',
);
```

**Log levels — use them consistently:**

| Level   | Meaning                                                 | On-call action               |
| ------- | ------------------------------------------------------- | ---------------------------- |
| `error` | Invariant broken; someone may need to act               | Investigate                  |
| `warn`  | Degraded but handled (retry succeeded, fallback used)   | Watch for trends             |
| `info`  | Significant business event (order placed, job finished) | None                         |
| `debug` | Diagnostic detail                                       | Off in production by default |

**Correlate request-scoped diagnostics.** Generate an opaque request ID at the boundary. Accept existing correlation metadata only from an authenticated, trusted upstream after validating its format and size. Attach it to the approved logs and spans for that request; forward it only across the authorised HTTP or queue boundaries that need it.

```typescript
// Express public ingress: replace any caller-supplied ID. Returning the new ID
// to the caller is approved in this example; req.id and req.log are app fields.
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  req.log = logger.child({ requestId: req.id });
  res.setHeader('x-request-id', req.id);
  next();
});
```

**When one log stream includes runs from several entry points, name the entry point.** This applies even if one worker writes every line or the runs serve just one customer; a functioning single-entry stream does not need a new origin field. A correlation ID identifies a run; it does not say which code path started it. The same job reached by a scheduler, by a replay endpoint and by a manual CLI run produces interchangeable lines in one sink, so attributing a line falls back to elimination — cross-reading the scheduler's history, the process table, a deploy log — and that argument holds only as long as those external records happen to still exist. Stamp the entry point where the run starts, next to the correlation ID, and propagate both the same way:

```typescript
// One helper for every entry point: the run's own logger carries both fields.
// `entryPoint`, not `source` — ECS reserves `source.*` for network fields.
export const runLog = (
  entryPoint: 'scheduler' | 'replay_endpoint' | 'cli',
  runId: string,
) => logger.child({ entryPoint, requestId: runId });

// scheduler tick        -> runLog('scheduler', crypto.randomUUID())
// POST /jobs/:id/replay -> runLog('replay_endpoint', req.id)
// CLI invocation        -> runLog('cli', process.env.RUN_ID ?? crypto.randomUUID())
```

Carry both fields across the same authorised boundaries so the worker does not guess the origin. The CLI example assumes `RUN_ID` is supplied by a trusted launcher and validated before use. Otherwise generate a fresh ID. A field that merely correlates with an entry point is a hint, not attribution: anything that can invoke the job can reproduce it.

Allowlist metadata at every approved sink, including automatic SDK capture. Use bounded categories, route templates and approved opaque correlation IDs where needed. Exclude personal or business identifiers, email addresses, raw paths or URLs, request/response bodies, auth headers, secrets and raw errors (messages, stacks and nested values). Check what is actually emitted, not just the fields set by the caller.

### 4. Metrics

For approved service metrics, apply **RED** to relevant endpoints and dependencies: **R**ate (requests/sec), **E**rrors (failure rate), **D**uration (latency histogram, not average). Apply **USE** to relevant resources (queues, pools, hosts): **U**tilisation, **S**aturation, **E**rrors. A client-only change need not invent service metrics.

OpenTelemetry provides a vendor-neutral metrics API. This service illustration uses Prometheus' `prom-client`; observe only normalised methods, route templates and status classes from fixed sets.

```typescript
import { Histogram } from 'prom-client';

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_class'], // '2xx', not '200'
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});
```

**Cardinality is the failure mode.** Every unique label combination is a separate time series. Use small, fixed sets (route template, status class, provider name). Do not move rejected label values into logs or traces as a workaround; the same privacy rules apply there.

```
OK as label:    route="/api/tasks/:id"   status_class="5xx"   provider="stripe"
NEVER a label:  user_id, email, request_id, full URL, error message text
```

Track averages never, percentiles always: an average hides the 1% of users having a terrible time. Use histograms and read p50/p95/p99.

### 5. Distributed tracing

Where distributed tracing is approved, initialise the OpenTelemetry SDK before loading the service's other modules, including instrumented clients. Preload the compiled startup module using the service's Node module setup. This startup-only illustration uses `@opentelemetry/sdk-node` with no automatic integrations or exporters. Enable only explicitly approved integrations configured to allowlist names, attributes and events before export.

```typescript
// tracing.ts — preload before the application entry point.
import { NodeSDK } from '@opentelemetry/sdk-node';

const sdk = new NodeSDK({
  serviceName: 'checkout-service',
  instrumentations: [],
  autoDetectResources: false,
  spanProcessors: [],
  metricReaders: [],
  logRecordProcessors: [],
});
sdk.start();
```

For an isolated startup check, use a clean launch environment with no other telemetry preloads and set `OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER` and `OTEL_LOGS_EXPORTER` to `none`. For real collection, configure the approved exporters and recipients before startup and verify the effective configuration for the installed SDK. Control ambient settings and preloads that can add exporters, integrations, resource attributes, baggage or alternate sampling. Empty integrations and disabled resource detection here do not establish a production privacy control or prove delivery; inspect actual output at each approved destination.

Add manual spans only around meaningful internal work. Extract or inject trace context at authorised boundaries, including queues; validate trusted incoming context and start fresh at untrusted ingress rather than accepting arbitrary metadata or sampling instructions.

Choose the sampling policy end to end. Low-rate head sampling saves work but can discard traces before their outcome is known. If complete error-trace retention is required, verify that every required in-scope span is retained at the approved destination through the target's required retention period. Recording all in-scope spans without a tail sampler is sufficient if they are retained end to end. With tail sampling, guard against upstream drops, keep complete error traces and sample successes only as the policy permits. Late spans may inherit a remembered keep decision, but the decision does not prove delivery or retention. Require arrival before the decision only if the target explicitly requires it as a separate timing criterion. Confirmed loss of a required span anywhere in the pipeline fails the retention check; lack of evidence leaves it unverified.

### 6. Alerting

For approved alerts, use **symptoms users feel**, not causes. The timings and values below are examples, not thresholds to adopt:

```
SYMPTOM (page-worthy):           CAUSE (dashboard, not a page):
error rate > 1% for 5 min        CPU at 85%
p99 latency > 2s                 one pod restarted
queue age > 10 min               disk at 70%
```

Cause-based alerts fire when nothing is wrong and miss failures you didn't predict. Symptom-based alerts fire exactly when users are hurt, regardless of the cause.

Rules for every alert you create:

1. **It must be actionable.** If the response is "ignore it, it self-heals", delete the alert.
2. **It links to a runbook** — even three lines: what it means, first query to run, escalation path.
3. **It has a threshold and duration** justified by the SLO or by historical data, not by a guess.
4. Use two severities only: **page** (user-facing, act now) and **ticket** (degradation, act this week). A third tier becomes noise that trains people to ignore everything.

#### Writing Runbooks

Rule 2 requires every alert to link to a runbook: what is happening, what to check first and whom to contact if that doesn't resolve it. Name it after the alert and store it with the target's agreed runbooks.

**Example three-line runbook for a PostgreSQL-backed service:**

```markdown
# Runbook: High Error Rate on /api/tasks

**Means:** DB connection pool likely exhausted, or a bad deploy.
**First check:** `SELECT count(*) FROM pg_stat_activity WHERE backend_type = 'client backend';`
— if count > pool limit, include the result when escalating. (Swap in the equivalent for your database.)
**Escalate to:** #db-oncall or engineering on-call rotation.
```

**When to expand beyond three lines:** add steps only when the first check alone isn't enough to decide. A five-step runbook that covers the three most common causes is better than a twenty-step document that covers every edge case and gets skimmed.

**Keep runbooks current.** Update the runbook as part of closing every incident it was used in — a stale runbook builds false confidence. If a step was wrong or missing, fix it before marking the incident resolved.

### 7. Verify the telemetry itself

Instrumentation is code; it can be wrong. Exercise each applicable signal in an authorised environment with synthetic inputs and inspect the actual output, including automatically attached fields:

- Induce a failure → find it by its approved correlation ID, confirm structured fields and distinguish the origin when several entry points share a sink.
- Send test traffic → confirm metric series appear with the expected labels and sane values.
- Follow a request across the approved boundaries → check span continuity and the required sampling outcome, including an error and any upstream drops.
- Exercise each new alert through an authorised test route → verify delivery and the runbook link without lowering live thresholds or paging on-call by default.

## Common Rationalisations

| Rationalisation                                            | Reality                                                                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "I'll add logging after it works"                          | If the release requires approved visibility, build and verify it alongside the feature. If existing evidence suffices, add nothing.                     |
| "More logs = more observability"                           | Unstructured noise makes incidents slower, not faster. Three queryable events beat three hundred prose lines.                                           |
| "`console.log` is fine for now"                            | Local output can help diagnose a local failure. It does not prove that a required operational event is structured, correlated or delivered.             |
| "We can just look at the dashboards when something breaks" | Dashboards built without defined questions show you everything except the answer. Start from on-call questions.                                         |
| "Alert on everything important, we'll tune later"          | A noisy pager trains people to ignore it. The tuning never happens; the missed real page does.                                                          |
| "User ID as a metric label makes debugging easier"         | It creates unbounded series and exposes identity. Use bounded categories and, when needed and approved, an opaque request ID in structured diagnostics. |
| "Tracing is overkill for our two services"                 | Use the latency or causality question to decide. If existing evidence cannot answer it, assess the approved tracing options and verify the boundaries.  |

## Red Flags

- An operational question requires visibility that the available evidence does not provide
- Log lines built by string interpolation instead of structured fields
- Request-scoped events cannot be linked across the authorised boundaries
- One log stream fed by a scheduler, a webhook and manual runs, with no field naming which one produced the line
- Metrics labelled with user IDs, raw URLs or error message text
- Latency tracked as an average with no percentiles
- Alerts that fire daily and get acknowledged without action
- Alerts on causes (CPU, memory) paging humans while user-facing error rate is unmonitored
- An approved sink receives raw errors, secrets, personal data, raw URLs or request/response bodies
- A local console diagnostic or installed SDK is treated as evidence of a working production signal

## Verification

For each required signal, record the observed output or the missing/failed check. Mark genuinely inapplicable items with a reason:

- [ ] Each signal answers a stated operational question and uses only the approved fields and recipients
- [ ] Logs are structured (JSON), with stable event names and trusted correlation IDs on request-scoped events
- [ ] A log stream that combines runs from multiple entry points carries an entry-point field set at the start of each run and propagated with the correlation ID rather than inferred downstream
- [ ] No raw errors, personal data, secrets, raw URLs or request/response bodies in actual output from any approved sink
- [ ] Required RED/USE metrics exist with bounded labels; latency histograms support p95/p99
- [ ] Applicable traces remain continuous across approved boundaries and meet the end-to-end sampling requirement
- [ ] Each new alert is symptom-based and has a justified threshold and a runbook. Each was exercised through an authorised test route
- [ ] An induced failure can be diagnosed from the required telemetry without reading the source

For the at-a-glance version of this list, including the pre-launch instrumentation gate, see `../../references/observability-checklist.md`.
