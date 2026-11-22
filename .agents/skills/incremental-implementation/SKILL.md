---
name: incremental-implementation
description: Delivers changes incrementally in thin, verifiable slices. Use when implementing any feature or change that touches more than one file, or when picking up the next task from a plan. Use when rolling a change out behind a feature flag, when you're about to write a large amount of code at once or when a task feels too big to land in one step.
---

# Incremental Implementation

## Overview

Build in thin vertical slices — establish the right evidence, implement one piece, verify it, then expand. Avoid implementing an entire feature in one pass. Each increment should leave the system in a working, testable state.

## When to Use

- Implementing any multi-file change
- Building a new feature from a task breakdown
- Refactoring existing code
- Any time you're tempted to write more than ~100 lines before testing

**When NOT to use:** Single-file, single-function changes where the scope is already minimal.

## The Increment Cycle

```text
Behaviour change: RED → GREEN → REFACTOR → Verify → Checkpoint → Next slice
```

For each slice:

1. **RED** — for changed executable behaviour, write or use a test and confirm it fails for the intended reason.
2. **GREEN** — implement the smallest complete change that passes.
3. **REFACTOR** — assess justified behaviour-preserving improvements within the task; rerun affected tests after each change. If none is justified, leave the code alone.
4. **Verify** — use the evidence required by [Testing](../../../docs/reference/testing.md) and [Verification](../../../docs/reference/verification.md) for the approved scope and checkpoint.
5. **Checkpoint** — use a task-scoped selective commit unless an approved no-commit instruction applies, then move to the next slice.

For an initially behaviour-preserving refactor, start with relevant green tests. For documentation or instruction work, check accuracy, links and interpretation as applicable instead of inventing failing application tests.

## Slicing Strategies

### Vertical Slices (Preferred)

Build one complete path through the stack:

```
Slice 1: Create a task (DB + API + basic UI)
    → Tests pass, user can create a task via the UI

Slice 2: List tasks (query + API + UI)
    → Tests pass, user can see their tasks

Slice 3: Edit a task (update + API + UI)
    → Tests pass, user can modify tasks

Slice 4: Delete a task (delete + API + UI + confirmation)
    → Tests pass, full CRUD complete
```

Each slice delivers working end-to-end functionality.

### Contract-First Slicing

When backend and frontend need to develop in parallel:

```
Slice 0: Define the API contract (types, interfaces, OpenAPI spec)
Slice 1a: Implement backend against the contract + API tests
Slice 1b: Implement frontend against mock data matching the contract
Slice 2: Integrate and test end-to-end
```

### Risk-First Slicing

Tackle the riskiest or most uncertain piece first:

```
Slice 1: Prove the WebSocket connection works (highest risk)
Slice 2: Build real-time task updates on the proven connection
Slice 3: Add offline support and reconnection
```

If Slice 1 fails, you discover it before investing in Slices 2 and 3.

## Implementation Rules

### Rule 0: Simplicity First

Before writing any code, ask: "What is the simplest thing that could work?"

After writing code, review it against these checks:

- Can this be done in fewer lines?
- Are these abstractions earning their complexity?
- Would a staff engineer look at this and say "why didn't you just..."?
- Am I building for hypothetical future requirements, or the current task?

```
SIMPLICITY CHECK:
✗ Generic EventBus with middleware pipeline for one notification
✓ Simple function call

✗ Abstract factory pattern for two similar components
✓ Two straightforward components with shared utilities

✗ Config-driven form builder for three forms
✓ Three form components
```

Three similar lines of code is better than a premature abstraction. Implement the naive, obviously-correct version first. Optimise only after correctness is proven with tests.

### Rule 0.5: Scope Discipline

Touch only what the task requires.

Do NOT:

- "Clean up" code adjacent to your change
- Refactor imports in files you're not modifying
- Remove comments you don't fully understand
- Add features not in the spec because they "seem useful"
- Modernise syntax in files you're only reading

If you notice something worth improving outside your task scope, note it — don't fix it:

```
NOTICED BUT NOT TOUCHING:
- src/utils/format.ts has an unused import (unrelated to this task)
- The auth middleware could use better error messages (separate task)
→ Want me to create tasks for these?
```

### Rule 1: One Thing at a Time

Each increment changes one logical thing. Don't mix concerns:

**Bad:** One commit that adds a new component, refactors an existing one and updates the build config.

**Good:** Three separate commits — one for each change.

### Rule 2: Keep It Compilable

Keep the codebase working between slices. Run the applicable checks required by [Testing](../../../docs/reference/testing.md) and [Verification](../../../docs/reference/verification.md) for the change and checkpoint.

### Rule 3: Feature Flags for Incomplete Features

If a feature isn't ready for users and the approved rollout calls for a flag, keep it off by default. For Vite client UI, use a public flag:

```typescript
// Example public client flag; do not put secrets in VITE_ variables.
const ENABLE_TASK_SHARING =
  import.meta.env.VITE_FEATURE_TASK_SHARING === 'true';

if (ENABLE_TASK_SHARING) {
  // New sharing UI
}
```

This can keep incomplete work hidden when increments are merged. It does not authorise adding a flag, merging or shipping.

### Rule 4: Safe Defaults

New code should default to safe, conservative behaviour:

```typescript
// Safe: disabled by default, opt-in
export function createTask(data: TaskInput, options?: { notify?: boolean }) {
  const shouldNotify = options?.notify ?? false;
  // ...
}
```

### Rule 5: Rollback-Friendly

Each increment should be independently revertable:

- Additive changes (new files, new functions) are easy to revert
- Modifications to existing code should be minimal and focused
- Database migrations should have corresponding rollback migrations
- Remove the old implementation, add its replacement and migrate affected consumers in one increment if splitting those changes would break a checkpoint

## Working with Agents

When directing an agent to implement incrementally:

```
"Let's implement Task 3 from the plan.

Start with just the database schema change and the API endpoint.
Don't touch the UI yet — we'll do that in the next increment.

After implementing, run the repository's test and build commands to
verify nothing is broken."
```

Be explicit about what's in scope and what's NOT in scope for each increment.

## Increment Checklist

After each increment, apply [Testing](../../../docs/reference/testing.md) and [Verification](../../../docs/reference/verification.md) to the approved scope and checkpoint:

- [ ] The change does one thing and does it completely
- [ ] Applicable tests and other checks pass and affected executable behaviour is exercised
- [ ] Documentation accuracy, links and instruction interpretation are checked where applicable
- [ ] The task-scoped change is selectively committed with a descriptive message unless an approved no-commit instruction applies

**Note:** Run each verification command after a change that could affect it. Reuse successful results at the same scope and state; do not rerun for reassurance. For an authorised comparative diagnostic on an already characterised baseline, state the hypothesis, change a relevant precondition and record the discriminating result separately. Keep the valid clean result as the checkpoint; the diagnostic does not invalidate or replace it and does not authorise a fix.

## Common Rationalisations

| Rationalisation                                      | Reality                                                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "I'll test it all at the end"                        | Bugs compound. A bug in Slice 1 makes Slices 2–5 wrong. Test each slice.                                                                                     |
| "It's faster to do it all at once"                   | It _feels_ faster until something breaks and you can't find which of 500 changed lines caused it.                                                            |
| "These changes are too small to commit separately"   | Small commits are free. Large commits hide bugs and make rollbacks painful.                                                                                  |
| "I'll add the feature flag later"                    | Keep incomplete work hidden. If the approved rollout uses a flag, add it before the feature can become visible.                                              |
| "This unrelated refactor is small enough to include" | Keep unrelated refactoring separate. The in-scope REFACTOR step after GREEN remains part of the task.                                                        |
| "Let me run the build command again just to be sure" | Reuse the successful result at the same scope and state. Run again after a relevant change or for an authorised comparative diagnostic, not for reassurance. |

## Red Flags

- More than 100 lines of code written without running tests
- Multiple unrelated changes in a single increment
- "Let me just quickly add this too" scope expansion
- Skipping the test/verify step to move faster
- Build or tests broken between increments
- Large uncommitted changes accumulating
- Building abstractions before the third use case demands it
- Touching files outside the task scope "while I'm here"
- Creating new utility files for one-time operations
- Rerunning a successful check without a relevant change or an authorised comparative diagnostic

## Verification

After completing all increments for a task:

- [ ] Each increment has the applicable evidence and a task-scoped checkpoint unless an approved no-commit instruction applies
- [ ] The checks required by the approved scope and checkpoint pass
- [ ] The change works as specified, with affected executable behaviour exercised where applicable
- [ ] Task-owned changes are accounted for and unrelated tracked, staged and untracked work is preserved, including edits in touched files

## See Also

Per-increment verification is the local check. Before declaring a task done, apply the project-wide Definition of Done as the final gate, the standing bar every increment clears regardless of the task. See the [canonical verification reference](../../../docs/reference/verification.md#definition-of-done).
