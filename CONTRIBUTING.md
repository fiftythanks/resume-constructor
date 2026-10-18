# Contributing Guidelines

Thank you for contributing to **Resume Constructor**! This repository follows a production-grade, zero-bootstrap development workflow. To maintain consistency, maintainability and code quality, please adhere to these guidelines.

---

## 1. Prerequisites & Environment

This project requires the **Bun** runtime (v1.2+). `bun.lock` is strictly enforced.

```bash
# Clone the repository
git clone https://github.com/fiftythanks/resume-constructor.git
cd resume-constructor

# Install dependencies (respecting lockfile)
bun install --frozen-lockfile

# Install Playwright browser dependencies (for Vitest browser mode & E2E)
bun x playwright install --with-deps chromium

# Start local development server (Vite dev server)
bun start

# Run unit, component and browser tests (Vitest)
bun run test

# Run tier-specific test suites
bun x vitest --project=unit
bun x vitest --project=component
bun x vitest --project=browser

# Run type check
bun x tsc --noEmit

# Verify production build
bun run build
```

> [!IMPORTANT]
> Never run bare `bun test`. Bun's native test runner does not use the three-tier Vitest project configuration (`unit`, `component` and `browser`). Always run `bun run test` (for the full suite) or `bun x vitest related --run --bail=1 <file> --passWithNoTests` (for targeted runs).

---

## 2. Git Branching Model

Create focused, short-lived topic branches branched off `main`:

- `feat/<feature-name>`: New functionality or architectural improvements
- `fix/<bug-name>`: Defect and layout fixes
- `refactor/<module-name>`: Code refactoring without behaviour change
- `chore/<task-name>`: Tooling, dependency or workflow updates
- `docs/<task-name>`: Documentation updates

---

## 3. Commit Message Standards (Conventional Commits)

We strictly enforce the Conventional Commits specification with specific formatting constraints:

```text
<tag>(<scope>): <subject line in imperative mood>

<detailed body paragraph(s) explaining rationale and context>
```

### Constraints:

1. **Header Length:** The first line (header) must not exceed **50 characters**.
2. **Body Separation:** Exactly **one empty line** must separate the header from the body.
3. **Body Line Length:** Each line in the body must not exceed **80 characters**.
4. **Code References in Body:** Any identifiers, filenames, directory paths, component names, props or HTML/ARIA attributes in the body must be enclosed in **backticks** (e.g. `NavbarItem`, `src/hooks/`, `aria-describedby`).
5. **Language & Grammar:** Write all commit messages and code comments in **traditional British English** (e.g. "optimise", "initialise", "behaviour", "centre", "colour") and with **no Oxford commas** (use "A, B and C", never "A, B, and C").
6. **Dash Typography:** Em-rules ("—") must **always** be separated by spaces from the surrounding text (e.g. "word — word"), but must not be separated by spaces from surrounding brackets if inside brackets. Never attach an em-rule directly to adjacent words. En-rules ("–"), representing ranges and similar things, must **not** have any spaces surrounding them (e.g. "1–10", "lines 20–35", "2020–2024").
7. **Slash Typography:** A forward slash ("/") must only be surrounded by spaces if it separates compound words (e.g. "word combination / another combination"). When separating single words, terms, identifiers or paths, no spaces are needed (e.g. "`Sidebar`/`Navbar`", "Prev/Next/Add/Delete", "true/false").
8. **Quotation Marks in Prose vs Code:** In documentation, commit messages and code comments, **always use double quotes** (`"..."`) for quotes and punctuation references (not British-style single quotes). Single quotes (`'...'`) are strictly reserved for code implementation (JavaScript, TypeScript and SCSS). Identifiers, symbols and code references in prose must use **backticks** (`` `...` ``).

### Code Comments Standards

1. **Multiline Comments:** Any code comment spanning multiple lines must be formatted as a JSDoc-style block comment (`/** ... */`) with leading asterisks on each continuation line. Consecutive `//` comments used to wrap sentences or paragraphs are strictly prohibited.
2. **Single-line Comments:** The `//` syntax is strictly reserved for standalone, single-line remarks. Consecutive single-line comments are permitted only when representing distinct annotations (e.g. separate `// TODO:` or `// DILEMMA:` entries).
3. **Language & Typography:** Comments and documentation must be written in traditional British English with strictly no Oxford comma, double quotes (`"..."`) for quoted natural language, spaced em-rules ("—"), unspaced en-rules ("–") for ranges and forward slashes ("/") spaced only when separating compound words.

---

## 4. Systematised Tags & Scopes

### Allowed Tags (Types)

| Tag        | Purpose                                                                               |
| ---------- | ------------------------------------------------------------------------------------- |
| `feat`     | New user-facing feature or architectural capability                                   |
| `fix`      | Bug fix in component markup, logic, accessibility or styles                           |
| `refactor` | Code restructuring with no change to external behaviour                               |
| `test`     | Adding, updating or fixing automated unit, integration or E2E tests                   |
| `docs`     | Documentation portal (`docs/`), guides, in-source JSDoc, comments and repository docs |
| `chore`    | Tooling, build pipeline, dependencies, CI and git hooks                               |

### Allowed Scopes by Domain

All scopes must be **strictly lowercase**.

#### Domain A: UI Components & Application Shell (`src/components/`, `src/App/`)

- `app`: Root application component (`src/App/`)
- `applayout`: Application shell and layout grid (`src/components/AppLayout/`)
- `sidebar`: Sidebar container housing navigation and actions (`src/components/AppLayout/Sidebar/`)
- `navbar`: Navigation rail, section tabs and items (`src/components/AppLayout/Sidebar/Navbar/`)
- `toolbar`: Action toolbar, reset/populate actions and modal triggers (`src/components/AppLayout/Sidebar/Toolbar/`)
- `preview`: Resume preview modal, PDF compilation and canvas renderer (`src/components/Preview/`)
- `addsections`: Section adder popup and item list (`src/components/AddSections/`)
- `components`: Shared UI primitives (`Button`, `Popup`, `ListItem`, `BulletPoints`)

#### Domain B: Feature Pages & Resume Sections (`src/pages/`)

- `personal`: Personal details form (`src/pages/Personal/`)
- `education`: Education details and degree items (`src/pages/Education/`)
- `experience`: Work experience and employment history (`src/pages/Experience/`)
- `projects`: Projects, descriptions and URLs (`src/pages/Projects/`)
- `skills`: Skills section and categorised tags (`src/pages/Skills/`)
- `certifications`: Certifications and licences (`src/pages/Certifications/`)
- `links`: Custom links and social links (`src/pages/Links/`)
- `pages`: Cross-page adjustments and section wrappers

#### Domain C: Core Logic, Hooks, Types & Styles

- `hooks`: Custom React hooks (`src/hooks/`)
- `utils`: Utility functions (`src/utils/`)
- `types`: TypeScript interfaces, declarations and helpers (`src/types/`)
- `styles`: Global SCSS tokens, typography, custom properties and mixins (`src/styles/`)

#### Domain D: Infrastructure, Tooling & Build System

- `vite`: Vite build and development server configuration (`vite.config.ts`)
- `ts`: TypeScript compiler configuration (`tsconfig.json`, `docs/tsconfig.json`)
- `vitest`: Vitest configuration and testing setup (`vitest.config.ts`, `vitest.setup.tsx`)
- `eslint`: ESLint flat configuration and rules (`eslint.config.ts`)
- `prettier`: Prettier formatting configuration (`prettier.config.js`, `.prettierignore`)
- `stylelint`: Stylelint configuration and rules (`stylelint.config.js`)
- `playwright`: Playwright test runner configuration (`playwright.config.ts`)
- `e2e`: End-to-end Playwright test suites (`e2e/`)
- `husky`: Git pre-commit and pre-push hooks (`.husky/`)
- `ci`: Continuous Integration workflows (`.github/workflows/`)
- `package`: Dependency manifests and runtime updates (`package.json`, `bun.lock`)
- `readme`: Root repository documentation (`README.md`)
- `docs`: Documentation portal, guides and configuration (`docs/`)
- `agents`: AI instructions and skills (`AGENTS.md`, `.agents/skills/`)

> [!NOTE]
> Unscoped commits (`chore: ...`, `refactor: ...`) are permitted for broad changes spanning multiple domains (e.g. `chore: update dependencies`).

---

## 5. Architectural & Coding Principles

1. **Component Colocation & Three-Tier Testing:** Every component lives in its own folder under `src/components/<Name>/` containing `<Name>.tsx`, `<Name>.scss`, `<Name>.test.tsx` (for `happy-dom` component tests), an optional `<Name>.browser.test.tsx` (for real-browser tests in Vitest Browser Mode), colocated pure helper modules (`someHelper.ts` + `someHelper.test.ts` running in pure Node without DOM) and a one-line `index.tsx` barrel export.
2. **Deep Immutability:** Component props must use `ReadonlyExcept<Props, 'ref'>` imported from `@/types/ReadonlyExcept`. Nested state updates must use `immer` or `use-immer`.
3. **Zero Redundant Effects:** Strictly adhere to `eslint-plugin-react-you-might-not-need-an-effect`. Derive state during render or inside event callbacks; never copy props to state or synchronise state via `useEffect`.
4. **Accessibility First (WCAG 2.2 AA):** All form controls must have explicit `htmlFor` labels. Manage focus with `tabbable`, announce dynamic updates politely via `aria-live="polite"` and ensure full keyboard operable interactions.
5. **Styling & BEM:** Component styles use React BEM (`BlockName-ElementName_modifierName_modifierValue`). Internal component scaling relies on CSS Container Queries (`@container`), reserving `@media` exclusively for macro-layout shifts in `AppLayout`.
6. **Avoid Type Assertions:** Avoid TypeScript type assertions (`as Type`, `<Type>` and the non-null assertion operator `!`) as much as possible. Rely on natural type inference, proper type declarations and runtime type narrowing (such as `instanceof`, `typeof` or type guards). If an assertion cannot be avoided with reasonable effort, the rationale must be documented with an in-code comment explaining why it was necessary.
7. **Documentation Parity (Starlight TypeDoc):** Whenever a component, hook, utility function or pure helper is created, its entry point MUST be added to `starlightTypeDoc.entryPoints` in `docs/astro.config.ts`. TypeDoc requires explicit registration for all exports; automatic directory discovery is not supported.

---

## 6. Verification Sequence Before Submitting a PR

Before opening a pull request, verify your changes pass all local hygiene checks:

```bash
# 1. Verify TypeScript types
bun x tsc --noEmit

# 2. Check and fix ESLint errors
bun x eslint . --fix

# 3. Check and fix SCSS style issues
bun x stylelint "src/**/*.scss" --fix

# 4. Verify formatting
bun x prettier --write .

# 5. Run full test suite
bun run test

# 6. Verify production build
bun run build
```

---

## 7. Agentic Development & MCP Tooling

This repository is optimised for autonomous AI coding agents (such as Antigravity) adhering to the Model Context Protocol (MCP) and lifecycle hooks architecture.

### Model Context Protocol (MCP) Servers

To prevent token exhaustion and eliminate blind whole-file rewrites, coding agents connect to 9 specialised MCP servers:

| MCP Server       | Invocation / Transport                        | Primary Role                                                                                                                                                        |
| :--------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `typescript-lsp` | `bunx -y lsp-mcp-server`                      | Sub-second LSP diagnostics (`lsp_diagnostics`), symbol definitions (`lsp_goto_definition`), type hovering (`lsp_hover`) and references without reading entire files |
| `eslint`         | `bun x mcp` (`@eslint/mcp`)                   | In-context file linting and diagnostic inspection (`lint-files`)                                                                                                    |
| `vitest`         | `bun x @djankies/vitest-mcp`                  | Test discovery and targeted project execution (`run_tests`) across `unit`, `component` and `browser` tiers                                                          |
| `ast-grep`       | `uvx ast-grep-server`                         | Structural code search and AST pattern matching (`find_code`, `find_code_by_rule`)                                                                                  |
| `playwright`     | `bun x playwright-mcp --headless`             | Headless browser DOM snapshots (`browser_snapshot`), accessibility tree verification and screenshot capture                                                         |
| `a11y`           | `bun x a11y-mcp`                              | Automated WCAG 2.2 AA accessibility audits (`audit_webpage`, `get_summary`) against the live Vite server                                                            |
| `context7`       | `bun x context7-mcp`                          | Real-time documentation queries for external libraries (`react`, `immer`, `@dnd-kit`)                                                                               |
| `gitmcp-docs`    | `bun x mcp-remote https://gitmcp.io/docs`     | Deep monorepo inspection and upstream source lookup across external dependencies                                                                                    |
| `react-pdf`      | Streamable HTTP (`https://react-pdf.org/mcp`) | Upstream layout documentation and Yoga engine Flexbox guidance                                                                                                      |

### Antigravity Lifecycle Hooks

Deterministic agent workflows are governed by lifecycle hooks declared in [`.agents/hooks.json`](.agents/hooks.json):

1. **Command Safety (`PreToolUse`):** Automatically rewrites accidental `bun test` commands to `bun run test` (preserving all flags and arguments), while denying dangerous operations such as `git reset --hard`, force pushes and unconstrained deletions (`.agents/hooks/command-safety.sh`).
2. **Context Injection (`SessionStart`, `PreInvocation`):** Injects workspace invariants, testing commands and typography constraints directly into model context (`.agents/hooks/session-start.sh`, `.agents/hooks/pre-invocation.sh`).
3. **Editor Hygiene (`PostToolUse`):** Returns fast sub-5ms acknowledgements to avoid editor tool coordinate offset corruption (`.agents/hooks/post-edit-hygiene.sh`).
4. **Stop Quality Gate (`Stop`):** Runs static type checking (`bun x tsc --noEmit`), targeted Vitest tests, Oxford comma scans and Starlight TypeDoc parity audits on all modified files before allowing turn completion (`.agents/hooks/stop-gate.sh`).
