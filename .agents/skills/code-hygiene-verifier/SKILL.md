---
name: code-hygiene-verifier
description: >-
  Use this skill to verify and fix type errors, ESLint violations, Stylelint issues,
  formatting and test regressions across the repository using Bun.
---

# Code Hygiene & Verification Runbook

Follow this runbook after making changes or when diagnosing failing builds, commits or CI checks.

---

## 1. Fast Feedback Verification Sequence

Always execute the checks in this sequence:

```bash
# 1. Typecheck
bun x tsc --noEmit

# 2. ESLint check and auto-fix
bun x eslint <modified-files> --fix

# 3. Stylelint check and auto-fix (for SCSS files)
bun x stylelint "src/**/*.scss" --fix

# 4. Prettier check / format
bun x prettier --write <modified-files>

# 5. Targeted test suite execution
bun x jest --bail --findRelatedTests <modified-files> --passWithNoTests
```

> [!IMPORTANT]
> Never run bare `bun test`. Bun's native test runner does not run JSDOM or use the Jest setup. Always run `bun run test` (for full suite) or `bun x jest` (for targeted test runs).

---

## 2. Common Linting Issues & Solutions

### A. Perfectionist Import Order Violations

`eslint-plugin-perfectionist` strictly enforces this exact 13-group hierarchy:

1. `react`, `react-dom`
2. Node built-ins (`fs`, `path`, etc.)
3. External npm packages (`@testing-library/react`, `tabbable`, `clsx`, etc.)
4. `@/hooks/*`
5. `@/layout/*`
6. `@/pages/*`
7. `@/components/*`
8. `@/utils/*`
9. Relative paths (`../`, `./`)
10. `@/assets/*`
11. Styles (`./*.scss`)
12. Type imports (`import type { ... }`)
13. Unknown

**Auto-fix:** Running `bun x eslint <file> --fix` will resolve import sorting automatically.

---

### B. Perfectionist JSX Props Order

Props must be placed in this exact sequence:

1. Shorthand boolean props (`disabled`, `required`)
2. Regular attributes (`id`, `className`, `type`, `value`)
3. Event handlers / callbacks (`onBlur`, `onChange`, `onClick`)
4. Multiline props (any prop spanning multiple lines)

---

### C. Floating Promises (`@typescript-eslint/no-floating-promises`)

All promises must be handled explicitly:

```tsx
// ❌ WRONG
user.click(button);

// ✅ CORRECT
await user.click(button);

// ✅ OR if explicitly unawaited:
void asyncFunction();
```

---

### D. No Redundant Effects (`eslint-plugin-react-you-might-not-need-an-effect`)

- Do not use `useEffect` to copy props into state or compute derived data.
- Calculate derived state inline during render:
  ```tsx
  // ✅ Direct derivation
  const fullName = `${firstName} ${lastName}`;
  ```
- Trigger side-effects and multi-field updates directly in event handlers rather than cascading `setState` calls across effects.

---

### E. Accessible Form Labels (`jsx-a11y/label-has-associated-control`)

Rule mandates explicit `htmlFor` association:

```tsx
// ❌ WRONG (implicit wrapping only)
<label>
  Username
  <input type="text" />
</label>

// ✅ CORRECT (explicit association)
<label htmlFor="username-input">Username</label>
<input id="username-input" type="text" />
```

---

### F. SCSS Stylelint & Comment Rules

- **Concentric Order:** Properties must be sorted: Positioning (`position`, `top`) -> Box Model (`display`, `width`, `margin`, `padding`, `border`) -> Typography (`font`, `color`, `text-align`) -> Visual (`background`, `opacity`) -> Misc (`cursor`, `transition`).
- **Max Nesting Depth 3:** Flatten SCSS selectors that exceed 3 levels of nesting.
- **SCSS vs CSS Comments:**
  - For Sass/SCSS-only constructs (Sass `$variables`, `@mixin`, `@function` and control directives): Use silent comments (`//`), even when multi-line, so they are not emitted into the compiled CSS bundle.
  - For native CSS constructs (rules, selectors, properties, `--*` custom properties, `@keyframes` and `@container` queries): Use standard CSS comments (`/* ... */`) so documentation remains in the compiled CSS stylesheet.
- **Auto-fix:** Run `bun x stylelint "src/**/*.scss" --fix`.

---

### G. Typography & Documentation Standards

All documentation, markdown files, commit messages and code comments must adhere to strict typographic rules:

- **Language & Casing:** Traditional British English ("optimise", "initialise", "behaviour", "centre", "colour"), lowercase `webpack`.
- **CRITICAL — STRICT OXFORD COMMA PROHIBITION:** Never use the Oxford comma (serial comma) in commit messages, code comments, docstrings or documentation. In lists of three or more items, never place a comma before the coordinating conjunction ("and" or "or").
  - Correct: `"apples, oranges and bananas"` ✔️
  - Incorrect: `"apples, oranges, and bananas"` ❌
  - Correct: `"Education, Experience or Projects"` ✔️
  - Incorrect: `"Education, Experience, or Projects"` ❌
  - Always search for `, and` and `, or` across your written text before committing.
- **Quotation Marks:** In documentation and prose, always use double quotes (`"..."`) for natural language and punctuation references (never single quotes). Single quotes (`'...'`) are reserved for code syntax (TypeScript, JavaScript and SCSS). Backticks (`` `...` ``) are used for code identifiers, symbols and file paths.
- **Dash Typography:** Spaced em-rules ("—") for parenthetical statements, unspaced en-rules ("–") for numerical or chronological ranges ("1–10", "2020–2024").
- **Slash Typography:** Forward slashes ("/") must only be surrounded by spaces when separating compound words (e.g. "macro layout / navigation adaptation"). Never use spaces when separating single words or identifiers (e.g. "`Sidebar`/`Navbar`", "Prev/Next/Add/Delete", "true/false").

---

### H. Modern React 19 Standards & Deprecated Code Removal

- The codebase strictly runs on React 19 (current year 2026).
- Deprecated React APIs, types and legacy patterns are strictly forbidden:
  - Never use `MutableRef` or `MutableRefObject` (`useRef` returns `RefObject<T>` where `.current` is mutable).
  - Never use `forwardRef` (`ref` is a standard component prop in React 19).
  - Never use `defaultProps` (use ES6 default parameter values).
- Check your work for modern React 19 idioms and deprecated APIs before committing. If uncertain about 2026 React 19 or TypeScript idioms, search web documentation to verify.
- **Event Parameter Naming:** In all React event handlers and callbacks (`onChange`, `onClick`, `onKeyDown`, `onFocus` etc.), always name the event parameter `e`, never `event`.

---

### I. Starlight TypeDoc Documentation Synchronisation

Whenever creating a component, hook, utility or feature page, its entry point MUST be added to `starlightTypeDoc.entryPoints` in `docs/astro.config.ts`. Automatic discovery is not supported by TypeDoc; explicit registration is mandatory for every export.

---

### J. AAA Test Structure (Arrange, Act and Assert)

- Every unit test must follow the Arrange-Act-Assert pattern. Distinct stages must be separated by empty lines. Whenever a test is not clearly divided by empty lines into three distinct stages, each stage must be explicitly announced with a comment (`// ARRANGE`, `// ACT` and `// ASSERT`). While the stages themselves must be distinct, the code _within_ each stage (especially Arrange or Assert) does not need to be a single contiguous block. Empty lines are welcome and encouraged inside an Arrange, Act or Assert block to separate distinct parts of logic for better readability.
- **Strict Single-Act Principle:** Unit tests must test a single atomic behaviour. Chaining multiple `Act` and `Assert` sequences (`// ARRANGE` -> `// ACT` -> `// ASSERT` -> `// ACT` -> `// ASSERT`) inside a single unit test is strictly prohibited (the "Multiple Act" / "Eager Test" anti-pattern). Decompose multi-step interactions into separate, atomic test cases. Each unit test must contain exactly one `Act` phase; multiple assertions within that single `Assert` phase are encouraged when checking multiple facets of that same atomic action.

---

### K. Strict Type Safety & Avoiding Type Assertions

- **Avoid Type Assertions:** Type assertions (using `as Type`, `<Type>` and the non-null assertion operator `!`) bypass TypeScript's static analysis and must be avoided as much as possible.
- **Narrow Instead of Asserting:** Use natural type inference, discriminating unions and runtime type narrowing (`typeof`, `instanceof`, `Array.isArray`, null checks or custom type guards) to let the compiler safely refine types.
- **Documented Exceptions Only:** If a type assertion cannot be avoided with reasonable effort (e.g. interacting with third-party libraries lacking accurate types or certain delegated DOM event targets), the rationale MUST be documented in an explanatory comment immediately preceding the assertion explaining why it was necessary.

---

## 3. Full Pre-Push Audit

Before pushing or completing large refactors:

```bash
bun x tsc --skipLibCheck --noEmit && bun x eslint . && bun x stylelint "src/**/*.scss" && bun run test:ci
```
