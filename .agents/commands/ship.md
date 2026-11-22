---
description: Assess readiness for the selected release using relevant independent reviews and a verified recovery plan.
argument-hint: '[change and release target]'
---

Resolve relative links from this repository's `.agents/commands/` directory.

Read and follow [shipping and launch](../skills/shipping-and-launch/SKILL.md), [orchestration](../references/orchestration-patterns.md), the [root authority](../../AGENTS.md#authority) and the canonical [Verification](../../docs/reference/verification.md), [Product](../../docs/reference/product.md) and [Accessibility](../../docs/reference/accessibility.md) references.

Arguments: $ARGUMENTS

This command assesses readiness. It does not deploy, merge, publish or advance the project lifecycle.

## A — Assess evidence and unresolved questions

1. Identify the selected change/base and intended release target from arguments or established context. Read the review and check evidence for that state. Reuse still-valid evidence; re-examine affected conclusions when the state changes. Distinguish missing evidence from inapplicable checklist items.
2. Apply the orchestration reference to unresolved questions. Satisfy required independent code review; select additional security or test-coverage perspectives only when risks or evidence gaps justify them. Use flat parallel delegation for independent assignments that earn it, not fixed team sizes or file/line thresholds.
3. Use OMP's actual task interface and available agent types. For a selected perspective, supply the corresponding [code reviewer](../agents/code-reviewer.md), [security auditor](../agents/security-auditor.md) or [test engineer](../agents/test-engineer.md) persona file as instructions alongside the canonical project rules, the relevant artefact and comparison base, requirements and evidence. Persona files are instructions, not individual tools or `@persona` invocation syntax.
4. Give each worker a bounded read-only assignment: findings and evidence, no fixes, commits, publication or further delegation. Supply independent reviewers the contract without the author's preferred verdict. The working agent integrates reports under the current orchestration reference.
5. Separate contexts do not isolate the worktree or browser/MCP resources. Keep shared mutable/runtime checks with the working agent unless genuinely isolated resources are supplied. If a required independent pass cannot run, report it unmet; direct inspection is not an independent or parallel substitute.

## B — Synthesise

Check findings against the selected state and reconcile duplicate or conflicting reports through evidence. Cover applicable code quality, security, performance, accessibility, operational/recovery and documentation requirements, including affected preview/PDF parity. Apply the project's distinction between web accessibility requirements and future exported-document/ATS goals.

Generic service checklists do not authorise new infrastructure, feature flags, telemetry, SLOs or arbitrary rollout thresholds. Report unresolved linked-procedure requirements rather than silently waiving them or implementing them.

## C — Recommend

Produce a traceable report:

- **Technical readiness: `GO | NO-GO`** — Name the change/base and release target. Applicable failed or blocked technical gates, including required independent review, prevent `GO` unless the user explicitly approves a waiver.
- **Blockers** — Missing prerequisites and required fixes, with source evidence and `file:line` references where applicable.
- **Recommended fixes** — Actionable improvements and their evidence.
- **Acknowledged risks** — Only risks the user has actually accepted, with the acceptance and mitigation; distinguish unresolved risks.
- **Recovery** — Real target-specific steps, trigger conditions and supporting evidence. Include recovery-time claims only when established. Missing target or recovery evidence means readiness is not established, not permission to invent a procedure.
- **Specialist evidence** — Attributable reports, their examined state, checks actually run and limitations; explain reused evidence and any unmet independent pass.
- **Human gates** — Report local acceptance and publication authority separately. Technical `GO` does not grant either.

Stop with the recommendation and missing prerequisites; take no operational action.
