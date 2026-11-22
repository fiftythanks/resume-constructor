---
name: ci-cd-and-automation
description: Automates CI/CD pipeline setup. Use when setting up or modifying build and deployment pipelines. Use when you need to automate quality gates, configure test runners in CI or establish deployment strategies.
---

# CI/CD and Automation

## Overview

Automate the approved quality gates so checks such as tests, lint, type checking and builds run consistently. Report what the pipeline actually ran and how it ended; its configuration is not proof of a passing run.

**Shift Left:** Catch problems as early in the pipeline as possible. A bug caught in linting costs minutes; the same bug caught in production costs hours. Move checks upstream — static analysis before tests, tests before staging, staging before production.

**Faster is Safer:** Smaller batches and more frequent releases reduce risk, not increase it. A deployment with 3 changes is easier to debug than one with 30. Frequent releases build confidence in the release process itself.

## When to Use

- Setting up a new project's CI pipeline
- Adding or modifying automated checks
- Configuring deployment pipelines
- When a change should trigger automated verification
- Debugging CI failures

## The Quality Gate Pipeline

For this repository, use [Verification](../../../docs/reference/verification.md), the [package scripts](../../../package.json), [hooks](../../../.husky/) and [workflow](../../../.github/workflows/tests.yml) as the authoritative sources for commands, selection and triggers. Keep frozen installs at each configured installation boundary; identify evidence by revision and lockfile. Broad `verify` is fail-fast: after a failure, later stages are unexecuted, not failed or passed. Installing Chromium does not run the disabled standalone Playwright E2E/visual step.

A PR trigger does not establish branch protection. Green CI or frozen installs do not prove a release advisory audit, hosted preview, deployment or recovery. Obtain separate evidence where required.

Example gate sequence for a service, not this repository's check inventory:

```
Pull Request Opened
    │
    ▼
┌─────────────────┐
│   LINT CHECK     │  eslint, prettier
│   ↓ pass         │
│   TYPE CHECK     │  tsc --noEmit
│   ↓ pass         │
│   UNIT TESTS     │  jest/vitest
│   ↓ pass         │
│   BUILD          │  npm run build
│   ↓ pass         │
│   INTEGRATION    │  API/DB tests
│   ↓ pass         │
│   E2E (optional) │  Playwright/Cypress
│   ↓ pass         │
│   SECURITY AUDIT │  npm audit
│   ↓ pass         │
│   BUNDLE SIZE    │  bundlesize check
└─────────────────┘
    │
    ▼
  Ready for review
```

**Keep required gates visible.** Investigate a failing lint or test check rather than disabling it. Report failed, blocked and unexecuted checks separately. Repair within the authorised scope; changes to gates, coverage or test expectations require explicit approval.

## GitHub Actions Configuration

The npm, database, E2E and provider snippets illustrate patterns for other stacks. They are not drop-in project configuration. Use the repository's native package manager, configured checks and agreed deployment target instead.

### Basic CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Security audit
        run: npm audit --audit-level=high
```

### With Database Integration Tests

```yaml
integration:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_DB: testdb
        POSTGRES_USER: ci_user
        POSTGRES_PASSWORD: ${{ secrets.CI_DB_PASSWORD }}
      ports:
        - 5432:5432
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5

  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'
    - run: npm ci
    - name: Run migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
    - name: Integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
```

> **Note:** Even for CI-only test databases, use GitHub Secrets for credentials rather than hardcoding values. This builds good habits and prevents accidental reuse of test credentials in other contexts.

### E2E Tests

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'
    - run: npm ci
    - name: Install Playwright
      run: npx playwright install --with-deps chromium
    - name: Build
      run: npm run build
    - name: Run E2E tests
      run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

## Feeding CI Failures Back to Agents

The power of CI with AI agents is the feedback loop. When CI fails:

```
CI fails
    │
    ▼
Identify the failed step and capture the specific, redacted output
    │
    ▼
Feed it to the agent:
"This check failed at the selected revision:
[redacted error and relevant context]
Diagnose it and, if authorised, fix it and run the narrow local check."
    │
    ▼
Report the fix, local check and remaining failure or evidence gap
```

**Key patterns:**

```
Lint failure → Agent inspects the rule and affected lines; uses a scoped fixer only when authorised
Type error  → Agent reads the error location and fixes the type
Test failure → Agent follows debugging-and-error-recovery skill
Build error → Agent checks config and dependencies
```

Repair and verification do not authorise a commit, push or workflow rerun. Follow the [root authority](../../../AGENTS.md#authority) and the task's scope before taking any of those actions.

## Deployment Strategies

### Preview Deployments

Where PR previews are approved, they can support manual verification. This Vercel example requires an already deployed project linked to the job's working directory, with preview as the verified target. Store `VERCEL_TOKEN` only in the protected `preview` environment and require a reviewer to approve the exact revision checked out by the job, including its workflow, before the job runs. Use an isolated runner reserved for the protected workflow, with a fixed, reviewed CLI and its dependencies pre-provisioned at the trusted path shown. The credentialed step must not install or download tooling. Do not run the job if those prerequisites cannot be enforced. A PR alone neither starts nor proves a preview here.

```yaml
# Deploy a Vercel preview from the approved PR revision
deploy-preview:
  runs-on: [self-hosted, trusted-vercel]
  if: github.event_name == 'pull_request'
  environment: preview
  steps:
    - uses: actions/checkout@v4
      with:
        ref: ${{ github.sha }}
        persist-credentials: false
    - name: Deploy preview
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      run: /opt/ci-tools/vercel/bin/vercel deploy --token "$VERCEL_TOKEN"
```

### Feature Flags

Where approved, feature flags decouple deployment from release:

- **Ship code without enabling it.** Separate deployment from exposure once the user has approved the release steps.
- **Reduce exposure without redeploying.** Disable the flag if rehearsed; this does not reverse code or data changes.
- **Canary new features.** For example, enable for 1% of users, then 10%, then 100%.
- **Run A/B tests.** Compare behaviour only when the experiment and its data collection are approved.

```typescript
// Simple feature flag pattern
if (featureFlags.isEnabled('new-checkout-flow', { userId })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

**Flag lifecycle:** Create → Enable for testing → Canary → Full rollout → Remove the flag and dead code. Flags that live forever become technical debt — set a clean-up date when you create them.

### Staged Rollouts

Illustrative sequence for an approved target. Use its actual triggers, observation window, thresholds and rehearsed recovery plan. A verified recovery trigger still calls for its assigned authorised response if other evidence is missing or a hold trigger also applies.

```
User merges reviewed change
    │
    ▼
  Staging deployment (if configured)
    │ Manual verification
    ▼
  Authorised production deployment
    │
    ▼
  Observe approved signals for the agreed window
    │
    ├── Verified recovery trigger → Escalate and take the assigned authorised recovery action
    ├── Agreed hold trigger, even with complete evidence and green advance metrics → Hold and investigate; no automatic recovery
    ├── Required evidence missing or inconclusive → Hold and investigate
    └── Required evidence complete, advance criteria met and no hold or recovery trigger → Continue as approved
```

### Rollback Plan

Before deploying, require a rehearsed, target-specific recovery path and verify affected data compatibility. This provider sketch requires a protected recovery environment and an isolated runner with the fixed, reviewed `npx` and Vercel CLI already installed. Run from the runner-provisioned trusted working directory shown below, with trusted tool paths and npm configuration, so `npx` resolves the pre-provisioned CLI, not a checkout. Create a fresh private npm cache for each job and pass its path through `GITHUB_ENV`; do not restore or reuse a runner cache. Offline mode and declining implicit installs are not proof that a populated cache cannot supply a CLI. If cache setup or export fails, stop before supplying authentication or running rollback. Supply authentication for the intended project only to the authorised rollback step, after successful setup and only if the fixed CLI is available as installed; do not share credentials with preview jobs. The input identifies a known-good Vercel deployment, not a Git ref. The workflow is not evidence of this project's target, authorisation or recovery rehearsal.

```yaml
# Manual rollback workflow
name: Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: [self-hosted, trusted-vercel-rollback]
    environment: production
    defaults:
      run:
        working-directory: /opt/ci-tools/vercel-rollback
    env:
      npm_config_offline: 'true'
      npm_config_yes: 'false'
    steps:
      - name: Prepare a private empty npm cache
        run: |
          cache_dir="$(mktemp -d "${RUNNER_TEMP:?}/rollback-npm-cache.XXXXXXXX")" || exit 1
          printf 'npm_config_cache=%s\n' "$cache_dir" >> "${GITHUB_ENV:?}"
      - name: Rollback deployment
        if: ${{ success() }}
        env:
          VERSION: ${{ inputs.version }}
        run: |
          # Deploy the specified previous version. Pass the input through env,
          # never interpolate it into the script (shell injection).
          npx vercel rollback "$VERSION"
```

## Environment Management

```
.env.example       → Committed (template for developers)
.env                → NOT committed (local development)
.env.test           → Committed (test environment, no real secrets)
CI secrets          → Stored in GitHub Secrets / vault
Production secrets  → Stored in deployment platform / vault
```

CI test jobs should never receive production secrets. Give any approved deployment job only the credentials it needs in its protected environment.

## Automation Beyond CI

### Dependabot/Renovate

Illustrative npm update policy, not an instruction to enable a bot or approve dependency changes.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

### Build Cop Role

Where the team has a Build Cop, make the CI failure owner explicit. Investigate and propose a fix or revert; the role does not grant authority to change gates, revert or push.

### PR Checks

- **Required reviews:** Identify the review required by project policy; CI does not replace it.
- **Required status checks:** Preserve approved gates and report their actual results.
- **Branch protection:** Where applicable, inspect effective repository settings, including bypasses, and available enforcement evidence: failing required statuses must block merges and `main` must reject force-pushes. A review-only rule, workflow trigger or green status proves neither. Use read-only evidence; do not attempt a merge or force-push to check.
- **Merge:** The user merges. Do not enable auto-merge or merge because checks passed.

## CI Optimisation

When measured CI time exceeds an agreed target, identify the bottleneck. Consider the following options without changing required coverage or gates:

```
Slow CI pipeline?
├── Cache dependencies
│   └── Use the setup-node cache option (or actions/cache) for the package manager cache, not node_modules
├── Run jobs in parallel
│   └── Split lint, typecheck, test, build into separate parallel jobs
├── Only run what changed
│   └── Filter only demonstrably unrelated jobs, subject to the approved check scope
├── Use matrix builds
│   └── Shard test suites across multiple runners
├── Optimise the test suite
│   └── Remove avoidable work; changing when required tests run needs approval
└── Use larger runners
    └── GitHub-hosted larger runners or self-hosted for CPU-heavy builds
```

**Example: caching and parallelism**

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm test -- --coverage
```

## Common Rationalisations

| Rationalisation                   | Reality                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| "CI is too slow"                  | Measure the bottleneck and optimise it (see CI Optimisation), rather than bypassing the gate.                |
| "This change is trivial, skip CI" | Small changes can break builds. Apply the configured checks for the approved scope.                          |
| "The test is flaky, just re-run"  | Flaky tests mask real bugs and waste everyone's time. Fix the flakiness.                                     |
| "We'll add CI later"              | Report the risk when approved gates lack enforcement; adding or changing a pipeline requires scope approval. |
| "Manual testing is enough"        | Manual testing doesn't scale and isn't repeatable. Automate what you can.                                    |

## Red Flags

- Required checks have no reliable execution evidence
- CI failures ignored or silenced
- Tests disabled in CI to make the pipeline pass
- Required deployment verification missing
- No evidence for the required recovery plan
- Secrets stored in code or CI config files (not secrets manager)
- Measured CI time exceeds the agreed target without investigation

## Verification

After an authorised CI change, record the revision, triggers and the evidence each check actually supplied:

- [ ] Configured checks ran for the intended events; failures stopped dependent stages and remained visible
- [ ] Required gates and coverage are unchanged or explicitly approved; blocked and unexecuted stages are reported separately
- [ ] Where branch protection applies, read-only settings and available enforcement evidence establish that failing required statuses block merge and `main` rejects force-pushes; missing evidence is recorded as unmet
- [ ] Feedback includes the failed step and redacted details without triggering unapproved remote actions
- [ ] Secrets are stored in the secrets manager, not in code, and unavailable to untrusted or unrelated jobs
- [ ] Any deployment and recovery claims have separate target-specific evidence
- [ ] Checked actual timings against the agreed budget, if any
