---
description: Break work into verifiable tasks with acceptance criteria and dependency ordering
argument-hint: <request, issue URL or specification path>
---

Resolve relative links from this repository's `.agents/commands/` directory.

Read and follow the [planning and task breakdown skill](../skills/planning-and-task-breakdown/SKILL.md), including its [shared output contract](../skills/planning-and-task-breakdown/SKILL.md#output-files).

Selected source: $ARGUMENTS

If native plan mode is not active, explain that `/plan /planning <source>` enters it and stop; this command cannot switch modes. If it is already active, use `/planning <source>` without toggling `/plan` again.

Read the selected requirements and relevant code, then decompose the work into vertical slices with acceptance criteria, dependencies, concrete verification and proposed checkpoints where needed. Protect other unfinished plans. Carry the requirement source and intended execution scope into the plan. In native plan mode, write only permitted local artefacts and submit the completed implementation and testing plan through `xd://propose` for the user's actual approval; a mode transition is not approval. Do not create issues, `tasks/` files or extra phase approval gates automatically. Checkpoints in the approved plan remain binding.
