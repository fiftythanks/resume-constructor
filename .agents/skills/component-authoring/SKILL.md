---
name: component-authoring
description: >-
  Use this skill when creating, refactoring or scaffolding React 19 components and feature pages.
  Applies component colocation in src/components/, the ReadonlyDeep props pattern (or ReadonlyExcept when
  excepting refs), React 19 standards and component-scoped BEM SCSS styling. For styling ResumeDocument.tsx,
  references Yoga Flexbox rules. Do NOT use for authoring test suites (use testing-patterns), diagnosing
  static type or lint errors across existing files (use code-hygiene-verifier) or configuring responsive
  macro-layout (use responsive-scaling).
---

# Component Authoring Workflow

When authoring or modifying components in this project, adhere strictly to the following structure and architectural principles.

> [!NOTE]
>
> - When scaffolding a new component from scratch, read `references/component-template.tsx` for the exact boilerplate structure.
> - When structuring SCSS properties, read `references/concentric-order.scss` to ensure compliance with Stylelint concentric order rules.
> - When authoring styles for the `@react-pdf/renderer` document in `ResumeDocument.tsx`, read `references/react-pdf-yoga.md` for supported Flexbox properties.

---

## 1. Directory Structure (Component Colocation)

Every component lives in its own dedicated directory under `src/components/<ComponentName>/` (or `src/pages/<PageName>/` for feature pages):

```text
src/components/MyComponent/
├── MyComponent.tsx              # Component definition and props interface
├── MyComponent.scss             # Component-scoped BEM styles
├── MyComponent.test.tsx         # Component tests (happy-dom + @testing-library/react)
├── MyComponent.browser.test.tsx # Optional real-browser tests (Vitest Browser Mode)
├── someHelper.ts                # Optional extracted pure logic helper
├── someHelper.test.ts           # Optional pure Node unit tests (environment: 'node')
└── index.tsx                    # Single-line barrel export
```

### Barrel Export (`index.tsx`)

```tsx
export { default } from './MyComponent';
```

---

## 2. Component Implementation Standards

1. **Deep Immutability & Props Typing:**
   - **Default:** Always type component props using `ReadonlyDeep<MyComponentProps>` imported from `'type-fest'`.
   - **Exception:** Only use `ReadonlyExcept<MyComponentProps, 'ref'>` (imported from `@/types/ReadonlyExcept`) when a specific prop (such as a callback ref or `RefObject`) must be excepted from deep immutability.
2. **React 19 Standards:**
   - In React 19, `ref` is a standard prop. Deprecated APIs (`forwardRef`, `defaultProps`, `MutableRefObject`) are forbidden.
   - Use `RefObject<T>` for mutable refs.
3. **Event Handler Parameter Naming:**
   - In all React event handlers and callbacks (`onChange`, `onClick`, `onKeyDown`, `onFocus`), always name the event parameter `e`, never `event`.
4. **Documentation Parity & Starlight TypeDoc:**
   - Whenever authoring a new component, hook, helper or utility, register its entry point in `docs/astro.config.ts` under `starlightTypeDoc.entryPoints`.
5. **Zero Redundant Effects:**
   - Do not introduce `useEffect` for state synchronisation or derived values. Calculate values directly during render.
6. **Accessible Controls:**
   - Form controls must have an explicit `id` and associated `<label htmlFor={id}>`.
7. **Avoid Type Assertions:**
   - Avoid `as Type`, `<Type>` and `!` operators. Rely on discriminated unions, runtime narrowing (`typeof`, `instanceof`) or custom type guards. If strictly unavoidable, document why with an explanatory comment directly preceding it.
8. **Test Delegation:**
   - For all test authoring (unit, component or browser tiers), invoke the `testing-patterns` skill.

---

## 3. SCSS Styling Guidelines

1. **BEM Naming:**
   - Block: `.MyComponent`
   - Elements: `.MyComponent-Header`, `.MyComponent-Body`
   - Modifiers: `.MyComponent_variant_primary`, `.MyComponent_size_large`
2. **Nesting Depth:** Maximum nesting depth is **3** (`max-nesting-depth: 3`).
3. **Concentric Ordering:** Positioning -> Box Model -> Typography -> Visual -> Misc (see `references/concentric-order.scss`).
4. **Responsive Strategy:** Use `@container` for internal component layout shifts. Never use `@media` inside UI components.
5. **SCSS vs CSS Comments:**
   - Sass-only constructs (`$variables`, `@mixin`, `@function`): Use silent comments (`//`).
   - Native CSS constructs (rules, selectors, properties, `--*` tokens, `@container`): Use standard CSS comments (`/* ... */`).
6. **Typography & Prose Invariants:**
   - Traditional British English spelling ("optimise", "initialise", "behaviour", "centre", "colour").
   - Double quotes (`"..."`) for natural language and prose punctuation. Single quotes (`'...'`) for code syntax. Backticks (`` `...` ``) for code symbols.
   - **Oxford Comma Style:** Omit the Oxford comma in lists of three or more items in comments and documentation.
