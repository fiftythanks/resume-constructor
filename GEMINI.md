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
  - Dev server: `bun start` (`webpack serve --config webpack.dev.cjs`)
  - Production build: `bun run build` (`webpack --config webpack.prod.cjs`)

---

## 3. TypeScript & React 19 Standards

- **Strict Typing:**
  - No `any` unless strictly justified for low-level generic utilities.
  - No floating promises: `@typescript-eslint/no-floating-promises` is an error. Always `await` or explicitly `void`.
  - Exhaustive switch / union checks: use `neverReached(value)` from `@/utils/neverReached`.
  - Path alias: Use `@/*` pointing to `src/*`.
- **Deep Immutability Pattern:**
  - Component props MUST use `ReadonlyExcept<Props, 'ref'>` imported from `@/types/ReadonlyExcept`.
  - Deep immutability is enforced across component boundaries.
- **React Patterns & Zero Redundant Effects:**
  - Adhere strictly to `eslint-plugin-react-you-might-not-need-an-effect`.
  - Never use `useEffect` for state synchronisation, transformations or event reactions. Calculate derived state during render or update state inside event callbacks.
  - State mutations: Use `immer` / `use-immer` for nested state updates.
- **Form Controls & A11y:**
  - All form controls MUST have explicit labels: `jsx-a11y/label-has-associated-control` enforces `asserts: 'htmlFor'`. Never rely on implicit wrapping alone.
- **Comment Standards:**
  - All multiline comments MUST use JSDoc-style block comments (`/** ... */`) with leading asterisks on continuation lines, never consecutive single-line (`//`) comments.
  - Single-line comments (`//`) are strictly reserved for standalone, single-line remarks. Consecutive single-line comments are permitted only when representing distinct annotations (e.g. separate `// TODO:` or `// DILEMMA:` entries).
  - Comment and documentation typography must strictly adhere to project standards: traditional British English, no Oxford comma, double quotes (`"..."`) for natural language, spaced em-rules ("—"), unspaced en-rules ("–") and forward slashes ("/") surrounded by spaces only when separating compound words.

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
- **User Event Setup:** Always initialise `const user = userEvent.setup()` and `await user.click(...)`.
- **Strict Hygiene:** Never commit `describe.only` or `it.only` (`no-restricted-properties` lint rule).
- **Mocking:** Explicitly type mocks with `jest.Mock<ReturnType, Parameters>`.
- **JSDOM Focus Workaround:** When using `tabbable`, pass `{ displayCheck: process.env.NODE_ENV === 'test' ? 'none' : 'full' }`.

---

## 7. Git & Commit Message Standards (Conventional Commits)

Strictly adhere to the project conventions defined in `CONTRIBUTING.md`:

- **Atomic Commits:** Commit every logical change independently and atomically.
- **Commit Format:** `<tag>(<scope>): <subject>` (or `<tag>: <subject>` for broad chores).
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
2. Run `bun x eslint <modified-files>` to ensure zero lint errors and perfectionist order compliance.
3. Run `bun x stylelint <modified-scss-files>` if styles were changed.
4. Run `bun x jest --bail --findRelatedTests <modified-files> --passWithNoTests`.
5. If errors occur, diagnose using: `[Error Source] -> [Attempted Fix] -> [Result]`.
