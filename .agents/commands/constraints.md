---
description: Assess project quality standards, run existing checks or review a change for weakened safeguards.
argument-hint: '[check|guard|ratchet] [scope or quality question]'
---

Resolve relative links from this repository's `.agents/commands/` directory.

Read and follow [constraint-driven development](../skills/constraint-driven-development/SKILL.md), the [root authority](../../AGENTS.md#authority) and [Verification](../../docs/reference/verification.md).

Arguments: $ARGUMENTS

Only a leading `check`, `guard` or `ratchet` token selects that mode. Use the remaining text to select its scope. Otherwise treat the arguments as an assessment question. With no arguments, assess this project's existing quality policy, not an unrelated inlined plan.

If the selected mode lacks a necessary input after inspecting available context, ask for the missing change or base for `guard`, or the missing metric for `ratchet`.
