# Agent instructions

## Authority

Investigate and propose freely. Implement only a user-approved implementation and testing plan.

- The user decides product behaviour, UX and visual design, architecture, public APIs and data models, dependencies and toolchain, test strategy and acceptance criteria, scope, deliberate technical debt and irreversible operations. ALWAYS bring user-owned decisions not covered by the approved plan back to the user before implementing them.
- Changing test expectations, removing coverage or bypassing checks requires user approval. Test refactoring that preserves the contract does not.
- The user directs lifecycle progression through requests and approved plans. Do not add an autonomous lifecycle coordinator that routes work between phase-specific agents. An approved plan may cover several phases without additional per-phase approval; existing decision, review and publication gates still apply.
- Within the currently authorised work, agents choose private implementation details, individual tests within the approved strategy, work sequencing and bounded delegation. Delegate for independent scrutiny, substantial separable work or context-heavy investigation, not merely to route or paraphrase work. Make atomic local commits without per-commit approval; additional checkpoints apply only where the plan requires them.
- Before hand-off, obtain a fresh-context independent agent review using the user's adapted `code-review-and-quality` skill, then follow [Local code review](docs/reference/verification.md#local-code-review). A reviewer cannot approve user-owned decisions. Publish or open a public PR only after the user accepts the work locally; the user merges into `main`.

Before choosing or carrying out agent delegation, read [Orchestration patterns](.agents/references/orchestration-patterns.md).

## Project references

Read the applicable references before proposing or changing the corresponding work:

- CV behaviour, previews or PDF output: [Product](docs/reference/product.md).
- TypeScript/React implementation or review: [TypeScript and React](docs/reference/typescript-react.md).
- Styles or responsive layout: [Styling](docs/reference/styling.md).
- Implementation, test design or test review: [Testing](docs/reference/testing.md).
- UI interaction, preview or exported-document accessibility: [Accessibility](docs/reference/accessibility.md).
- Verification, local commits or review hand-off: [Verification](docs/reference/verification.md).
- Code documentation, project references or human guides: [Documentation](docs/reference/documentation.md).
- Original prose, documentation or code comments: [Prose](docs/reference/prose.md).
