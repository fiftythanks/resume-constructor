---
name: constraint-driven-development
description: Use when identifying gaps in project quality standards, proposing a threshold or checking whether a change weakens an existing requirement.
---

# Constraint-Driven Development

Start from the selected change or quality question. Read the [root authority](../../../AGENTS.md#authority), [Verification](../../../docs/reference/verification.md) and the applicable project reference. Inspect the corresponding executable configuration, tests, hooks or CI jobs to establish what actually runs. Distinguish a documented requirement, an active automated check, a measurement without enforcement and a proposed change. Report discrepancies between intent and configuration rather than choosing one to overwrite.

New dependencies, thresholds, waivers and changes to test expectations or coverage require explicit user approval. Qualitative requirements such as [preview/PDF parity](../../../docs/reference/product.md) apply without a numeric gate. A missing browser or URL means evidence is missing; it does not remove an [accessibility requirement](../../../docs/reference/accessibility.md) or establish conformance.

## Assess (default)

Identify the relevant standard, its source, how it is checked and any material gap. If the standard is already covered, say so and stop. Otherwise recommend the smallest useful change in the existing requirement or configuration. Inspect the sources rather than running a broad suite to discover policy. Ask only about unresolved user-owned decisions. If the user is unavailable, apply established standards and leave undecided policy pending.

## `check`

Run existing non-fixing package checks appropriate to the selected scope and checkpoint. For broad verification, use `bun run verify` as described in Verification. Staged fixers are not read-only checks. Report commands actually run, failures and checks blocked or not reached. A failure does not authorise a fix, a retry with weaker settings or a waiver.

## `guard`

Review all and only the selected change against its intended base, including relevant committed, staged, unstaged and untracked files. Resolve an ambiguous base or scope before judging the change. Keep the review read-only.

Look for removed checks, narrowed CI or test selection, relaxed budgets or assertions, skips, suppressions, unfinished behaviour and new exceptions. For each finding, report its location, what the change stops checking and whether approval covers it. Judge effects in context: an equivalent test rewrite or a documented, narrow override permitted by project policy is not itself a violation. A commit-message rationale is not approval to remove coverage.

## `ratchet`

For the requested metric, identify the measurement source, a comparable baseline, the proposed limit, its rationale and where enforcement would run. If there is no reliable measurement, report what is missing rather than inventing a number. A measurement, including an improved value or a project-wide mutation score, is not automatically a new minimum. Return a proposal unless a user-approved implementation and testing plan already covers the specific change.

For an approved new gate, verify that its real command rejects a known violation and an execution error and accepts a clean control. For a severity threshold, also verify that a report containing only a below-threshold finding passes. Redact scanner evidence rather than reproducing sensitive matched text.
