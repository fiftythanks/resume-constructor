# Workspace Rules: Resume Constructor

## 1. Project Overview & Architectural Principles

- **Core Stack:** React 19, TypeScript (strict), SCSS + BEM, custom webpack 5, Bun runtime/package manager.
- **Domain:** Production-grade, zero-bootstrap resume generator implementing _The Tech Resume Inside Out_.
- **Branding & Casing:** Always spell `webpack` in strictly lowercase letters (`webpack`, never capitalised as `Webpack`).
- **Key Constraints:**
  - Component colocation: `Component.tsx`, `Component.scss`, `Component.test.tsx`, `index.tsx` (barrel export).
  - Strict separation: UI primitives (`src/components/`) decoupled from feature pages (`src/pages/`) and business logic (`src/hooks/`).
  - Accessibility-first (WCAG 2.2 AA): Keyboard operability, screen reader live announcements (`aria-live="polite"`) and focus management via `tabbable`.
  - Rendering parity: `@react-pdf/renderer` (Yoga engine Flexbox rules only) vs Live Preview DOM vs canvas fallback.
  - Documentation parity & Starlight TypeDoc: Whenever a component, hook, utility or feature page is created, its entry point MUST be added to `starlightTypeDoc.entryPoints` in `docs/astro.config.ts`. Automatic discovery is not supported by TypeDoc; explicit registration is mandatory for every export.

---

## 2. Bun Environment & Tooling Execution

- **Package Manager:** Always use Bun (`bun`).
- **Running Tests:**
  - Run Jest via `bun run test` (or `bun run test:ci`).
  - **CRITICAL:** Do NOT run bare `bun test` because it invokes Bun's native test runner instead of Jest with JSDOM.
  - For targeted test execution: `bun x jest --bail --findRelatedTests <file> --passWithNoTests`.
- **Linting & Formatting:**
  - ESLint: `bun x eslint <path> --fix`
  - Stylelint: `bun x stylelint "src/**/*.scss" --fix`
  - Prettier: `bun x prettier --write <path>`
  - Type-check: `bun x tsc --noEmit`
- **Build & Dev:**
  - Dev server: `bun start` (`webpack serve --config webpack.dev.ts`)
  - Production build: `bun run build` (`webpack --config webpack.prod.ts`)

---

## 3. TypeScript & React 19 Standards

- **Strict Typing:**
  - No `any` unless strictly justified for low-level generic utilities.
  - No floating promises: `@typescript-eslint/no-floating-promises` is an error. Always `await` or explicitly `void`.
  - Exhaustive switch / union checks: use `neverReached(value)` from `@/utils/neverReached`.
  - Path alias: Use `@/*` pointing to `src/*`.
  - **Avoid Type Assertions As Much As Possible:**
    - Type assertions (`as Type`, `<Type>` and the non-null assertion operator `!`) bypass TypeScript's type checker and must be avoided as much as possible.
    - Rely on natural type inference, exhaustive checks, discriminating unions and runtime type narrowing (such as `typeof`, `instanceof`, null/undefined checks or type predicates) instead of forcing types with assertions.
    - If a type assertion cannot be avoided with reasonable effort, you MUST document why the assertion was necessary in an explanatory comment immediately preceding it.
- **Modern React 19 Standards & Deprecated Code Removal:**
  - The codebase runs strictly on React 19 (current year 2026).
  - Deprecated React APIs, types and legacy patterns are strictly forbidden:
    - Never use `MutableRef` or `MutableRefObject` (in React 19, `useRef` returns `RefObject<T>` whose `.current` property is mutable).
    - Never use `forwardRef` (in React 19, `ref` is a standard component prop).
    - Never use `defaultProps` (use ES6 default parameter values instead).
  - Agents MUST audit their changes for modern React 19 idioms and deprecated APIs before committing. If uncertain about 2026 React 19 or TypeScript idioms, agents MUST search web documentation before proceeding.
- **Event Handler Parameter Naming:**
  - In all React event handlers and callback functions (`onChange`, `onClick`, `onKeyDown`, `onFocus` etc.), the event parameter MUST always be named `e`, never `event`.
- **Deep Immutability Pattern:**
  - Component props MUST use `ReadonlyExcept<Props, 'ref'>` imported from `@/types/ReadonlyExcept`.
  - Deep immutability is enforced across component boundaries.
- **React Patterns & Zero Redundant Effects:**
  - Adhere strictly to `eslint-plugin-react-you-might-not-need-an-effect`.
  - Never use `useEffect` for state synchronisation, transformations or event reactions. Calculate derived state during render or update state inside event callbacks.
  - State mutations: Use `immer` / `use-immer` for nested state updates.
- **Form Controls & A11y:**
  - All form controls MUST have explicit labels: `jsx-a11y/label-has-associated-control` enforces `asserts: 'htmlFor'`. Never rely on implicit wrapping alone.
- **Comment Standards & Typography:**
  - All multiline comments MUST use JSDoc-style block comments (`/** ... */`) with leading asterisks on continuation lines, never consecutive single-line (`//`) comments.
  - Single-line comments (`//`) are strictly reserved for standalone, single-line remarks. Consecutive single-line comments are permitted only when representing distinct annotations (e.g. separate `// TODO:` or `// DILEMMA:` entries).
  - Comment, commit message and documentation typography must strictly adhere to project standards: traditional British English, double quotes (`"..."`) for natural language, spaced em-rules ("—"), unspaced en-rules ("–") and forward slashes ("/") surrounded by spaces only when separating compound words.
  - **CRITICAL — STRICT OXFORD COMMA PROHIBITION:** Never use the Oxford comma (serial comma) under any circumstances in commit messages, code comments, docstrings or documentation. In lists of three or more items, never place a comma before the coordinating conjunction ("and" or "or").
    - Correct: `"apples, oranges and bananas"` ✔️
    - Incorrect: `"apples, oranges, and bananas"` ❌
    - Correct: `"Education, Experience or Projects"` ✔️
    - Incorrect: `"Education, Experience, or Projects"` ❌
    - Always perform a dedicated search for `, and` and `, or` across your written text before committing.

---

## 4. SCSS & BEM Methodology

- **Component-Level Blocks:**
  - Use React BEM convention: `BlockName-ElementName_modifierName_modifierValue`.
  - Example: `.Button`, `.Button_paddingInline_none`, `.Button_width_full`.
- **Global / Shared Blocks (`src/styles/blocks/`):**
  - Use traditional BEM convention: `block-name__element-name_modifier-name_modifier-value`.
- **Stylelint Constraints:**
  - Nesting depth must not exceed 3 levels (`max-nesting-depth: 3`).
  - Property ordering strictly follows `stylelint-config-concentric-order`.
  - Global CSS custom properties (defined in `src/styles/base/_custom-properties.scss`) are used for theme tokens.
- **Responsive Strategy:**
  - Internal component scaling MUST use CSS Container Queries (`@container`).
  - `@media` queries are reserved exclusively for macro-layout changes in `AppLayout`.
- **SCSS vs CSS Comment Standards:**
  - **Sass/SCSS-only constructs** (e.g. Sass `$variables`, `@mixin`, `@function` and Sass control directives): Because these constructs are compiled away and do not exist in the final CSS output, comments documenting them MUST use silent comments (`//`), even when spanning multiple lines. This ensures notes on Sass-specific internals are stripped and never leak into the compiled CSS bundle.
  - **Native CSS constructs** (e.g. CSS rules, BEM selectors, property declarations, CSS custom properties `--*`, `@keyframes` and `@container` queries): Because these constructs exist directly in the final CSS output, comments documenting them MUST use standard CSS comments (`/* ... */`) so documentation remains attached to the actual CSS code in the compiled stylesheet.

---

## 5. Import & Code Ordering (`eslint-plugin-perfectionist`)

Every file must strictly adhere to the automated sorting hierarchy:

### Import Sorting Groups:

1. `react` (`^react$`, `^react-dom$`)
2. `builtin` (Node built-ins: `fs`, `path`, etc.)
3. `external` (npm dependencies: `@testing-library/react`, `clsx`, `tabbable`, etc.)
4. `hooks` (`^@/hooks/.*`)
5. `layout` (`^@/layout/.*`)
6. `pages` (`^@/pages/.*`)
7. `components` (`^@/components/.*`)
8. `utils` (`^@/utils/.*`)
9. Relative (`['parent', 'sibling', 'index']`)
10. `assets` (`^@/assets/.*`)
11. `style` (`./*.scss`, etc.)
12. `type` (`import type { ... }`)
13. `unknown`

### JSX Props Sorting:

1. `shorthand-prop` (e.g., `disabled`, `required`)
2. `unknown` (standard props: `id`, `name`, `type`, etc.)
3. `callback` (`^on[A-Z].+`, e.g., `onChange`, `onClick`)
4. `multiline-prop` (props spanning multiple lines)

---

## 6. Testing Philosophy (Jest + React Testing Library)

- **Accessible Queries Only:** Query elements by accessible role (`screen.getByRole('button', { name: /save/i })`), never by test ID or CSS class unless testing an aria-live region.
- **AAA Test Structure (Arrange, Act and Assert):** Every test must clearly follow the Arrange-Act-Assert pattern. Tests must be separated by empty lines into three distinct stages (Arrange, Act and Assert). Whenever a test is not clearly divided by empty lines into these three stages, each stage must be explicitly announced with a comment (`// ARRANGE`, `// ACT` and `// ASSERT`). While the stages themselves must be distinct, the code _within_ each stage (especially Arrange or Assert) does not need to be a single contiguous block. Empty lines are welcome and encouraged inside an Arrange, Act or Assert block to separate distinct parts of logic for better readability.
- **Strict Single-Act Principle & Prohibition of Multiple Acts:** Every unit test must test exactly one atomic behaviour. Chaining multiple `Act` and `Assert` sequences (e.g. `// ARRANGE` -> `// ACT` -> `// ASSERT` -> `// ACT` -> `// ASSERT`) inside a single test is strictly prohibited (the "Multiple Act" / "Eager Test" anti-pattern). If a test exercises multiple discrete actions (such as focusing and tabbing, or navigating, adding and deleting), it MUST be decomposed into separate, atomic test cases each with its own descriptive title. A unit test must contain exactly one `Act` phase; multiple assertions within that single `Assert` phase are encouraged when checking multiple facets of that same atomic action. Multi-act sequences are reserved exclusively for full user journeys in end-to-end (E2E) integration workflows.
- **Lucas da Costa Testing Standards (_Testing JavaScript Applications_):**
  - **Tight Assertions & No Loose Matchers (Section 3.2.2):** Assertions must be as strict and deterministic as possible. Never use loose matchers like `expect.any(...)` when an exact element reference or literal is known. Never use unverified generic calls like `.toHaveBeenCalled()` without specifying call count (`toHaveBeenCalledTimes(n)`) and expected arguments (`toHaveBeenCalledWith(...)`).
  - **Semantic DOM Matchers over Raw DOM Checks (Section 3.2.3 & Section 6.2.2):** Always use `@testing-library/jest-dom` matchers (`toHaveFocus()`, `toBeInTheDocument()`, `toHaveAccessibleName()`, `toBeVisible()`) instead of checking raw DOM properties like `document.activeElement` or generic booleans.
  - **Sensitive and Meaningful Assertions (Section 3.2.1):** Every assertion must directly verify the intended outcome or side effect of the action. Do not assert unrelated element presence as a proxy for error-free execution; explicitly assert on behaviour, lack of thrown errors or resulting state changes. Use `expect.hasAssertions()` in asynchronous or event-driven test cases where conditional branches might otherwise cause tests to pass vacuously.
  - **Component Style & Class Verification (Section 8.3):** When components are styled with semantic or BEM classes, verify that the rendered DOM nodes apply their required CSS classes using `toHaveClass(...)`.
  - **Component-Level Acceptance Workflows (Section 8.4):** Only write component-level acceptance tests where behaviour, user intent and business risk intersect (complex stateful feature containers, flow gates and compound primitives). Never write acceptance tests for presentational or leaf components (`SectionItemHeader`, `Button`, dumb layout shells) and never create artificial stateful wrapper components inside test files to simulate state that lives in external hooks. Treat the boundary of an acceptance test as the boundary of a genuine user capability; leave broad multi-page journeys to Playwright E2E tests.
- **User Event Setup:** Always initialise `const user = userEvent.setup()` and `await user.click(...)`.
- **Strict Hygiene:** Never commit `describe.only` or `it.only` (`no-restricted-properties` lint rule).
- **Mocking:** Explicitly type mocks with `jest.Mock<ReturnType, Parameters>`.
- **JSDOM Focus Workaround:** When using `tabbable`, pass `{ displayCheck: process.env.NODE_ENV === 'test' ? 'none' : 'full' }`.

---

## 7. Git & Commit Message Standards (Conventional Commits)

Strictly adhere to the project conventions defined in `CONTRIBUTING.md`:

- **Atomic Feature Integrity:** Every commit MUST be complete in itself and fully functional. A commit must contain the code change, its comprehensive tests, related refactors and documentation updates together so that every individual commit builds cleanly (`bun x tsc --noEmit`), passes all tests (`bun run test:ci`) and preserves git bisectability. Incomplete commits that introduce broken intermediate states, lack tests or defer related refactors are strictly forbidden.
- **Commit Format:** `<tag>(<scope>): <subject>` (or `<tag>: <subject>` for broad chores or docs).
- **Subject Length:** First line MUST NOT exceed 50 characters (`<= 50`).
- **Separation:** Exactly one blank line between the subject and body.
- **Body Line Length:** Every body line MUST NOT exceed 80 characters (`<= 80`).
- **Code Symbols in Body:** Enclose all identifiers, component names, filenames, directory paths, props and attributes in backticks in the commit body (not the first line).
- **Spelling & Style:** Write all commit messages and code comments in traditional British English ("optimise", "initialise", "behaviour", "centre", "colour") and strictly NO Oxford comma.
- **Quotation Marks in Prose vs Code:** In documentation, commit messages and code comments, ALWAYS use double quotes (`"..."`) for quotes and natural language punctuation (do NOT use British-style single quotation marks in prose). Single quotes (`'...'`) are strictly reserved for code implementation (TypeScript, JavaScript and SCSS). Enclose all code symbols, identifiers and file paths in backticks (`` `...` ``).
- **Dash Typography:** Em-rules ("—") must ALWAYS be separated by spaces from the surrounding text (e.g. "word — word"), but must not be separated by spaces from surrounding brackets if inside brackets. En-rules ("–"), representing ranges and similar things, must NOT have any spaces surrounding them (e.g. "1–10", "lines 20–35", "2020–2024").
- **Slash Typography:** A forward slash ("/") must ONLY be surrounded by spaces if it separates compound words (e.g. "word combination / another combination"). When separating single words, terms, identifiers or paths, no spaces are permitted (e.g. "`Sidebar`/`Navbar`", "Prev/Next/Add/Delete", "true/false").
- **Allowed Tags:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- **Allowed Scopes:** Strictly lowercase:
  - Components: `app`, `applayout`, `sidebar`, `navbar`, `toolbar`, `preview`, `addsections`, `components`.
  - Pages: `personal`, `education`, `experience`, `projects`, `skills`, `certifications`, `links`, `pages`.
  - Core: `hooks`, `utils`, `types`, `styles`.
  - Tooling/Infra: `webpack`, `husky`, `ci`, `e2e`, `jest`, `eslint`, `package`, `readme`, `docs`, `agents`.

---

## 8. Gemini 3.8 Flash Agent Verification Checklist

Before finishing any task or concluding a turn:

1. Run `bun x tsc --noEmit` to verify type safety.
2. Check for modern React 19 standards: verify zero deprecated APIs or types (no `MutableRefObject`, no `forwardRef`, no `defaultProps`). Search web documentation if unsure.
3. Verify event handler parameter naming: ensure all event parameters are named `e`, never `event`.
4. If a component, hook, utility or page was created, verify its entry point is registered in `docs/astro.config.ts`.
5. Run `bun x eslint <modified-files> --fix` to ensure zero lint errors and perfectionist order compliance.
6. Run `bun x stylelint <modified-scss-files> --fix` if styles were changed.
7. Run `bun x jest --bail --findRelatedTests <modified-files> --passWithNoTests`.
8. **Prose & Typography Audit:** Scan all added comments, docstrings and commit messages for Oxford commas (search for `, and` / `, or`) and remove them. Verify traditional British English and double quotes.
9. If errors occur, diagnose using: `[Error Source] -> [Attempted Fix] -> [Result]`.
10. Once all verification checks pass cleanly, create an atomic git commit for the completed change following the commit conventions in section 7 before concluding the task.
