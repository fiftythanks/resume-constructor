---
name: documentation-and-adrs
description: Records decisions and documentation, and detects when documentation has drifted from the code it describes. Use when you need to document an architecture decision (ADR) or the reasoning behind a design choice, when changing public APIs, shipping features, when docs may be stale or out of sync with the code they describe, when working out which module docs are still accurate or when setting up a check so docs cannot silently go out of date again.
---

# Documentation and ADRs

## Overview

Document decisions, not just code. The most valuable documentation captures the _why_ — the context, constraints and trade-offs that led to a decision. Code shows _what_ was built; documentation explains _why it was built this way_ and _what alternatives were considered_. This context is essential for future humans and agents working in the codebase.

## When to Use

- Making a significant architectural decision
- Choosing between competing approaches
- Adding or changing a public API
- Shipping a feature that changes user-facing behaviour
- Onboarding new team members (or agents) to the project
- When you find yourself explaining the same thing repeatedly

**When NOT to use:** Don't document obvious code. Don't add comments that restate what the code already says. Don't write docs for throwaway prototypes.

## Architecture Decision Records (ADRs)

ADRs capture the reasoning behind significant technical decisions. They're the highest-value documentation you can write.

### When to Write an ADR

- Choosing a framework, library or major dependency
- Designing a data model or database schema
- Selecting an authentication strategy
- Deciding on an API architecture (REST vs. GraphQL vs. tRPC)
- Choosing between build tools, hosting platforms or infrastructure
- Any decision that would be expensive to reverse

### Match the existing convention first

Before creating an ADR, inspect the available repository context for an established convention — existing ADRs, project instructions and ADR-related configuration or tooling (e.g. an `.adr-dir` file). An established convention overrides the defaults below. Match:

- **Location and format** — e.g. `docs/adr/*.md`, `Documentation/Decisions/*.rst`, a MADR layout or an `adr-tools` setup. Match the existing directory, file extension and markup (Markdown vs reStructuredText).
- **Numbering and naming** — continue the existing sequence and filename pattern (`ADR-004-Title.rst`, `0004-title.md`, …); don't restart at 001 or introduce a second scheme.
- **Section headings** — reuse the project's heading set rather than imposing this template's.

If the available evidence conflicts, surface the conflict rather than silently introducing another scheme. Only when no convention can be established do you apply the default below.

### ADR Template

Store ADRs in `docs/decisions/` with sequential numbering (unless the project already uses another location — see above):

```markdown
# ADR-001: Use PostgreSQL for primary database

## Status

Proposed | Accepted | Superseded by ADR-XXX | Deprecated

## Date

2025-01-15

## Context

We need a primary database for the task management application. Key requirements:

- Relational data model (users, tasks, teams with relationships)
- ACID transactions for task state changes
- Support for full-text search on task content
- Managed hosting available (for small team, limited ops capacity)

## Decision

Use PostgreSQL with Prisma ORM.

## Alternatives Considered

### MongoDB

- Pros: Flexible schema, easy to start with
- Cons: Our data is inherently relational; would need to manage relationships manually
- Rejected: Relational data in a document store leads to complex joins or data duplication

### SQLite

- Pros: Zero configuration, embedded, fast for reads
- Cons: Limited concurrent write support, no managed hosting for production
- Rejected: Not suitable for multi-user web application in production

### MySQL

- Pros: Mature, widely supported
- Cons: PostgreSQL has better JSON support, full-text search and ecosystem tooling
- Rejected: PostgreSQL is the better fit for our feature requirements

## Consequences

- Prisma provides type-safe database access and migration management
- We can use PostgreSQL's full-text search instead of adding Elasticsearch
- Team needs PostgreSQL knowledge (standard skill, low risk)
- Hosting on managed service (Supabase, Neon or RDS)
```

### ADR Lifecycle

```
PROPOSED → ACCEPTED → (SUPERSEDED or DEPRECATED)
```

- **Don't delete old ADRs.** They capture historical context.
- When an accepted decision changes, write a new ADR that references and supersedes the old one. A proposal does not supersede the current decision.
- Record significant rationale in the established location with its actual status. Only mark a user-owned decision accepted after approval under the [root authority](../../../AGENTS.md#authority). A roadmap proposal is not an accepted decision.

## Inline Documentation

### When to Comment

Comment the _why_, not the _what_:

```typescript
// BAD: Restates the code
// Increment counter by 1
counter += 1;

// GOOD: Explains non-obvious intent
// Rate limit uses a fixed window that opens on the first request after the
// previous one expires, not on a clock schedule. Known gap: a client can spend
// the full limit just before a reset and again just after (2x in a moment)
if (now - windowStart > WINDOW_SIZE_MS) {
  counter = 0;
  windowStart = now;
}
```

### When NOT to Comment

```typescript
// Don't comment self-explanatory code
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Don't leave TODO comments for things you should just do now
// TODO: add error handling  ← Just add it

// Don't leave commented-out code
// const oldImplementation = () => { ... }  ← Delete it, git has history
```

### Document Known Gotchas

```typescript
/**
 * IMPORTANT: This function must be called before the first render.
 * If called after hydration, it causes a flash of unstyled content
 * because the theme context isn't available during SSR.
 *
 * See ADR-003 for the full design rationale.
 */
export function initializeTheme(theme: Theme): void {
  // ...
}
```

## API Documentation

For public APIs (REST, GraphQL or library interfaces), document the consumer contract. For affected internal exports, document the contract at the declaration where TypeDoc discovers it; no barrel promotion or public release commitment is needed. Follow the project's [Documentation](../../../docs/reference/documentation.md) and [TypeScript and React](../../../docs/reference/typescript-react.md) references.

### Inline with Types (Preferred for TypeScript)

Cross-stack illustration of a documented export, not a local API:

```typescript
/**
 * Creates a new task.
 *
 * @param input - Task creation data (title required, description optional)
 * @returns The created task with server-generated ID and timestamps
 * @throws {ValidationError} If title is empty or exceeds 200 characters
 * @throws {AuthenticationError} If the user is not authenticated
 *
 * @example
 * const task = await createTask({ title: 'Buy groceries' });
 * console.log(task.id); // "task_abc123"
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  // ...
}
```

### OpenAPI/Swagger for REST APIs

Cross-stack illustration for a REST service:

```yaml
paths:
  /api/tasks:
    post:
      summary: Create a task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskInput'
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '422':
          description: Validation error
```

## README Structure

Keep setup discoverable from the README. Link to the existing procedure and command definitions instead of duplicating them. For a local development session, point the reader to the setup steps through starting the development server; for verification, direct them to the checks for the work they changed.

Illustrative sections for this project's root README:

```markdown
# Project Name

One-paragraph description of what this project does.

## Quick Start

Follow [Setup](CONTRIBUTING.md#setup) for the Bun prerequisite and dependency installation, then use its development-server command to run the application locally.

## Commands

For checks, start with [Checks and local review](CONTRIBUTING.md#checks-and-local-review) and select the test, lint, type or build script relevant to the change from [`package.json`](package.json).

## Architecture

Brief overview of the project structure and key design decisions.
Link to the existing design records for details.

## Contributing

How to contribute, coding standards, PR process.
```

## Changelog Maintenance

For shipped features, summarise consumer impact in the changelog. Keep current references accurate for the supported contract. Retain why a decision was made and what alternatives were considered in the decision record. For a consumer-facing migration, link the changelog entry to the single procedure prepared with the `deprecation-and-migration` skill rather than restating the steps or inventing removal terms.

Cross-stack changelog illustration:

```markdown
# Changelog

## [1.2.0] - 2025-01-20

### Added

- Task sharing: users can share tasks with team members (#123)
- Email notifications for task assignments (#124)

### Fixed

- Duplicate tasks appearing when rapidly clicking create button (#125)

### Changed

- Task list now loads 50 items per page (was 20) for better UX (#126)
```

## Documentation for Agents

Special consideration for AI agent context:

- **[`AGENTS.md`](../../../AGENTS.md) and its linked project references** — Start at the root for decision and review authority; follow the applicable `docs/reference/` source for project conventions instead of creating a parallel rules file
- **Spec files** — Keep specs updated so agents build the right thing
- **ADRs** — Help agents understand why past decisions were made (prevents re-deciding)
- **Inline gotchas** — Prevent agents from falling into known traps

## Prose Review

After checking the technical content, review the prose for the people who will use it. Clearer wording must not change the decision or its limits.

1. Mark the details that must survive the edit: names, numbers and units, commands, paths, links, conditions, trade-offs and uncertainty. Check them against the available code and decision context; flag anything you cannot substantiate.
2. Replace stock introductions, promotional adjectives and repeated summaries with the concrete information the reader needs. Do not replace an unsupported claim with an invented example or a stronger guarantee. Keep necessary technical repetition and the project's established terminology.
3. Compare the edited document with the original and its sources. Restore any lost qualifier or caveat, verify command and code examples still work as documented and explain any unresolved factual question rather than polishing it away.

## Documentation Drift

A document that was true when written still reads as authoritative after the code moves on. Use version control to identify changes worth inspecting, not to decide whether a claim is true. These path-scoped commands illustrate the history lookup; use the actual source and documentation paths for the claim:

```bash
git log -1 --format=%H -- src/rate-limiter.js
git log -1 --format=%H -- docs/rate-limiter.md
```

Matching hashes, a newer commit and no recorded change are chronology clues, not verdicts. Empty output or incomplete or divergent history can leave even the order of changes unresolved.

Check the exact claim against the current source, configuration, observed behaviour or recorded decision as appropriate, including uncommitted changes. Report it as current when the relevant evidence supports it and stale when the evidence contradicts it. If the evidence needed to decide is unavailable, report "can't tell" and name what is missing. Missing history alone neither proves nor disproves the claim.

When you correct a doc that has a change log, append a dated entry that says why it changed. Never rewrite or collapse earlier entries: Git keeps the old text, but the log is the only record of the reasons.

## Common Rationalisations

| Rationalisation                              | Reality                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| "The code is self-documenting"               | Code shows what. It doesn't show why, what alternatives were rejected or what constraints apply.                               |
| "We'll write docs when the API stabilizes"   | APIs stabilise faster when you document them. The doc is the first test of the design.                                         |
| "Nobody reads docs"                          | Agents do. Future engineers do. Your 3-months-later self does.                                                                 |
| "ADRs are overhead"                          | A 10-minute ADR prevents a 2-hour debate about the same decision six months later.                                             |
| "Comments get outdated"                      | Comments on _why_ are stable. Comments on _what_ get outdated — that's why you only write the former.                          |
| "I'll tidy the change log while I'm in here" | Git holds the old text; the log holds the reasons. Rewriting it destroys the only copy of the reasoning and preserves nothing. |

## Red Flags

- Significant decisions with no written rationale, or a proposal presented as accepted
- Affected public contracts or internal exports without documentation of their relevant guarantees
- README that neither explains how to run the project nor directs readers to the maintained setup
- Commented-out code instead of deletion
- `TODO` comments that have been there for weeks
- A second decision-record collection introduced despite an established convention
- Documentation that restates the code instead of explaining intent
- A change log that has been rewritten rather than appended to
- A doc called current or stale from commit dates, hash equality or missing history instead of checking the claim

## Verification

After documenting:

- [ ] Significant decisions have written rationale and their actual status in the established location.
- [ ] The README directs readers to the maintained setup and the relevant command sources and describes or links to the architecture.
- [ ] Affected public contracts and internal exports are documented at the appropriate surface, with relevant type and behavioural guarantees. For affected functions, verify that parameter and return contracts are documented and match the implementation and types.
- [ ] Known gotchas are documented inline where they matter
- [ ] No commented-out code remains
- [ ] Affected agent-facing guidance is current and accurate against `AGENTS.md`, the relevant project references and the authoritative source or configuration.
- [ ] Prose edits preserve source details, decision trade-offs and qualifiers without adding unsupported guarantees
- [ ] Where the corrected document has a change log, a dated entry explains the correction without rewriting earlier entries.
- [ ] Each drift conclusion follows from evidence about the exact claim in the current state. Contradicted claims are stale; unavailable verification is reported as "can't tell" with the missing evidence.
