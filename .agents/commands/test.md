---
description: Run the project's TDD workflow for an approved feature or bug fix.
argument-hint: '[approved task or bug]'
---

Resolve relative links from this repository's `.agents/commands/` directory.

Read and follow [test-driven development](../skills/test-driven-development/SKILL.md), [Testing](../../docs/reference/testing.md), [Verification](../../docs/reference/verification.md) and the [root authority](../../AGENTS.md#authority). For browser-related work, also follow [browser testing](../skills/browser-testing-with-devtools/SKILL.md).

Arguments: $ARGUMENTS

## Select the task

Use the arguments to select the approved feature or bug fix, or use the clearly established current task when arguments are absent. If neither identifies a target, ask for one. Approval and changes to expectations or coverage follow root authority.

This is a TDD workflow. An explicit request only to run existing tests authorises reporting results, not fixing code or changing expectations.

## RED → GREEN → REFACTOR

1. Discover the repository's test commands and read the expected behaviour and relevant tests.
2. For a feature, write tests describing the expected behaviour. For a bug, use Prove-It: write a regression test reproducing it. Run the tests and confirm they fail for the intended reason before changing the implementation.
3. Implement the approved change and run the relevant tests to confirm GREEN.
4. Assess refactoring; make only justified behaviour-preserving improvements and rerun affected tests. Leave the code alone if no refactor is warranted.
5. Complete regression verification, including the full test suite before declaring completion. Focused checkpoints do not waive final checks required by Testing and Verification.
6. Report the observed failure, implementation, passing checks and any failed or unavailable verification.
