---
description: Implement the next approved task or the whole approved plan incrementally.
argument-hint: '[auto|all] [request, issue URL or spec path]'
---

Resolve relative links from this repository's `.agents/commands/` directory.

Read and follow [incremental implementation](../skills/incremental-implementation/SKILL.md), [test-driven development](../skills/test-driven-development/SKILL.md), [Testing](../../docs/reference/testing.md), [Verification](../../docs/reference/verification.md) and the [root authority](../../AGENTS.md#authority). Resolve the selected requirements, plan and task state using the [planning output contract](../skills/planning-and-task-breakdown/SKILL.md#output-files).

Arguments: $ARGUMENTS

## Scope and approval

Only a leading `auto` or `all` token selects whole-plan mode; an incidental `auto` elsewhere in the arguments does not. Remaining arguments select or describe the work. Default mode completes one task and stops. Whole-plan mode continues through the approved remaining tasks in dependency order without ordinary stops between tasks. Both modes use the same selection and per-task procedure.

Select the source and plan for this request, not an unrelated inlined plan or draft. An issue, spec or request is not itself approval. Reuse approval only when it demonstrably covers the current requirements, plan and intended execution scope; resolve a source mismatch or ambiguous selection before proceeding. A plan approved for one task does not authorise the whole plan.

If default mode has no approved task and plan, do not implement; route to planning. In whole-plan mode, if requirements exist but no approved execution plan does, draft and submit the plan through `xd://propose` when native plan mode is active. From normal mode, explain `/plan /build auto <source>` as the native entry and stop rather than pretending this prompt switches modes. A mode transition or tool response alone is not approval: continue only after the user's actual approval of the displayed plan and its whole-plan scope. Record the selected sources and execution mode in the plan so execution can continue in the same or a fresh context. Already valid approval needs no repeat.

Select the next approved unfinished task whose dependencies are complete, whether the tracker shows it as pending or active. Reconcile tracker state with the selected plan and available evidence of completion. An active status records progress, not completion or permission; promotion to active never extends the invocation's scope. If no task is ready in the approved scope, report what is complete or what blocks progress.

## Per-task procedure

1. Confirm acceptance criteria, approved scope, dependencies and current state. Preserve unrelated tracked, staged and untracked work, including edits in the same file. Resolve genuinely ambiguous ownership without automatically cleaning or stashing the worktree.
2. Load relevant context and select evidence under Testing and Verification.
3. For changed executable behaviour, write or use a test that fails for the intended reason (RED), then implement the minimum complete change that passes (GREEN).
4. After GREEN, assess REFACTOR: make only justified behaviour-preserving improvements within the task and rerun affected tests after each change. If none is justified, leave the code alone.
5. For an initially behaviour-preserving refactor, start from relevant green tests. For documentation or instruction changes, use accuracy, link and interpretation evidence rather than inventing failing application tests.
6. Run the focused and broader checks required by the approved scope and checkpoint, exercising affected runtime behaviour rather than relying on compilation alone. Do not rerun an unchanged successful check solely because another wrapper requests it.
7. Make a task-scoped local checkpoint using the active OMP eval `commit` namespace, not whole-file `git add` or `git commit`. Preserve unrelated work even within a touched file. An approved no-commit instruction takes precedence; do not commit session-local plans as a preparatory step.
8. Record verified completion in the current execution tracker and report actual evidence. Stop after this task in default mode even if the tracker promotes another task to active. In whole-plan mode apply the same selection rule again within the approved scope.

The behaviour-changing loop is RED → GREEN → REFACTOR assessment and affected tests → applicable verification → selective checkpoint → tracker update.

Stop for uncovered user-owned decisions, failures that cannot be resolved within scope or risky or irreversible actions not already authorised. Once the user resolves a blocker, resume still-authorised work without requiring another `/build auto` invocation. Root review, local acceptance and publication gates remain in force. Report completed tasks, evidence, checkpoints, skipped or failed checks and remaining limitations honestly.
