# Observability Checklist

Quick reference for assessing production visibility and verifying approved instrumentation. Use alongside the `observability-and-instrumentation` skill. Apply only the checks relevant to the operational questions and approved scope. Use existing evidence first; this checklist does not authorise collection or sharing.

## Table of Contents

- [On-Call Questions (Start Here)](#on-call-questions-start-here)
- [Structured Logging](#structured-logging)
- [Metrics](#metrics)
- [Distributed Tracing](#distributed-tracing)
- [Alerting](#alerting)
- [Dashboards](#dashboards)
- [Verify the Telemetry](#verify-the-telemetry)
- [Pre-Launch Gate](#pre-launch-gate)

## On-Call Questions (Start Here)

Telemetry without a question is noise. Before instrumenting anything:

- [ ] 2–4 questions an on-call engineer will ask about this feature are written down
- [ ] Every signal below maps to one of those questions
- [ ] Each question is matched to the right signal type: metrics say **that** something is wrong, traces say **where**, logs say **why**
- [ ] For each gap, recorded whether the signal is required or inapplicable and why; any new fields, recipients and retention are approved before collection

## Structured Logging

- [ ] Logs are structured (JSON) with stable event names — not free-form strings
- [ ] Request-scoped events carry an opaque correlation ID generated at the boundary or accepted from a trusted, authenticated upstream after format and size validation
- [ ] Correlation metadata crosses only authorised outbound and async boundaries that need it (HTTP headers, queue metadata)
- [ ] A log stream that combines runs from multiple entry points (scheduler, replay endpoint, manual run) carries an entry-point field set where the run starts and propagated alongside the correlation ID, even with one writer or one customer; no new field is needed for a functioning single-entry stream
- [ ] Log levels are consistent: `error` = invariant broken, someone may act; `warn` = degraded but handled; `info` = significant business event; `debug` = off in production
- [ ] All approved sinks, including SDKs, receive only allowlisted metadata — no raw error values, personal or business identifiers, email addresses, raw paths or URLs, request/response bodies, auth headers or secrets
- [ ] External calls use bounded metadata such as route template, status class, latency and attempt count
- [ ] Actual output from each approved sink checked for structured fields and unexpected or sensitive data, including automatically attached fields

## Metrics

- [ ] Required **RED** metrics cover the relevant endpoints and external dependencies: Rate, Errors, Duration
- [ ] Required **USE** metrics cover the relevant resources (queues, pools, hosts): Utilisation, Saturation, Errors
- [ ] Latency is a histogram; p50/p95/p99 queryable — never an average
- [ ] All labels come from small, fixed sets (route template, status class, provider name)
- [ ] No unbounded label values: no user IDs, tenant IDs, emails, raw URLs, request IDs or error message text
- [ ] Status codes grouped by class (`5xx`, not `503`)
- [ ] Queue depth and processing duration tracked where required for worker/queue health

## Distributed Tracing

- [ ] Where distributed tracing is required, the approved SDK is initialised at startup before the instrumented clients
- [ ] Only explicitly approved integrations are enabled for automatic capture, with names, attributes and events constrained before export; exporters, recipients and effective enrichment and sampling settings are verified before collecting real data
- [ ] Trace context (such as W3C `traceparent`/`tracestate`) is accepted only from trusted upstreams after validation and sent only to authorised recipients that need it
- [ ] Context survives the relevant async boundaries, including approved queue metadata
- [ ] Manual spans cover meaningful work with allowlisted attributes; no raw errors, secrets or personal data
- [ ] Where complete error retention is required, every required in-scope span is observed at the approved destination through the target's required retention period. Record-all without a tail sampler suffices if the traces are retained end to end. If using tail sampling, keep complete error traces and sample successes only as the policy permits. Late spans may inherit a remembered keep decision, but only observed retention counts. Require arrival before the decision only if the target explicitly requires it as a separate timing criterion. Confirmed loss of a required span anywhere in the pipeline fails the retention check; lack of evidence leaves it unverified.

## Alerting

- [ ] Every alert is symptom-based (error rate, p99 latency, queue age) — causes (CPU, disk, restarts) go to dashboards, not pagers
- [ ] Every alert is actionable; "ignore it, it self-heals" alerts are deleted
- [ ] Every alert links to a runbook — minimum three lines: what it means, first query to run, escalation path
- [ ] Thresholds and durations justified by an SLO or historical data, not guesses
- [ ] Two severities only: **page** (user-facing, act now) and **ticket** (degradation, act this week)
- [ ] Each new alert exercised through an authorised test route: it reached the intended destination and the runbook link works, without lowering a live threshold or paging on-call by default
- [ ] No alerts that fire daily and get acknowledged without action

## Dashboards

- [ ] Applicable service health panels show the required error rate, latency, traffic or saturation signals
- [ ] Where required, dependency health shows per-service error rates and latency
- [ ] Dashboard answers the on-call questions from the top of this checklist — not "everything except the answer"
- [ ] Default time range shows enough data to answer the operational questions

## Verify the Telemetry

Exercise the applicable signals with synthetic inputs through an authorised path:

- [ ] Induced an error → found it by correlation ID and verified its entry point if several origins share the sink
- [ ] Sent test traffic → metric series appear with expected labels and sane values
- [ ] Followed one request end to end across the approved boundaries → no broken spans; verified required error retention and checked for upstream drops
- [ ] Diagnosed an induced failure from the required telemetry without reading the source

## Pre-Launch Gate

Record actual evidence for every applicable required signal. Mark unrelated service layers inapplicable with a reason. A missing or failed required signal is unmet, not inapplicable; an SDK or local diagnostic alone is not evidence of production delivery.

- [ ] Required structured logs arrive at their approved sink
- [ ] Required RED metrics are visible for the relevant endpoints and dependencies
- [ ] Required symptom-based alerts have runbooks and verified delivery through an authorised test route
- [ ] Required tracing works across authorised service boundaries with the agreed sampling policy
- [ ] When alerts apply, the responsible responder knows where the runbooks are

For launch-day monitoring sequence and rollback triggers, see the `shipping-and-launch` skill.
