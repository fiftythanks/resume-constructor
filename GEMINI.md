# Workspace Rules: Resume Constructor

## 1. Project Overview & Architectural Principles

- **Core Stack:** React 19, React Compiler (`babel-plugin-react-compiler`), TypeScript (strict), SCSS + BEM, Vite 8, Vitest 5, Bun runtime/package manager.
- **Domain:** Production-grade, zero-bootstrap resume generator implementing _The Tech Resume Inside Out_.
- **Rendering Parity:** Layout parity across `@react-pdf/renderer` (Yoga engine Flexbox rules only), Live Preview DOM and modal PDF.js canvas with interactive text layer overlay (worker loaded via `pdfjs-dist/build/pdf.worker.min.mjs?url`).
- **Colocated Pure Helper Pattern:** Extract pure business logic, identifier derivations and header calculations into `someHelper.ts` + `someHelper.test.ts` (tested under Tier 1 `unit` in pure Node), export via barrel `index.tsx` and register in TypeDoc.
- **Documentation Parity & Starlight TypeDoc:** Whenever a component, hook, utility or pure helper is created, its entry point MUST be added to `starlightTypeDoc.entryPoints` in `docs/astro.config.ts`. Automatic discovery is not supported by TypeDoc; explicit registration is mandatory for every export.
- **Architectural Separation:** UI primitives (`src/components/`) decoupled from feature pages (`src/pages/`) and business logic (`src/hooks/`).
- **Accessibility-First (WCAG 2.2 AA):** Keyboard operability, screen reader live announcements (`aria-live="polite"`) and focus management via `tabbable`.

---

## 2. Environment & Tooling Execution

- **Package Manager:** Always use Bun (`bun`).
- **Dev Server:** `bun start` (`vite` with local HTTPS and LAN access via `@vitejs/plugin-basic-ssl` and `server: { host: true }`). Production build: `bun run build`.
- **Running Tests:**
  - Full suite: `bun run test` (or `bun run test:ci`).
  - **CRITICAL:** Do NOT run bare `bun test` because it invokes Bun's native test runner instead of the three-tier Vitest project configuration (`unit`, `component` and `browser`).
  - Targeted test execution: `bun x vitest related --run --bail=1 <file> --passWithNoTests`.
- **Linting & Formatting:**
  - Type-check: `bun x tsc --noEmit`
  - ESLint: `bun x eslint <path> --fix` (enforces import and JSX prop sorting via `eslint-plugin-perfectionist`)
  - Stylelint: `bun x stylelint "src/**/*.scss" --fix`
  - Prettier: `bun x prettier --write <path>`

---

## 3. TypeScript & React 19 Standards

- **TypeScript Configuration (`tsconfig.json`):**
  - `"erasableSyntaxOnly": true`: ECMAScript type annotations proposal; enums and runtime namespaces are forbidden.
  - `"verbatimModuleSyntax": true`: Enforces `import type { ... }` for all type imports.
  - Strict typing: No `any` unless strictly justified for low-level generic utilities. No floating promises (`@typescript-eslint/no-floating-promises`).
  - Exhaustive checks: use `neverReached(value)` from `@/utils/neverReached`.
  - Path alias: `@/*` pointing to `src/*`.
  - **Avoid Type Assertions:** Type assertions (`as Type`, `!` operator) bypass TypeScript and are forbidden unless strictly unavoidable. If an assertion cannot be avoided with reasonable effort, document why in an explanatory comment immediately preceding it.
- **React 19 & React Compiler Standards:**
  - Deprecated React APIs strictly forbidden: no `forwardRef` (use standard `ref` prop), no `defaultProps` (use ES6 default parameters), no `MutableRef` or `MutableRefObject` (use `RefObject<T>`).
  - Automatic memoisation via React Compiler: avoid manual `useMemo` / `useCallback` unless profiling demonstrates necessity.
  - Event handler parameter naming: event parameter MUST always be named `e`, never `event`.
  - Deep immutability: Component props MUST use `ReadonlyExcept<Props, 'ref'>` imported from `@/types/ReadonlyExcept`.
  - Zero redundant effects (`eslint-plugin-react-you-might-not-need-an-effect`): derive state during render or inside event callbacks; never use `useEffect` for state synchronisation.
  - State mutations: Use `immer` / `use-immer` for nested updates.
  - Form controls: All form controls MUST have explicit labels (`jsx-a11y/label-has-associated-control` with `asserts: 'htmlFor'`).

---

## 4. SCSS & BEM Methodology

- **Component-Level Blocks:** React BEM convention (`BlockName-ElementName_modifierName_modifierValue`).
- **Global / Shared Blocks (`src/styles/blocks/`):** Traditional BEM (`block-name__element-name_modifier-name_modifier-value`).
- **Stylelint Constraints:** Maximum nesting depth of 3 levels (`max-nesting-depth: 3`). Property ordering strictly follows `stylelint-config-concentric-order`. Global CSS custom properties (`src/styles/base/_custom-properties.scss`) for theme tokens.
- **Responsive Strategy:** Component internal scaling MUST use CSS Container Queries (`@container`). `@media` queries reserved exclusively for macro-layout in `AppLayout`.
- **SCSS vs CSS Comments:**
  - Sass-only constructs (`$variables`, `@mixin`, `@function`): use silent comments (`//`).
  - Native CSS constructs (rules, BEM selectors, `--*` properties, `@keyframes`, `@container`): use standard CSS comments (`/* ... */`).

---

## 5. Domain Skills Routing

For detailed implementation literature, design patterns and comprehensive examples, consult on-demand skills:

- **Testing patterns & literature:** `.agents/skills/testing-patterns/SKILL.md`
- **Component authoring, React 19 & SCSS BEM:** `.agents/skills/component-authoring/SKILL.md`
- **Accessibility & keyboard navigation:** `.agents/skills/a11y-audit/SKILL.md`
- **Responsive scaling & AppLayout:** `.agents/skills/responsive-scaling/SKILL.md`
- **Code hygiene & automated fixes:** `.agents/skills/code-hygiene-verifier/SKILL.md`

---

## 6. Testing Philosophy (Three-Tier Vitest Architecture)

- **Three-Tier Test Projects (`vitest.config.ts`):**
  1. **`unit` (`environment: 'node'`, no DOM):** Matches `src/**/[a-z]*.test.ts` (excluding `use*.test.ts` and `*.browser.test.ts`). Used for pure utility functions and colocated pure component logic helpers (`someHelper.ts` + `someHelper.test.ts`).
  2. **`component` (`environment: 'happy-dom'`):** Matches `src/**/[A-Z]*.test.{ts,tsx}` and `src/**/use*.test.{ts,tsx}` (excluding `*.browser.test.{ts,tsx}`). Uses `@testing-library/react` and `@testing-library/user-event` for rendering, accessibility contracts and hooks.
  3. **`browser` (Vitest Browser Mode on Playwright headless Chromium):** Matches `src/**/*.browser.test.{ts,tsx}`. Uses `vitest-browser-react` (`await render`) and `vitest/browser` (`page`, `userEvent.setup()`, `await expect.element(...)`). Reserved strictly for behaviours requiring a genuine browser engine: pointer/keyboard drag-and-drop coordinates, native `<dialog>` top-layer mechanics (`showModal()`, `close()`, `Escape`), focus geometry and viewport resizing.
- **Accessible Queries Only:** Query elements by accessible role (`screen.getByRole(...)` in `component` tests or `page.getByRole(...)` in `browser` tests), never by test ID or CSS class unless testing an aria-live region.
- **AAA Test Structure & Single-Act Principle:**
  - Strict Arrange, Act and Assert separation separated by empty lines or explicit comments (`// ARRANGE`, `// ACT`, `// ASSERT`).
  - Strict Single-Act Principle: every test verifies exactly one atomic action. Chaining multiple Act/Assert pairs inside a unit test is prohibited.
- **Testing Quality Standards (see `.agents/skills/testing-patterns/SKILL.md`):**
  - **Tight Assertions:** Exact element references and literals only; never use unverified calls like `.toHaveBeenCalled()` without call count (`toHaveBeenCalledTimes(n)`) and arguments (`toHaveBeenCalledWith(...)`).
  - **Semantic DOM Matchers:** Always use semantic matchers (`toHaveFocus()`, `toBeInTheDocument()`, `toHaveAccessibleName()`, `toBeVisible()`) over raw DOM properties or generic booleans.
  - **Meaningful Assertions:** Assert directly on outcomes and state changes; use `expect.hasAssertions()` in asynchronous branches.
  - **BEM Class Verification:** Verify rendered DOM nodes apply required BEM classes using `toHaveClass(...)`.
  - **Acceptance Scope:** Component-level acceptance tests are reserved for compound stateful containers; presentational leaf components require unit/component tests only.
- **User Event Setup:** Initialise `const user = userEvent.setup()` (from `@testing-library/user-event` in `component` tests or `vitest/browser` in `browser` tests) and `await user.click(...)` or `await user.dragAndDrop(...)`.
- **Hygiene & Mocking:** Never commit `describe.only` or `it.only`. Explicitly type mocks with `Mock<Procedure>` from `'vitest'`.

---

## 7. Git, Commits & Typography

- **Conventional Commits:** Atomic feature integrity following `CONTRIBUTING.md`. Every commit must be complete in itself, build cleanly (`bun x tsc --noEmit`) and pass all tests (`bun run test:ci`).
- **Commit Format:** `<tag>(<scope>): <subject>` where subject line is `<= 50` characters, followed by exactly one blank line and body wrapped at `<= 80` characters with code symbols enclosed in backticks.
- **Allowed Tags:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- **Allowed Scopes:** Strictly lowercase:
  - Components: `app`, `applayout`, `sidebar`, `navbar`, `toolbar`, `preview`, `addsections`, `components`.
  - Pages: `personal`, `education`, `experience`, `projects`, `skills`, `certifications`, `links`, `pages`.
  - Core: `hooks`, `utils`, `types`, `styles`.
  - Tooling/Infra: `vite`, `ts`, `vitest`, `eslint`, `prettier`, `stylelint`, `playwright`, `e2e`, `husky`, `ci`, `package`, `readme`, `docs`, `agents`.
- **Decoupled Commit Phase:** Git commits belong strictly to Phase 4 (Commit) of the engineering workflow. Create commits only after all quality gates pass AND a logical milestone is completed or explicitly requested by the user. Never commit intermediate exploratory or incomplete states.
- **Typography & Prose Invariants:**
  - Traditional British English spelling ("optimise", "initialise", "behaviour", "centre", "colour").
  - Double quotes (`"..."`) for natural language and prose; single quotes (`'...'`) strictly for code (TypeScript, SCSS). Enclose all code identifiers in backticks (`` `...` ``).
  - Spaced em-rules (" — ") for parenthetical thoughts; unspaced en-rules ("–") for ranges (e.g. "1–10", "2020–2024"). Slashes (" / ") surrounded by spaces only when separating compound words.
  - **CRITICAL — STRICT OXFORD COMMA PROHIBITION:** Never use the Oxford comma under any circumstances in commit messages, code comments, docstrings or documentation. In lists of three or more items, never place a comma before the coordinating conjunction ("and" or "or"). Perform a search for `, and` and `, or` across written text before committing.
- **Code Comments:** Multiline comments MUST use JSDoc-style block comments (`/** ... */`) with leading asterisks. Standalone `//` comments reserved for single-line remarks or distinct annotations (e.g. `// TODO:`).

---

## 8. Four-Phase Engineering Workflow

Follow the four-phase workflow to ensure high-quality, deliberate implementation:

1. **Explore:** Read code, understand existing patterns and investigate dependencies without editing files. Prefer Language Server Protocol tools (`lsp_goto_definition`, `lsp_hover` and `lsp_find_references` via `typescript-lsp`) for semantic navigation and type inspection over reading entire source files. When verifying external library APIs, framework idioms or modern patterns (such as React 19, `immer` or `@dnd-kit`), use Context7 (`resolve-library-id` and `query-docs`) following official best practice tips: supply known library IDs directly (e.g. `/react/react`, `/websites/immer_js`) to bypass discovery, specify explicit target versions, scope queries to single concepts, rank with `language: 'TypeScript'` and avoid using Context7 for internal business logic. Use subagents for large codebase explorations to keep main context clean.
2. **Plan & Spec Interview:** For non-trivial tasks or ambiguous requirements, interview the user using `ask_question` to clarify design choices, edge cases and trade-offs. Formulate a structured plan artifact and obtain approval before coding.
3. **Implement & Verify:** Implement changes adhering strictly to architectural invariants. Execute all quality gates (type checking, linters, tests and visual parity) and present concrete verification output.
4. **Commit:** Create atomic, well-scoped Conventional Commits matching project standards upon milestone completion.

---

## 9. Quality Gates, Verification & Context Protocol

Before concluding any turn or claiming task completion, execute and pass all verification gates:

1. **Static Analysis Gate:**
   - Instant LSP diagnostics: use `lsp_diagnostics` for sub-second feedback during editing.
   - Fast lint diagnostics: use `lint-files` tool (via `eslint` MCP server) to inspect diagnostics across modified files in context before executing CLI repairs.
   - Type-check: `bun x tsc --noEmit`
   - Linter: `bun x eslint <modified-files> --fix`
   - Styles: `bun x stylelint "src/**/*.scss" --fix` (if styles modified)
   - TypeDoc registration: verify all created components, hooks, helpers or utilities are registered in `docs/astro.config.ts`.
2. **Automated Testing Gate:**
   - Run targeted tests: `bun x vitest related --run --bail=1 <modified-files> --passWithNoTests`.
   - Full suite before milestones: `bun run test:ci`.
3. **Visual Parity Gate:**
   - For UI, layout or styling changes, verify visual rendering parity across `@react-pdf/renderer` (Yoga engine Flexbox rules only), Live Preview DOM and modal PDF.js canvas with interactive text layer.
4. **Typography & Prose Gate:**
   - Scan all added comments, docstrings and commit messages for Oxford commas (zero `, and` or `, or`).
   - Verify traditional British English and double quotes in prose.
5. **Operational Verification Principles:**
   - **Evidence-Based Output:** Always show concrete command output evidence (command executed, exit code, test pass/fail counts and linter output) rather than asserting success in prose.
   - **Root Cause Diagnosis:** When diagnosing failures, address the underlying cause; never suppress errors, bypass type checks or apply speculative patches.
   - **Adversarial Subagent Review:** For non-trivial feature implementations or multi-file diffs, dispatch a fresh-context subagent to review the git diff against task requirements before declaring completion.
   - **Session Verification Gating:** For autonomous runs, gate stopping conditions using `/goal` criteria and deterministic pre-commit checks (`bun run test:ci`, `bun x tsc --noEmit`).
   - **Context Compaction Survival Rules:** When compacting context, always preserve:
     - The complete list of modified, created and deleted files.
     - Active architectural decisions, invariant constraints and user-specified requirements.
     - Active test and verification commands, targeted test paths and failure diagnostic state.
