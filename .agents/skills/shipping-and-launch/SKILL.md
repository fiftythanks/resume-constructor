---
name: shipping-and-launch
description: Prepares production launches. Use when preparing to deploy to production, or when asking what needs to be in place before shipping. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout or when you need a rollback strategy.
---

# Shipping and Launch

## Overview

The goal is a safe release with clear success criteria, applicable monitoring and a rehearsed recovery plan. A readiness assessment ends with a technical recommendation; it does not deploy, roll back, merge or publish.

## When to Use

- Deploying a feature to production for the first time
- Releasing a significant change to users
- Migrating data or infrastructure
- Opening a beta or early access programme
- Assessing readiness for a named change and release target

Identify the change/base and intended target. Use [Verification](../../../docs/reference/verification.md) and [orchestration](../../references/orchestration-patterns.md) as in [`/ship`](../../commands/ship.md). Reuse independent code-review evidence only if it still covers the selected state. Required review needs a satisfactory outcome with no unresolved required findings. An adverse verdict does not clear the gate by existing; record any explicit release-specific waiver as a waiver of the unmet gate, not as technical approval. Seek additional test or security perspectives only for actual risks or evidence gaps; direct inspection does not satisfy a required independent pass.

Report the selected state, evidence, blockers, recommended fixes, accepted risks and target-specific recovery. Mark each applicable check evidenced, failed or blocked; give reasons for genuinely inapplicable checks. Recommend technical `NO-GO` if the target or required recovery proof is missing, or if an applicable gate is unmet without an explicit release-specific waiver. Otherwise recommend technical `GO`. Report local acceptance and publication authority separately: technical readiness grants neither.

## The Pre-Launch Checklist

Apply approved checks to the named release. Generic service examples do not authorise new infrastructure, telemetry, flags, SLOs or rollout thresholds.

### Code Quality

- [ ] Applicable tests, builds and static checks required for this checkpoint passed. Require a warning-free build unless the user explicitly approved a different warning policy for the target. Assessing a warning does not satisfy the gate: resolve warnings that breach the policy and produce a matching passing build, or record an explicit release-specific waiver of the unmet gate, not a pass. Record failed and unexecuted checks separately.
- [ ] Required independent review covers this state and has a satisfactory outcome with no unresolved required findings; findings, limitations and any explicit release waiver are recorded separately
- [ ] No `TODO` comments that should be resolved before launch
- [ ] No `console.log` debugging statements in production code
- [ ] Error handling covers expected failure modes

### Security

- [ ] No secrets in code or version control
- [ ] Matching native dependency advisory audit evidence for every installation boundary this release involves shows no critical or high vulnerabilities
- [ ] Input validation on all user-facing endpoints
- [ ] Authentication and authorisation checks in place
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Rate limiting on authentication endpoints
- [ ] CORS configured to specific origins (not wildcard)

Bind audit evidence to the release dependency state and relevant lockfiles. An app-only release needs evidence for its app install; if the release involves both app and documentation installs, an app report alone is insufficient. A frozen install or green CI run is not an audit. Record advisory severity separately from reachability, including unknown reachability. A non-reachable critical or high advisory still fails the gate. If the user expressly waives that gate for this release, record the waiver, accepted risk and mitigation; do not mark the audit clean or treat permission to triage as a waiver.

### Performance

- [ ] Assess Core Web Vitals against any approved release budget. Use the [industry bands](../../references/performance-checklist.md#core-web-vitals-targets) for diagnosis, not as a release gate. If evidence required by a budget is missing, report the check as unmet.
- [ ] No N+1 queries in critical paths
- [ ] Images optimised (compression, responsive sizes, lazy loading)
- [ ] Bundle size within budget
- [ ] Database queries have appropriate indexes
- [ ] Caching configured for static assets and repeated queries

### Accessibility

Use [Accessibility](../../../docs/reference/accessibility.md) for the editor and preview's WCAG 2.2 AA target. If standard preview/export parity is affected, compare the actual preview and PDF for selected content, typography, geometry, line wrapping and pagination under [Product](../../../docs/reference/product.md#previewexport-parity). Web checks establish neither exported-PDF accessibility nor ATS compatibility.

- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader can convey page content and structure
- [ ] Colour contrast meets the applicable WCAG 2.2 AA criteria
- [ ] Focus management correct for modals and dynamic content
- [ ] Error messages are descriptive and associated with form fields
- [ ] Applicable manual accessibility checks pass and their outcomes are recorded. No unresolved applicable automated accessibility warnings or violations: confirm clearance with a matching rerun or provide evidence of inapplicability. An automated pass does not establish web conformance or verify PDF output.

### Infrastructure

- [ ] Environment variables set in production
- [ ] Database migrations applied (or ready to apply)
- [ ] DNS and SSL configured
- [ ] CDN configured for static assets
- [ ] Required diagnostics have observed output at their approved destination; no production delivery inferred from local output or installed tooling
- [ ] Health check endpoint exists and responds

### Documentation

- [ ] `README` updated with any new setup requirements
- [ ] API documentation current
- [ ] ADRs written for any architectural decisions
- [ ] Changelog updated
- [ ] User-facing documentation updated (if applicable)

## Feature Flag Strategy

Where an approved flag is appropriate, use it to decouple deployment from exposure. This illustration uses a service's existing flag lookup and UI:

```typescript
// Feature flag check
const flags = await getFeatureFlags(userId);

if (flags.taskSharing) {
  // New feature: task sharing
  return <TaskSharingPanel task={task} />;
}

// Default: existing behavior
return null;
```

**Example flag lifecycle** (use the target's agreed cohorts and signals):

```
1. DEPLOY with flag OFF     → Code is in production but inactive
2. ENABLE for team/beta     → Internal testing in production environment
3. GRADUAL ROLLOUT          → 5% → 25% → 50% → 100% of users
4. MONITOR at each stage    → Watch error rates, performance, user feedback
5. CLEAN UP                 → Remove flag and dead code path after full rollout
```

**Rules:**

- Every feature flag has an owner and an expiration date
- Agree when to remove the flag and obsolete code after full rollout
- Don't nest feature flags (creates exponential combinations)
- Test both flag states in CI where applicable. Manual checks can supplement but do not replace the required CI evidence.

## Staged Rollout

### The Rollout Sequence

Example for a target with staging, flags and approved production signals. Use that target's actual verification, cohorts and dwell times instead of copying the example.

```
1. DEPLOY to staging
   └── Run the agreed staging checks
   └── Manual smoke test of critical flows

2. DEPLOY to production (feature flag OFF)
   └── Verify any required team notification at the agreed deployment step
   └── Run the target's deployment and health checks
   └── Check the approved error signal against the agreed criteria

3. ENABLE for team (flag ON for internal users)
   └── Team uses the feature in production
   └── 24-hour monitoring window

4. CANARY rollout (flag ON for 5% of users)
   └── Monitor error rates, latency and user behaviour
   └── Evaluate absolute criteria directly and compare with a baseline for relative criteria
   └── 24–48 hours of monitoring
   └── Advance only if the target's agreed criteria are met

5. GRADUAL increase (25% -> 50% -> 100%)
   └── Same monitoring at each step
   └── Apply the action specified for any breached trigger

6. FULL rollout (flag ON for all users)
   └── Monitor for 1 week
   └── Clean up feature flag
```

### Rollout Decision Thresholds

At each stage apply the target's agreed advance, hold and recovery rules. Check absolute thresholds directly, including on a first release. Require a comparable baseline only for a relative or delta criterion, and sufficient observations for each required criterion. If required evidence is missing, hold and investigate; do not report the signal as normal or defer action on an already verified breach. The table illustrates drift criteria for a service with usable baselines and approved signals; its numbers and actions are not defaults.

| Metric           | Advance (green)          | Hold and investigate (yellow)        | Roll back (red)                 |
| ---------------- | ------------------------ | ------------------------------------ | ------------------------------- |
| Error rate       | Up to 10% above baseline | >10% to 100% above baseline          | >100% above baseline            |
| P95 latency      | Up to 20% above baseline | >20% to 50% above baseline           | >50% above baseline             |
| Client JS errors | No new error types       | New errors in up to 0.1% of sessions | New errors in >0.1% of sessions |
| Business metrics | Neutral or positive      | Decline up to 5%                     | Decline >5%                     |

### When to Roll Back

During an authorised rollout, stop advancing when an agreed hold or recovery trigger is breached. Apply the action the target specifies. Act on a verified absolute breach or an independent recovery signal, such as a confirmed data-integrity issue, without waiting for a baseline or unrelated observations. Escalate and follow the rehearsed recovery or incident procedure under the target's authority rather than assuming a rollback is safe.

## Monitoring and Observability

### What to Monitor

Select approved signals that answer the target's operational questions. The examples below are a menu for a service, not required collection. Record unavailable required signals as unmet.

```
Application metrics:
├── Error rate (total and by endpoint)
├── Response time (p50, p95, p99)
├── Request volume
├── Active users
└── Key business metrics (conversion, engagement)

Infrastructure metrics:
├── CPU and memory utilisation
├── Database connection pool usage
├── Disk space
├── Network latency
└── Queue depth (if applicable)

Client metrics:
├── Core Web Vitals (LCP, INP, CLS)
├── JavaScript errors
├── API error rates from client perspective
└── Page load time
```

### Error Reporting

These React and Express illustrations assume an existing, authorised `reportError` sink that accepts the shown event records without automatic error, user or request enrichment and handles delivery failures without disrupting recovery. They are not project integrations. In React, keep the app's local `ErrorFallback` and pass only the bounded render-failure event:

```tsx
// React error boundary with an application-provided ErrorFallback
class ErrorBoundary extends React.Component<React.PropsWithChildren> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    reportError({ event: 'react_render_failed' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback onRetry={() => this.setState({ hasError: false })} />
      );
    }
    return this.props.children;
  }
}
```

In Express, install the [request-ID middleware](../observability-and-instrumentation/SKILL.md#3-structured-logging) before the routes and register this error handler after them. The app's `Request` type includes `id`, populated by that middleware, not from caller input. This example handles failures before the response starts.

```typescript
// Express error middleware; keep four arguments so Express recognises it.
app.use((_err: unknown, req: Request, res: Response, _next: NextFunction) => {
  reportError({
    event: 'request_failed',
    status: 500,
    requestId: req.id,
  });

  // Don't expose internals to users
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
});
```

### Post-Launch Verification

After an authorised launch, verify the critical flow and applicable signals during the agreed observation window. Example checks for a service with those capabilities:

```
1. Check the target's health signal
2. Check approved error signals against their agreed criteria and triggers
3. Check approved latency signals against their agreed criteria; use a baseline only for delta checks
4. Test the critical user flow manually
5. Check required logs arrive and are readable at their approved destination
6. Confirm the rehearsed recovery path is still ready; do not roll back a live service just to test it
```

## Error Budget Release Gate

If the target has an approved SLO and error-budget policy, apply that policy as a release gate. The example below illustrates actions at different remaining budgets, not a default policy:

```
Budget remaining > 20%  →  Ship normally; monitor closely
Budget remaining above 0%, up to 20% → Slow rollouts only; no high-risk changes
Budget exhausted        →  Freeze feature work; focus entirely on reliability
Budget resets           →  Resume normal pace; bake in the fix that recovered it
```

If the agreed canary burn-rate trigger is breached, take the specified action even when point-in-time error rates are green. Check an absolute burn-rate threshold without requiring a historical baseline. Missing required budget or burn-rate evidence is not a pass.

## Rollback Strategy

Require real recovery evidence for the intended target before recommending `GO`. Identify the recovery action, responsible operator, affected artefact and configuration and the evidence from a representative rehearsal. Running `git revert` and `git push` changes source history but does not establish which artefact is serving or recover data written by the new version. Check old/new data compatibility and recovery of affected data in the rehearsal. If reverting would be unsafe, require a verified forward recovery path. Report timing only when observed and identify what the rehearsal did not cover.

```markdown
## Rollback Plan for [Feature/Release]

### Trigger Conditions

- Agreed breach or incident trigger and the operator who decides whether to hold or recover

### Recovery Steps

1. Use the rehearsed action for this failure: disable the flag, restore the known-good deployed artefact and configuration or apply the approved forward recovery.
2. Verify the serving artefact, critical user flow, relevant signals and affected data. A healthy endpoint alone does not prove recovery.
3. Notify the responsible team and record the outcome.

### Data Considerations

- Verify the recovery version can read and write the affected schema and data, including writes made after release.
- If data must be restored, migrated or reconciled, cite the rehearsed procedure and evidence of integrity.

### Timing

- Record observed time to restore service and affected data in the rehearsal, with environment and limitations.
```

## See Also

- For the project-wide Definition of Done that every change must clear before this checklist, see the [canonical verification reference](../../../docs/reference/verification.md#definition-of-done)
- For security pre-launch checks, see `../../references/security-checklist.md`
- For performance pre-launch checklist, see `../../references/performance-checklist.md`
- For accessibility verification before launch, see `../../references/accessibility-checklist.md`
- For the alerting rules and SLO-tied thresholds, see `observability-and-instrumentation`

## Common Rationalisations

| Rationalisation                                  | Reality                                                                                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "It works in staging, it'll work in production"  | Staging is not proof of production behaviour. Verify the critical flow and applicable signals after an authorised launch.                                                      |
| "We don't need feature flags for this"           | Assess the recovery path for this change. An approved flag can reduce exposure, but an unrelated flag adds complexity and does not recover data.                               |
| "Monitoring is overhead"                         | Use existing evidence first. A required signal without verified output leaves a readiness gap.                                                                                 |
| "We'll add monitoring later"                     | Verify the approved visibility the release requires before launch. Do not add collection merely to satisfy an example checklist.                                               |
| "Rolling back is admitting failure"              | Rolling back is responsible engineering. Shipping a broken feature is the failure.                                                                                             |
| "The error rate looks fine, let's keep shipping" | Apply the agreed triggers and their specified actions, including burn rate if required. Missing evidence blocks advance; a baseline is required only for a relative criterion. |

## Red Flags

- No rehearsed recovery for the selected target or no evidence of affected data compatibility
- Required monitoring or error reporting has no evidence of output at the approved destination
- Advancing without required staging evidence or despite an agreed hold or recovery trigger
- Feature flags with no expiration or owner
- No assigned observer for the agreed rollout window
- Production environment configuration done by memory, not code
- "It's Friday afternoon, let's ship it"
- An applicable error-budget policy calls for a hold but the rollout continues

## Verification

For the readiness recommendation:

- [ ] Applicable pre-launch gates evidenced, including the [accessibility gate](#accessibility), satisfactory required independent review and matching, successful builds without warnings unless the user explicitly approved a different build warning policy for the target. Missing required evidence or an open applicable failure leaves a gate unmet. Record failures, blockers, unexecuted checks and evidence of inapplicability separately. Only the user can explicitly waive an unmet gate for this release; record it as waived, not passed.
- [ ] Feature flag configured and both states tested in CI where applicable; manual checks do not replace required CI tests
- [ ] Target-specific recovery rehearsed, including affected data and verification of restored service
- [ ] Required signals and responsible observers verified for the agreed window; any required notification has an owner, recipients, channel and timing established before authorised deployment. Readiness alone does not trigger notification.
- [ ] Technical recommendation and human authority reported separately

At and after a separately authorised deployment:

- [ ] Any required deployment notification actually reached the agreed recipients at the required step
- [ ] Target health checks and the critical user flow work
- [ ] Required signals are arriving and meet the agreed advance criteria; use suitable baselines only for relative or delta criteria
- [ ] Recovery remains ready; applied the target's specified action for each verified trigger, including absolute breaches and independent recovery signals; held advance where required evidence was missing
- [ ] Where an error-budget policy applies, its specified actions and thresholds are known and followed
