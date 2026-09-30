# Workspace Rules: Resume Constructor

## 1. Project Overview & Architectural Principles

- **Core Stack:** React 19, TypeScript (strict), SCSS + BEM, custom Webpack 5, Bun runtime/package manager.
- **Domain:** Production-grade, zero-bootstrap resume generator implementing _The Tech Resume Inside Out_.
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
  - Never use `useEffect` for state synchronisation, transformations, or event reactions. Calculate derived state during render or update state inside event callbacks.
  - State mutations: Use `immer` / `use-immer` for nested state updates.
- **Form Controls & A11y:**
  - All form controls MUST have explicit labels: `jsx-a11y/label-has-associated-control` enforces `asserts: 'htmlFor'`. Never rely on implicit wrapping alone.

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

## 7. Gemini 3.8 Flash Agent Verification Checklist

Before finishing any task or concluding a turn:

1. Run `bun x tsc --noEmit` to verify type safety.
2. Run `bun x eslint <modified-files>` to ensure zero lint errors and perfectionist order compliance.
3. Run `bun x stylelint <modified-scss-files>` if styles were changed.
4. Run `bun x jest --bail --findRelatedTests <modified-files> --passWithNoTests`.
5. If errors occur, diagnose using: `[Error Source] -> [Attempted Fix] -> [Result]`.
