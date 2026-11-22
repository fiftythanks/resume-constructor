---
name: code-simplification
description: Use when assessing or simplifying working code for clarity without changing its observable behaviour.
---

# Code Simplification

## Select the target and intent

Start with the selected file, snippet or diff. If none is given, use the unambiguous target of the current task or ask which change to inspect. Do not substitute the latest commits, the whole dirty worktree or an unrelated approved plan.

Read the affected callers and tests. Check relevant history when needed to understand why the code is written this way. Name a concrete clarity gain or report that no change is warranted. Shorter is not inherently clearer; extract a helper only when it names a useful concept. On a performance-critical path, keep the original if the proposed simplification is measurably slower.

## Decide whether to edit

An assessment stays read-only. For a request to simplify, edit only if an approved implementation **and testing** plan covers the target under [AGENTS.md](../../../AGENTS.md#authority). Otherwise, propose the smallest useful edit and how to prove it preserves behaviour, then stop.

Apply the project's [TypeScript and React](../../../docs/reference/typescript-react.md) conventions. Preserve observable outputs and types, error delivery, side effects and their order, public APIs and product contracts. Refactoring is not permission to fix a bug, weaken a test or discard unrelated work. A record of `{count}` values is not equivalent to a `Map` of numbers. Removing `async` can turn a rejected promise into a synchronous throw.

## Establish and preserve the baseline

Follow [Testing](../../../docs/reference/testing.md): establish relevant green tests before editing. Reuse still-valid evidence for the same state. If the baseline fails or does not establish the affected behaviour, report the gap and propose the necessary coverage rather than guessing.

Make only the approved refactor. Rerun the affected checks after each coherent change and compare the result for clarity as well as correctness. On a regression, isolate and undo only your own change. If you cannot separate it from other edits, stop and report the overlap.

Report the check results and any unverified behaviour. Use broader checks at their normal [verification](../../../docs/reference/verification.md) checkpoint. The skill does not start a separate build, review, commit or publication cycle for each edit.
