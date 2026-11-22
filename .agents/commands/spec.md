---
description: Clarify and draft specifications for the selected work
argument-hint: <request, issue URL or existing specification path>
---

Resolve relative links from this repository's `.agents/commands/` directory.

Read and follow the [spec-driven-development skill](../skills/spec-driven-development/SKILL.md), starting with its [mode and scope boundary](../skills/spec-driven-development/SKILL.md#the-gated-workflow). In normal mode, return a standalone draft in chat or at the agreed destination. In native plan mode, surface the limitation for a spec-only request rather than treating it as a request for an execution plan.

Use the request, issue URL or specification path in `$ARGUMENTS`; if no argument is supplied, use the source already established for the current work or ask for it if needed for the permitted task. Read the selected requirements and relevant project context before asking about genuine gaps. An unrelated plan or the existence of an issue does not establish approval.

For a genuinely compound request, propose the skill's capability map and obtain approval before specifying its modules. For new work, clarify the objective, users, features, acceptance criteria, constraints and boundaries, then cover the skill's six full-spec areas where a specification is warranted. Existing conventions or an agreed requirements system take precedence; `SPEC.md` is an available default only when absent. Resolve the destination before writing and preserve every existing unrelated specification.

For a change to an existing specification, preserve the source and draft the appropriate scoped delta, particularly for shipped requirements. For issue-based work, read the issue or supplied content and linked requirements; do not automatically publish or overwrite an issue or create a duplicate repository specification.

Present new or changed requirements for explicit human approval before implementation depends on them; reuse demonstrably applicable prior approval. Requirement approval and execution-plan approval are distinct. This command does not authorise planning, implementation or publication beyond the user's request.
