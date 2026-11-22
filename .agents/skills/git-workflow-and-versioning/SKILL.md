---
name: git-workflow-and-versioning
description: Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, splitting uncommitted work in a messy working tree into clean atomic commits, opening or reviewing a pull request (PR), pushing to a remote, or when you need to organize work across multiple parallel streams. Use when cutting a release, choosing a semantic version bump, tagging, or writing a changelog. Use when asked to write a commit message or a changelog entry for a change, or to split a change into commits, even when the diff is pasted inline and the message seems easy to write from it.
---

# Git Workflow and Versioning

## Overview

Git is your safety net. Treat commits as save points, branches as sandboxes, and history as documentation. With AI agents generating code at high speed, disciplined version control is the mechanism that keeps changes manageable, reviewable, and reversible.

## When to Use

Always. Every code change flows through git.

A request for a commit message, version recommendation or changelog entry is a request for that output, not authorisation to stage, commit, tag, push, publish or merge. For implementation, follow the approved scope and the [root authority](../../../AGENTS.md#authority) for atomic local commits, independent review, local acceptance and publication. The user merges into `main`.

## Core Principles

### Trunk-Based Development (Recommended)

Keep `main` always deployable. Prefer short-lived feature branches and aim for integration within 1–3 days when the change is ready and the review and acceptance gates are met. Long-lived development branches are hidden costs — they diverge, create merge conflicts and delay integration. DORA research consistently shows trunk-based development correlates with high-performing engineering teams.

```
main ──●──●──●──●──●──●──●──●──●──  (always deployable)
        ╲      ╱  ╲    ╱
         ●──●─╱    ●──╱    ← short-lived feature branches
```

This is the recommended default. Teams using gitflow or long-lived branches can adapt the principles (atomic commits, small changes, descriptive messages) to their branching model — the commit discipline matters more than the specific branching strategy.

- **Dev branches are costs.** Every day a branch lives, it accumulates merge risk.
- **Release branches are acceptable.** When you need to stabilize a release while main moves forward.
- **Feature flags > long branches.** Prefer deploying incomplete work behind flags rather than keeping it on a branch for weeks.

### 1. Commit Early, Commit Often

Commit each independently verifiable increment with its related tests after focused verification. Avoid accumulating unrelated uncommitted changes.

```
Work pattern:
  Failing test for changed behaviour → Implement → Verify → Commit → Next slice

Not this:
  Implement everything → Hope it works → Giant commit
```

Commits are save points. Use the last known-good state to investigate a broken increment without discarding other work.

### 2. Atomic Commits

Each commit does one logical thing and includes the tests that establish it. The following task-service history is illustrative:

```
# Good: Each commit is self-contained
git log --oneline
a1b2c3d feat: create tasks with validation and tests
d4e5f6a fix: restore sidebar focus with regression test

# Bad: Everything mixed together
git log --oneline
x1y2z3a Add task feature, fix sidebar, update deps, refactor utils
```

### 3. Descriptive Messages

Commit messages explain the _why_, not just the _what_:

```
# Good: Explains intent
feat: add email validation to registration endpoint

Prevents invalid email formats from reaching the database.
Uses Zod schema validation at the route handler level,
consistent with existing validation patterns in auth.ts.

# Bad: Describes what's obvious from the diff
update auth.ts
```

**Format:**

```
<type>: <short description>

<optional body explaining why, not what>
```

**Types:**

- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code change that neither fixes a bug nor adds a feature
- `test` — Adding or updating tests
- `docs` — Documentation only
- `chore` — Tooling, dependencies, config

### 4. Keep Concerns Separate

Keep formatting-only changes separate from behaviour changes. Separate refactors and features when each has an independently verifiable outcome:

```
# Good: Separate concerns when both checkpoints work
refactor: extract shared validation
feat: validate phone numbers with regression tests

# Bad: Mix independent concerns
refactor validation and reformat unrelated views
```

Keep a refactor with the feature when separating it would break an authorised checkpoint. Small related clean-ups (renaming a variable) can be included at reviewer discretion.

### 5. Size Your Changes

Use line counts as prompts, not limits. Split before submitting when you can name distinct outcomes and verify each without breaking the authorised contract at either checkpoint. Keep an indivisible cutover together with its callers and tests, even above 1,000 lines; do not leave broken callers or add a temporary shim just to split it. If size prevents review of something specific, identify that gap. See [Change Sizing](../code-review-and-quality/SKILL.md#change-sizing) for splitting strategies.

```
~100 lines  → Easy to review, easy to revert
~300 lines  → Acceptable for a single logical change
~1000 lines → Inspect for independently verifiable outcomes or concrete review gaps
```

## Branching Strategy

### Feature Branches

```
main (always deployable)
  │
  ├── feature/task-creation    ← One feature per branch
  ├── feature/user-settings    ← Parallel work
  └── fix/duplicate-tasks      ← Bug fixes
```

- Branch from `main` (or the team's default branch)
- Keep branches short-lived; integrate only after the required checks, independent review and local acceptance. The user merges into `main`.
- Clean up owned topic branches after merge, once no work depends on them.
- Prefer feature flags over long-lived branches for incomplete features

### Branch Naming

```
feature/<short-description>   → feature/task-creation
fix/<short-description>       → fix/duplicate-tasks
chore/<short-description>     → chore/update-deps
refactor/<short-description>  → refactor/auth-module
```

## Working with Worktrees

For parallel AI agent work, use git worktrees to run multiple branches simultaneously:

Illustrative example with existing topic branches:

```bash
# Create a worktree for a feature branch
git worktree add ../project-feature-a feature/task-creation
git worktree add ../project-feature-b feature/user-settings

# Each worktree is a separate directory with its own branch
# Agents can work in parallel without interfering
ls ../
  project/              ← main branch
  project-feature-a/    ← task-creation branch
  project-feature-b/    ← user-settings branch

# After integration, remove only your clean, no-longer-needed worktree
git worktree remove ../project-feature-a
```

Benefits:

- Multiple agents can work on different features simultaneously
- No branch switching needed (each directory has its own branch)
- An isolated experiment can be abandoned without changing another checkout; first account for all work in the worktree.
- Changes are isolated until explicitly merged

## The Save Point Pattern

```
Agent starts work
    │
    ├── Makes a change
    │   ├── Checks pass? → Commit the coherent increment → Continue
    │   └── Checks fail? → Isolate the increment → Investigate
    │
    ├── Makes another change
    │   ├── Checks pass? → Commit the coherent increment → Continue
    │   └── Checks fail? → Isolate the increment → Investigate
    │
    └── Feature complete → All commits form a clean history
```

Use an owned scratch worktree when you need to reproduce the last known-good state. In a shared checkout, inspect ownership before staging or undoing anything; preserve unrelated staged and unstaged changes and untracked files. Discard only your own separable changes when authorised. If ownership is inseparable or uncertain, or another staged change would be included in your commit, stop rather than resetting, stashing or cleaning other work.

## Change Summaries

After any modification, provide a structured summary. This makes review easier, documents scope discipline, and surfaces unintended changes:

```
CHANGES MADE:
- src/routes/tasks.ts: Added validation middleware to POST endpoint
- src/lib/validation.ts: Added TaskCreateSchema using Zod

THINGS I DIDN'T TOUCH (intentionally):
- src/routes/auth.ts: Has similar validation gap but out of scope
- src/middleware/error.ts: Error format could be improved (separate task)

POTENTIAL CONCERNS:
- The Zod schema is strict — rejects extra fields. Confirm this is desired.
- Added zod as a dependency (72KB gzipped) — already in package.json
```

This pattern catches wrong assumptions early and gives reviewers a clear map of the change. The "DIDN'T TOUCH" section is especially important — it shows you exercised scope discipline and didn't go on an unsolicited renovation.

## Pre-Commit Hygiene

Before every commit:

```bash
# 1. Check what you're about to commit
git diff --staged

# 2. Flag likely secret names for inspection; an empty result does not prove absence
git diff --staged -i -G'password|secret|api_key|token' --name-only
```

Inspect the actual staged content for secrets and unrelated changes. Do not commit while a discovered credential or other secret remains staged. Use [Checks and local review](../../../CONTRIBUTING.md#checks-and-local-review), [`package.json`](../../../package.json) and [Verification](../../../docs/reference/verification.md) to select the focused checks for the changed behaviour and callers. Use the native non-interactive Vitest command for test evidence when needed and the standalone type check when types are the question. Reserve broad verification for the applicable review and pre-push gates; do not make it a per-edit check.

Use the existing hooks: [`pre-commit`](../../../.husky/pre-commit) runs the configured `lint-staged` fixers and related checks; [`commit-msg`](../../../.husky/commit-msg) enforces the message rules in [`commitlint.config.ts`](../../../commitlint.config.ts); [`pre-push`](../../../.husky/pre-push) runs broad verification. Review the intended staged contents and any hook mutations. Hooks do not replace change-specific evidence or authorise a push.

## Handling Generated Files

- **Commit generated files** only if the project expects them (e.g., `package-lock.json`, Prisma migrations)
- **Don't commit** build output (`dist/`, `.next/`), environment files (`.env`), or IDE config (`.vscode/settings.json` unless shared)
- **Have a `.gitignore`** that covers: `node_modules/`, `dist/`, `.env`, `.env.local`, `*.pem`

## Using Git for Debugging

Illustrative Git diagnostics — run checkout-changing investigation such as bisection in an owned scratch worktree, not over shared edits:

```bash
# Find which commit introduced a bug
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
# Git checkouts midpoints; run your test at each to narrow down

# View what changed recently
git log --oneline -20
git diff HEAD~5..HEAD -- src/

# Find who last changed a specific line
git blame src/services/task.ts

# Search commit messages for a keyword
git log --grep="validation" --oneline
```

## Release & Versioning

Commits are how _you_ track change; a **version** is how your _consumers_ track a release. Identify the specific released surface, its declared version policy and the consumers that rely on it. A manifest version or the presence or absence of tags does not establish a policy or tell you who uses the surface. A closed internal cutover with no relevant release promise does not imply a public version bump.

### Semantic Versioning

On a declared stable [SemVer](https://semver.org/spec/v2.0.0.html#semantic-versioning-specification-semver) surface, use `MAJOR.MINOR.PATCH`:

```
  MAJOR  incompatible public contract change, including removal of a supported field
  MINOR  backwards-compatible public addition or public deprecation
  PATCH  backwards-compatible bug fix only
```

Check actual consumer types, decoding and observable behaviour before recommending a bump (Hyrum's Law — see the `api-and-interface-design` skill). Unknown compatibility calls for investigation, not an automatic major or a compatibility promise. Warn consumers of confirmed breakage even when the diff is small.

### Identify the published release

A published version is immutable. Keep the version, artefact and changelog aligned with the project's established release source. If the workflow uses release tags, make the version identifiable from the tag and keep it consistent with the artefact; derive a version from a tag only if that is the established mechanism.

Illustration for a tag-based workflow, not steps for a version recommendation or this project's PR checks. Run tagging or publication steps only when separately authorised:

```bash
git tag -a v1.4.0 -m "Release 1.4.0"
git push origin v1.4.0
```

A recommendation does not establish a release mechanism or permit tagging, pushing or merging.

### Keep a changelog written for humans

A changelog is not `git log`. It's the curated, consumer-facing answer to "what changed and do I care?" — grouped by `Added / Changed / Fixed / Deprecated / Removed / Security`, newest on top, every entry phrased around user impact, not internal mechanics.

Illustrative changelog: `./guides/task-list-migration.md` is the relative link to the example project's migration guide, not a file in this repository.

```markdown
## [1.4.0] - 2025-06-12

### Added

- Bulk task import via CSV

### Fixed

- Timezone drift in recurring task due dates

### Deprecated

- `GET /v1/tasks/all` — switch to the paginated `GET /v1/tasks`; see the [task-list migration guide](./guides/task-list-migration.md).
```

Write the entry in the same change that makes the change, while the impact is fresh — not reconstructed from commit archaeology at release time. For a consumer-facing migration, summarise the impact and link to the single procedure prepared with the `deprecation-and-migration` skill. State removal terms only when approved; a version recommendation does not create a deprecation window. [`/ship`](../../commands/ship.md) assesses release readiness separately without deploying or publishing.

## Common Rationalizations

| Rationalization                             | Reality                                                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "I'll commit when the feature is done"      | Commit each independently verifiable outcome with its tests. Keep a single indivisible cutover together.                                                     |
| "The message doesn't matter"                | Messages are documentation. Future you (and future agents) will need to understand what changed and why.                                                     |
| "I'll squash it all later"                  | Squashing destroys the development narrative. Prefer clean incremental commits from the start.                                                               |
| "Branches add overhead"                     | Short-lived branches isolate work and reduce divergence. Aim for prompt integration without bypassing review and acceptance.                                 |
| "I'll split this change later"              | Split independent outcomes before submitting, not after. Keep indivisible outcomes together and name any concrete review gap.                                |
| "I don't need a .gitignore"                 | Until `.env` with production secrets gets committed. Set it up immediately.                                                                                  |
| "It's just a small fix, bump the patch"     | Check what consumers rely on. An incompatible change to a stable SemVer public contract is major regardless of diff size; investigate unknown compatibility. |
| "The changelog is just the commit log"      | Commits are for you; the changelog is for consumers, curated by impact. Generating one from raw commits buries what matters.                                 |
| "We'll write the changelog at release time" | By then the impact is reconstructed from memory and half of it is missing. Write the entry with the change.                                                  |

## Red Flags

- Unrelated changes accumulating, or one outcome split from its tests or callers
- Commit messages like "fix", "update", "misc"
- Formatting changes mixed with behavior changes
- No `.gitignore` in the project
- Committing `node_modules/`, `.env`, or build artifacts
- Long-lived branches that diverge significantly from main
- Force-pushing to shared branches
- Wholesale rollback in a shared checkout or commit actions on advice-only requests
- A breaking public change shipped under a minor or patch version on a stable SemVer surface
- Release metadata out of sync with the declared version source, including tags when that workflow uses them
- A user-facing release with no changelog entry, or a changelog that's just dumped commit messages

## Verification

For every commit:

- [ ] Commit does one coherent thing with its relevant tests; any split leaves verifiable, functional checkpoints.
- [ ] Message explains why and follows the configured Conventional Commit rules.
- [ ] Focused checks for the changed contract pass, and any staged fixer changes have been reviewed.
- [ ] Staged contents have been inspected and contain only intended work and no secrets; unrelated staged, unstaged and untracked work is preserved.
- [ ] No formatting-only changes mixed with behavior changes
- [ ] `.gitignore` covers standard exclusions

For a version recommendation or release:

- [ ] The specific surface, policy and affected consumers are identified. On a stable SemVer surface, the recommendation distinguishes incompatible changes, compatible public additions or deprecations and compatible fixes; unresolved compatibility is reported.
- [ ] For an authorised release, the artefact, release reference and changelog agree with the established workflow. Published versions are not rewritten.
- [ ] The applicable changelog is curated by consumer impact and points to the migration procedure where needed. Version advice is not release authority; readiness, local acceptance, publication and merge remain separate.
