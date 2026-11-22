---
name: deprecation-and-migration
description: Manages deprecation and migration. Use when removing old systems, APIs or features. Use when migrating users from one implementation to another. Use when migrating a database schema in production, such as renaming or dropping a column without downtime (expand/contract). Use when deciding whether to maintain or sunset existing code.
---

# Deprecation and Migration

## Overview

Code is a liability, not an asset. Every line of code has ongoing maintenance cost — bugs to fix, dependencies to update, security patches to apply and new engineers to onboard. Deprecation is the discipline of removing code that no longer earns its keep, and migration is the process of moving users safely from the old to the new.

Most engineering organisations are good at building things. Few are good at removing them. This skill addresses that gap.

## When to Use

- Replacing an old system, API or library with a new one
- Sunsetting a feature that's no longer needed
- Consolidating duplicate implementations
- Removing dead code that nobody owns but everybody depends on
- Planning the lifecycle of a new system (deprecation planning starts at design time)
- Deciding whether to maintain a legacy system or invest in migration

## Core Principles

### Code Is a Liability

Every line of code has ongoing cost: it needs tests, documentation, security patches, dependency updates and mental overhead for anyone working nearby. The value of code is the functionality it provides, not the code itself. When the same functionality can be provided with less code, less complexity or better abstractions — the old code should go.

### Hyrum's Law Makes Removal Hard

With enough users, every observable behaviour becomes depended on — including bugs, timing quirks and undocumented side effects. An announcement does not migrate affected consumers. Users cannot "just switch" when they depend on behaviour the replacement does not replicate.

### Deprecation Planning Starts at Design Time

When building something new, ask: "How would we remove this in 3 years?" Systems designed with clean interfaces, feature flags and minimal surface area are easier to deprecate than systems that leak implementation details everywhere.

## The Deprecation Decision

Before deprecating anything, answer these questions:

```
1. Does this system still provide unique value?
   → Identify what consumers would lose. Weigh that value against the cost and risk of keeping it.

2. Who depends on it and can they cut over together?
   → Identify affected callers, deployed versions, readers and writers. Separate confirmed use from unknown use.

3. Is this a closed cutover, an approved retirement without replacement or a change with independently upgrading consumers?
   → Update all callers together for a closed cutover. For retirement without replacement, get explicit approval for what stops working. Where consumers cannot move together, plan compatible overlap while the old surface is supported.

4. What's the migration cost for each consumer?
   → If trivially automated, do it. If manual and high-effort, weigh against maintenance cost.

5. What's the ongoing maintenance cost of NOT deprecating?
   → Security risk, engineer time, opportunity cost of complexity.
```

Follow the [root authority](../../../AGENTS.md#authority) for the scope, consumer commitments, irreversible steps and required reviews. The migration plan must identify the evidence required before removal, not just the intended end state.

## Compulsory vs Advisory Deprecation

| Type           | When to Use                                                                          | Mechanism                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Advisory**   | Migration is optional, old system is stable                                          | Warnings, documentation, nudges. Users migrate on their own timeline.                                                                             |
| **Compulsory** | Old system has security issues, blocks progress or maintenance cost is unsustainable | Approved end-of-support terms, with a deadline if needed. Provide concrete instructions and support, and tooling where it reduces migration cost. |

**Default to advisory** when independently upgrading consumers can continue to use a stable old surface. Use compulsory deprecation only when the maintenance cost or risk justifies it. A deadline is not evidence that consumers have migrated. A closed cutover does not need an advisory period or a retirement date.

## The Migration Process

### Step 1: Verify the Replacement or Retirement Plan

If replacing the system, verify that the alternative covers critical use cases and deliberate contract behaviour. Match the evidence to the risk: check a closed change with its affected callers; for a risky rollout, validate the replacement under representative conditions and obtain production evidence where needed before withdrawing the old surface.

For an approved retirement without replacement, identify who loses what and verify the agreed handling of affected consumers and data.

### Step 2: Announce and Document

For an independently upgrading audience, publish one migration procedure for the affected surface and link to it from release communication. State the actual affected callers, replacement or retirement and order of changes. For each caller, name the actual check or evidence and the expected result; if evidence is unavailable, say what remains unverified. Include configuration examples or tooling when needed and removal terms only when agreed. For a closed cutover, keep the caller changes and verification with the implementation; update the current references without inventing a public notice.

Cross-stack illustration — adapt the notice to the actual task:

```markdown
## Deprecation Notice: OldService

**Status:** Deprecated as of 2025-03-01
**Replacement:** NewService (see migration guide below)
**Removal date:** Advisory — no hard deadline yet
**Reason:** OldService requires manual scaling and lacks observability.
NewService handles both automatically.

### Migration Guide

1. Replace `import { client } from 'old-service'` with `import { client } from 'new-service'`
2. Update the configuration required by NewService, using the project's configuration reference.
3. For each changed caller, verify its expected behaviour against NewService using a check or evidence specific to that caller. Name the actual caller, check or evidence and expected result in the published guide. Confirm that the chosen check or evidence actually includes or exercises that caller and covers the affected part of its contract. If evidence is unavailable, state what remains unverified.
```

### Step 3: Cut Over and Verify Consumers

If all affected callers can move together, update them and verify the new contract in one coherent change. Do not introduce a temporary compatibility shim just to split the cutover. Where consumers upgrade independently, migrate incrementally and verify old and new consumers throughout the overlap. Keep both paths working for as long as required by the approved plan.

```
1. Identify all touchpoints with the deprecated system
2. Switch to the replacement, or apply the approved retirement steps
3. Verify retained behaviour and any explicitly approved changes (tests, integration checks)
4. Remove references to the old system
5. Confirm no regressions
```

**The Churn Rule:** If you own the infrastructure being deprecated, you are responsible for migrating your users — or providing backward-compatible updates that require no migration. Don't announce deprecation and leave users to figure it out.

### Step 4: Remove the Old System

Remove the old surface only when there is evidence that all affected consumers have moved or have been accounted for under the approved retirement terms, and the required checks, reviews and recovery gates are met. A still-supported consumer using it is a blocker. Unknown use is not zero usage.

1. For a closed cutover, account for all affected callers with dependency analysis and relevant tests. For deployed or external consumers, also check applicable support and rollout records, consumer confirmations or existing usage evidence with known coverage. Neither a deadline, a search of this checkout nor the absence of log entries proves removal is safe.
2. Remove the old code, configuration and obsolete current instructions. Remove superseded notices from current surfaces when they no longer apply.
3. Keep relevant regression tests and historical decisions and migration notes. Obtain explicit approval before removing coverage.
4. Verify the remaining callers and configuration after removal.

## Migration Patterns

These cross-stack patterns are options for migrations that need overlap, not project architecture. Apply the removal gate in Step 4 before using any pattern's final removal step.

### Strangler Pattern

Run old and new systems in parallel. Route traffic incrementally from old to new. When the old system handles 0% of traffic, remove it.

```
Phase 1: New system handles 0%, old handles 100%
Phase 2: New system handles 10% (canary)
Phase 3: New system handles 50%
Phase 4: New system handles 100%, old system idle
Phase 5: Remove old system
```

### Adapter Pattern

Create an adapter that translates calls from the old interface to the new implementation. Consumers keep using the old interface while you migrate the backend.

```typescript
// Adapter: old interface, new implementation
class LegacyTaskService implements OldTaskAPI {
  constructor(private newService: NewTaskService) {}

  // Old method signature, delegates to new implementation
  getTask(id: number): OldTask {
    const task = this.newService.findById(String(id));
    return this.toOldFormat(task);
  }

  // Translate the new shape back into what old consumers expect
  private toOldFormat(task: Task): OldTask {
    return {
      id: Number(task.id),
      title: task.title,
      done: task.status === 'done',
    };
  }
}
```

### Feature Flag Migration

Use feature flags to switch consumers from old to new system one at a time:

```typescript
function getTaskService(userId: string): TaskService {
  if (featureFlags.isEnabled('new-task-service', { userId })) {
    return new NewTaskService();
  }
  return new OldTaskService();
}
```

### Database Schema Migrations (Expand/Contract)

A schema change cannot be undone by reverting application code alone. A rename coupled to a rolling deploy can leave one version querying a column that does not exist. When old and new versions coexist, expand the schema first and keep it compatible with both versions' readers and writers. Contract only after the old shape is no longer used.

```
EXPAND ──────────────→ MIGRATE ──────────────→ CONTRACT
add the new column     move all writers to     after no readers or writers
alongside the old      dual-write, reconcile,  use the old column, drop it
                       then switch reads       in a separate deploy
```

**Cross-stack worked example — renaming `name` to `full_name`:**

1. **Expand.** Add `full_name` as nullable. Check that the change and any constraints leave old reads and writes valid.
2. **Dual-write.** Keep `name` authoritative. Deploy code that writes both `name` and `full_name` atomically on each insert or update of the name. Keep reads on `name` while old-only writers can still run.
3. **Gate and reconcile.** Prevent any further old-only writes: verify that old instances, jobs and in-flight writes have drained or are fenced off. Only then run the final backfill and reconciliation, copying the current `name` to `full_name` in throttled batches. Repair stale non-null values as well as missing ones, and make the batches safe against concurrent dual writes so a stale snapshot cannot overwrite a newer value. Verify agreement before switching reads.
4. **Switch reads.** Point the app at `full_name`, keep writing both and monitor the cutover. While both fields remain in sync, the read path can switch back to `name` without reintroducing old-only writers.
5. **Contract.** Once no readers or other dependencies need `name`, stop writing it. Check first that new-only writers work with the expanded schema, including constraints on the old column. Verify no live or in-flight readers or writers still use `name`, then drop it in a separate, later deploy after meeting the approved recovery gate.

Treat each phase as a thin vertical slice — see the `incremental-implementation` skill. Rehearse recovery for the phase being deployed. After old values stop being kept current or are dropped, switching reads back is not safe. Recreating the column does not restore its values. Rehearse the approved recovery approach (for example, a forward repair or a restore with verified replay of subsequent writes) and establish what it can recover before the destructive step.

**Rules:**

- **Additive first, destructive last and alone for overlapping deploys.** Check locks, rewrites, constraints and reader/writer compatibility even for additive steps. Drops and renames get their own deploy after no active code or database dependency references the old shape.
- **Test the applicable down path before merging.** If a down path cannot safely recover the data and service, get approval for a different recovery strategy and rehearse it before the change proceeds. Irreversible actions need explicit approval; a lossy down is not evidence of safe rollback.
- **Backfill in batches, off the hot path.** Large updates can cause unacceptable lock contention. Chunk and throttle the work; verify locking, batch behaviour and the effect on ongoing traffic for the target database.
- **Build large indexes without blocking writes** (e.g. Postgres `CREATE INDEX CONCURRENTLY`).
- **Decouple from code by feature flag** when the cutover warrants it and the flag is approved. A flag does not replace the writer barrier or reconciliation.

## Zombie Code

Zombie code is code that nobody owns but everybody depends on. It's not actively maintained, has no clear owner and accumulates security vulnerabilities and compatibility issues. Signs:

- No commits in 6+ months but active consumers exist
- No assigned maintainer or team
- Failing tests that nobody fixes
- Dependencies with known vulnerabilities that nobody updates
- Documentation that references systems that no longer exist

**Response:** Either assign an owner and maintain it properly, or deprecate it with a concrete migration plan. Zombie code cannot stay in limbo — it either gets investment or removal.

## Common Rationalisations

| Rationalisation                                                  | Reality                                                                                                                                                    |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "It still works, why remove it?"                                 | Working code that nobody maintains accumulates security debt and complexity. Maintenance cost grows silently.                                              |
| "Someone might need it later"                                    | If it's needed later, it can be rebuilt. Keeping unused code "just in case" costs more than rebuilding.                                                    |
| "The migration is too expensive"                                 | Compare migration cost to ongoing maintenance cost over 2–3 years. Migration is usually cheaper long-term.                                                 |
| "We'll deprecate it after we finish the new system"              | Deprecation planning starts at design time. By the time the new system is done, you'll have new priorities. Plan now.                                      |
| "Users will migrate on their own"                                | Give affected consumers concrete instructions and support, with tooling where useful, or do the migration yourself (the Churn Rule). Verify their cutover. |
| "We can maintain both systems indefinitely"                      | Two systems doing the same thing is double the maintenance, testing, documentation and onboarding cost.                                                    |
| "Just rename the column, it's one line"                          | If old and new versions overlap, one will query or write a column that no longer exists. Use expand/contract to keep both valid.                           |
| "I'll add the column and drop the old one in the same migration" | That eliminates the compatibility window during a staged rollout. Drop separately, only after old reads and writes have stopped and recovery is ready.     |
| "We'll write the rollback if we need it"                         | Test an applicable down path in advance or get approval for a different, rehearsed recovery. Recreating a dropped column does not recover its values.      |

## Red Flags

- Withdrawal without a verified replacement or an explicitly approved retirement
- Affected consumers given a notice but no actionable procedure or support
- "Soft" deprecation that's been advisory for years with no progress
- Zombie code with no owner and active consumers
- New features added to a deprecated system (invest in the replacement instead)
- Assuming zero use from a deadline, an incomplete caller search or silence in logs
- Removal while supported consumers still rely on the old surface, or without resolving unknown usage
- A rolling deploy that pairs incompatible code and schema changes
- Switching reads before old-only writes have stopped and final reconciliation has succeeded
- Destructive schema changes while old readers or writers can still run
- A migration without tested recovery, or locking and constraint risks left unverified

## Verification

Before removing a deprecated surface:

- [ ] A replacement covers critical use cases with evidence appropriate to the target, or retirement without replacement and its effects have been explicitly approved.
- [ ] Affected callers and their verification evidence are identified, with any unavailable evidence and the resulting limits recorded. Independently upgrading consumers have concrete migration instructions, support and safe overlap where required.
- [ ] Evidence accounts for every affected consumer and meets the approved removal terms. Still-supported consumers using the old surface and unresolved usage block removal.
- [ ] Required approval, review and recovery gates are met. After removal, obsolete live references are gone and remaining callers pass their checks; relevant regression coverage and historical guidance are retained. Any coverage removal has explicit approval.

For a database schema migration:

- [ ] For overlapping versions, expand before migrating and contract in a separate deploy. Test old and new readers and writers against the schema at each applicable step.
- [ ] For a column cutover like the example, old-only writers are blocked before final reconciliation and throughout the read cutover. The backfill repairs missing and stale values without overwriting newer writes, and reconciliation is verified.
- [ ] Locks, constraints and throttled batch behaviour are checked against the target. No readers or writers still depend on the old shape before a destructive change.
- [ ] The applicable down path has been tested, or a different recovery strategy has been approved and rehearsed. Any irreversible step has explicit approval; evidence states what happens to existing data and later writes.
