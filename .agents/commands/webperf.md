---
description: Audit a selected web interaction using source, supplied measurements or an authorised live trace.
argument-hint: '[page, interaction, source or report]'
---

Resolve relative links from this repository's `.agents/commands/` directory.

Read the [web performance auditor](../agents/web-performance-auditor.md) and the [root authority](../../AGENTS.md#authority).

Arguments: $ARGUMENTS

Resolve the web target and evidence from the arguments or established context. If neither identifies a target, ask for one. Apply the auditor's procedure directly by default, without requiring a named runtime agent. Report evidence and findings, then stop before remediation.
