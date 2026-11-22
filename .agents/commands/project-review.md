---
description: Review the selected change across five axes; use independent review for hand-off.
argument-hint: '[change, file, commit range or PR]'
---

Resolve relative links from this repository's `.agents/commands/` directory.

Read and follow [code review](../skills/code-review-and-quality/SKILL.md), [orchestration](../references/orchestration-patterns.md), [Testing](../../docs/reference/testing.md), [Verification](../../docs/reference/verification.md) and the [root authority](../../AGENTS.md#authority).

Arguments: $ARGUMENTS

## Scope and independence

1. Select the requested artefact and comparison base, or the established current change when arguments are absent. Include all relevant committed, staged, unstaged and untracked work in that scope; preserve unrelated work. Clarify a genuinely ambiguous target/base rather than substituting recent commits, staged-only selection or a clean-worktree requirement.
2. Review directly for an ordinary scoped request. If independence is requested or this is the pre-hand-off review, use a fresh-context available reviewer through OMP's actual task interface. Supply the artefact and comparison base, requirements, applicable project instructions and verification evidence without the author's desired verdict. A persona name is not a required runtime agent; no installation or registration is needed.
3. Keep the assignment read-only: no fixes, expectation changes, commits or publication. A source-mutating experiment requires explicit authorisation and safe isolation from the shared worktree. If a required procedure cannot run within the authorised scope, report it unmet rather than declaring the procedure complete.

## Five-axis review

Read requirements and tests first, then inspect:

- **Correctness** — Expected behaviour, edge cases and adequate tests.
- **Readability** — Clear names, straightforward logic and organisation.
- **Architecture** — Existing patterns, boundaries and appropriate abstractions.
- **Security** — Relevant validation, secrets and authorisation concerns; follow [security and hardening](../skills/security-and-hardening/SKILL.md) for these concerns.
- **Performance** — Relevant query, resource and responsiveness concerns; follow [performance optimisation](../skills/performance-optimization/SKILL.md) for these concerns.

Keep security and performance work within the selected change's concerns, not unrelated full audits.

## Report and integrate

Categorise findings as `Critical`, `Required`, `Optional` or `Nit`, with specific evidence in `file:line` format and actionable recommendations. Report no findings when warranted. Distinguish inspected evidence, checks actually run and unavailable evidence.

The working agent checks and integrates delegated findings. A verdict is a technical recommendation, not user acceptance. Required independent review and the user's local Plannotator acceptance are separate root gates; present for local acceptance only when that phase is authorised. Unavailable required independence remains unmet, not replaced by self-review.
