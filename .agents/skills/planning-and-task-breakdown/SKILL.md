---
name: planning-and-task-breakdown
description: Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope or when parallel work is possible.
---

# Planning and Task Breakdown

## Overview

Decompose work into small, verifiable tasks with explicit acceptance criteria. Good task breakdown is the difference between an agent that completes work reliably and one that produces a tangled mess. Every task should be small enough to implement, test and verify in a single focused session.

## When to Use

- You have a spec and need to break it into implementable units
- A task feels too large or vague to start
- Work needs to be parallelised across multiple agents or sessions
- You need to communicate scope to a human
- The implementation order isn't obvious

**When NOT to use:** Single-file changes with obvious scope, or when the spec already contains well-defined tasks.

## The Planning Process

### Step 1: Enter Plan Mode

Before writing any code, enter native plan mode when an execution plan is needed. From normal mode use `/plan /planning <source>`; if already in native plan mode use `/planning <source>` without toggling `/plan` again.

- Read the selected requirements and relevant codebase sections
- Identify existing patterns and conventions
- Map dependencies between components
- Note risks and unknowns

**Do NOT write code during planning.** Produce the native execution plan described in [Output Files](#output-files), not implementation. Native planning permits only allowed local artefacts; submit the completed plan through `xd://propose` for the user's decision.

### Step 2: Identify the Dependency Graph

Map what depends on what:

```
Database schema
    │
    ├── API models/types
    │       │
    │       ├── API endpoints
    │       │       │
    │       │       └── Frontend API client
    │       │               │
    │       │               └── UI components
    │       │
    │       └── Validation logic
    │
    └── Seed data / migrations
```

Implementation order follows the dependency graph bottom-up: build foundations first.

### Step 3: Slice Vertically

Instead of building all the database, then all the API, then all the UI — build one complete feature path at a time:

**Bad (horizontal slicing):**

```
Task 1: Build entire database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

**Good (vertical slicing):**

```
Task 1: User can create an account (schema + API + UI for registration)
Task 2: User can log in (auth schema + API + UI for login)
Task 3: User can create a task (task schema + API + UI for creation)
Task 4: User can view task list (query + API + UI for list view)
```

Each vertical slice delivers working, testable functionality.

### Step 4: Write Tasks

Each task in the execution plan follows this structure (see [Output Files](#output-files)):

```markdown
### Task [N]: [Short descriptive title]

**Description:** Concrete changes that deliver this slice, including the relevant choices and any decided fallback.

**Acceptance criteria:**

- [ ] [Specific, testable condition]
- [ ] [Specific, testable condition]

**Verification:**

- [ ] [Focused checks and runtime evidence appropriate to this task]
- [ ] [Manual check, if applicable]

**Dependencies:** [Task numbers this depends on, or "None"]

**Files likely touched:**

- [List the actual paths needed for this task, including test paths where applicable.]

**Estimated scope:** [Small: 1-2 files | Medium: 3-5 files | Large: 5+ files]
```

### Step 5: Order and Checkpoint

Arrange tasks so that:

1. Dependencies are satisfied (build foundation first)
2. Each task leaves the system in a working state
3. Verification checkpoints are proposed at suitable intervals for the work
4. High-risk tasks are early (fail fast)

Add explicit checkpoints to the execution plan where the work needs them. A human review checkpoint is binding when included in the approved plan, not an automatic gate after every phase:

```markdown
### Checkpoint: After Tasks 1–3

- [ ] Applicable checks pass
- [ ] Relevant user flow works end-to-end
- [ ] Human review before proceeding, if required by this checkpoint
```

## Task Sizing Guidelines

| Size   | Estimated files | Scope                                                             | Example                              |
| ------ | --------------- | ----------------------------------------------------------------- | ------------------------------------ |
| **XS** | 1               | Single function or config change                                  | Add a validation rule                |
| **S**  | 1–2             | One component or endpoint                                         | Add a new API endpoint               |
| **M**  | 3–5             | One feature slice                                                 | User registration flow               |
| **L**  | 5–8             | Multi-component feature                                           | Search with filtering and pagination |
| **XL** | 8+              | Several slices or one indivisible change (e.g. an atomic cutover) | —                                    |

An agent performs best on S and M tasks. Use file counts to estimate scope and prompt inspection, not to block completion or require an exception.

Split genuinely separate outcomes into independently verifiable tasks. Keep a deliverable with no independently verifiable slice in one task, whether it adds or replaces behaviour. Keep a coherent cutover and its affected consumers in one task if splitting it would break a checkpoint or require a temporary alias.

**Signs to look for independently verifiable slices:**

- It would take more than one focused session (roughly 2+ hours of agent work)
- You cannot describe the acceptance criteria in 3 or fewer bullet points
- It touches two or more independent subsystems (e.g., auth and billing)
- You find yourself writing "and" in the task title (a sign it is two tasks)

## Output Files

- **Requirements and durable work items:** GitHub Issues hold durable project work items, their requirements, acceptance criteria and overall status. An issue may contain requirements or link to a repository specification; its existence or open status does not approve either the requirements or an implementation plan. Small ad-hoc requests need no issue or fabricated specification when the request and approved plan provide sufficient requirements.
- **Execution plan:** Write the implementation and verification plan to `local://<slug>-plan.md`. Record the selected requirement source, issue URL when one exists, scope of execution (the next task or the whole remaining plan) and planned next steps. Include `Source spec:` with the actual location when a specification exists. Include acceptance criteria, dependency order, verification, relevant ownership boundaries and checkpoints. Repository specifications and design rationale remain appropriate at their existing or explicitly chosen locations when useful beyond the session.
- **Approval and continuity:** Reuse approval only when it demonstrably covers the current requirements, plan and intended actions; approval never silently changes the execution scope. Resolve a source mismatch or ambiguous selection rather than silently replacing a plan. A session-local URI is not a public GitHub link or durable documentation; if another context cannot reach the artefact, transfer the relevant plan and approval evidence using the [context engineering hand-off guidance](../context-engineering/SKILL.md).
- **Existing backlog:** Keep the current Markdown backlog until the user chooses to migrate it. When an item moves to an issue, link to it rather than maintaining competing status lists. Do not create, update or close issues merely to fulfil this planning procedure.

**Never overwrite an incomplete plan or unrelated draft or specification.** If the user asks to revise or extend the same work, update the selected plan as authorised. For different work, preserve the existing artefact and resolve any destination conflict before writing. Never bulk-close or delete another plan's open tracker items to make room.

### Task List Target

Record ordered tasks and checkpoints in the native execution plan. During execution, use the existing session task tracker to record progress against the approved steps; task status is not a separate source of scope or approval. No `tasks/plan.md` or `tasks/todo.md` mirror is obligatory.

Issues represent independently useful durable work items at the granularity chosen by the user, not one issue per test, refactoring step or other implementation microtask.

## Plan Document Template

Use this skeleton with the active native plan instructions. Before submission, resolve every choice an implementer would otherwise have to make. Record decisions with their rationale and tie material risks to a check or decided fallback beside the affected work. The plan must be executable without the planning conversation.

```markdown
# Implementation Plan: [Feature/Project Name]

Source spec: [path to the spec this plan was generated from, e.g. SPEC.md or SPEC-<change>.md; omit if no spec]
Requirement source: [selected request, issue URL or other requirements; cite applicable prior approval if it exists]
Issue: [URL, if one exists]
Execution scope: [next task or whole remaining plan]

## Context

[Requested outcome and why it matters]

## Approach

### Task 1: [First vertical slice]

- [Task details from Step 4: concrete changes, acceptance criteria and verification]
- **Dependencies:** None

### Task 2: [Next vertical slice]

- [Task details from Step 4: concrete changes, acceptance criteria and verification]
- **Dependencies:** Task 1

### Checkpoint: After Tasks 1–2

- [ ] [Concrete condition for proceeding; include any required review]

## Critical files & anchors

[Non-obvious paths and symbols that disambiguate the work, where needed]

## Verification

[End-to-end input and expected observable outcome, with exact commands or procedures and prerequisites]

## Assumptions & contingencies

[User-overridable assumptions, if any; put decided execution fallbacks with the affected tasks]
```

The task list records the approved execution steps; session task status tracks their progress.

## Parallelisation Opportunities

When multiple agents or sessions are available:

- **Safe to parallelise:** Independent feature slices, tests for already implemented features and documentation, provided tasks have separate write ownership and can be checked independently. Treat shared writable fixtures, generated indexes and outputs as shared state.
- **Must be sequential:** Database migrations, shared state changes, dependency chains
- **Needs coordination:** Features that share an API contract (define the contract first, then parallelise)

## Common Rationalisations

| Rationalisation                               | Reality                                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| "I'll figure it out as I go"                  | That's how you end up with a tangled mess and rework. 10 minutes of planning saves hours.                       |
| "The tasks are obvious"                       | Write them down anyway. Explicit tasks surface hidden dependencies and forgotten edge cases.                    |
| "Planning is overhead"                        | Planning is the task. Implementation without a plan is just typing.                                             |
| "I can hold it all in my head"                | Context windows are finite. Written plans survive session boundaries and compaction.                            |
| "The old plan is stale, I'll just replace it" | Unchecked tasks may be mid-build in another session. Preserve the plan and resolve the conflict before writing. |

## Red Flags

- Starting implementation without a written task list
- Overwriting an incomplete plan or unrelated draft or specification without authorisation
- Treating task status or an open issue as approval of requirements or execution
- Tasks that say "implement the feature" without acceptance criteria
- No verification steps in the plan
- All tasks are XL-sized
- Missing checkpoints where the work needs them
- Dependency order isn't considered

## Verification

Before starting implementation, confirm:

- [ ] Every task has acceptance criteria
- [ ] Every task has a verification step
- [ ] Task dependencies are identified and ordered correctly
- [ ] Tasks and checkpoints are recorded in the execution plan; the session tracker will record progress during execution
- [ ] No pre-existing incomplete plan was overwritten without explicit user confirmation
- [ ] Task boundaries follow the [sizing guidance](#task-sizing-guidelines): separate outcomes are split into independently verifiable tasks and indivisible deliverables stay together
- [ ] Appropriate checkpoints are included where the work needs them
- [ ] The human has reviewed and approved the requirements, plan and intended execution scope

## See Also

Acceptance criteria are per-task and answer "did we build the right thing?". They sit on top of the project-wide Definition of Done, the standing bar every task clears before it counts as done. See the [canonical verification reference](../../../docs/reference/verification.md#definition-of-done).
