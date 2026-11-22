# Contributing

Thank you for contributing to Resume Constructor. This guide explains how to get started; [AGENTS.md](AGENTS.md) is the authority for agent decisions, local review and publication.

## Setup

The project requires Bun (v1.2+) and uses `bun.lock`.

```bash
git clone https://github.com/fiftythanks/resume-constructor.git
cd resume-constructor
bun install --frozen-lockfile

# Install Chromium and its dependencies for browser tests
bun x playwright install --with-deps chromium

# Start the development server
bun start

# Run interactive Vitest tests
bun run test
```

Create a focused topic branch from `main`, using a descriptive prefix such as `feat/`, `fix/`, `refactor/`, `chore/` or `docs/`.

## Project guidance

The compact references are the normative source for project conventions. Use them according to the work:

- [Product](docs/reference/product.md) explains CV behaviour, preview parity and export goals.
- [TypeScript and React](docs/reference/typescript-react.md) covers immutability, colocation, implementation and comments.
- [Styling](docs/reference/styling.md) covers SCSS naming and responsive adaptation.
- [Testing](docs/reference/testing.md) explains test-first development, contracts and environment selection.
- [Accessibility](docs/reference/accessibility.md) covers editor and preview interaction and the future exported-document goal.
- [Documentation](docs/reference/documentation.md) explains TypeDoc discovery and the role of guides.
- [Prose](docs/reference/prose.md) describes the house style for original prose.

Use Conventional Commits for commit messages; [`commitlint.config.ts`](commitlint.config.ts) owns the enforced types, scopes and limits. The prose and TypeScript/React references explain wording and comment conventions without duplicating configuration here.

## Checks and local review

Use `bun run test:ci` for the non-interactive Vitest run and `bun run verify` for the broader, fail-fast sequence of native checks and builds. Individual commands and their exact composition live in [`package.json`](package.json). `bun test` runs Bun's own test runner rather than the Vitest projects; use the package commands for this project's tests.

Git hooks run staged-file fixers and checks, check commit messages and invoke broad verification before pushing. Broad checks do not automatically fix source files. Review any staged fixer changes and supply relevant visual or accessibility evidence where appropriate. Passing checks alone does not establish adequate coverage or approval; see the [verification reference](docs/reference/verification.md).

For agent work, follow the independent review and local hand-off process in [AGENTS.md](AGENTS.md#authority) before publication.
