---
name: component-authoring
description: >-
  Use this skill when creating, modifying or refactoring React components in this codebase.
  Enforces component colocation, ReadonlyExcept props pattern, React 19 standards,
  accessible HTML markup and BEM SCSS styling.
---

# Component Authoring Workflow

When authoring or modifying components in this project, adhere strictly to the following structure and architectural principles.

---

## 1. Directory Structure (Component Colocation)

Every component lives in its own dedicated directory under `src/components/<ComponentName>/` (or `src/pages/<PageName>/` for feature pages):

```text
src/components/MyComponent/
├── MyComponent.tsx         # Component definition and props interface
├── MyComponent.scss        # Component-scoped BEM styles
├── MyComponent.test.tsx    # Comprehensive Jest + React Testing Library tests
└── index.tsx               # Single-line barrel export
```

### Barrel Export (`index.tsx`)

```tsx
export { default } from './MyComponent';
```

---

## 2. Component Implementation Template (`MyComponent.tsx`)

```tsx
import type {
  MouseEventHandler,
  ReactNode,
  RefCallback,
  RefObject,
} from 'react';

import { clsx } from 'clsx';

import './MyComponent.scss';

import type { ReadonlyExcept } from '@/types/ReadonlyExcept';

export interface MyComponentProps {
  children?: ReactNode;
  className?: string;
  elements?: string | string[];
  id?: string;
  modifiers?: string | string[];
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ref?: RefCallback<HTMLButtonElement> | RefObject<HTMLButtonElement | null>;
}

type ReadonlyMyComponentProps = ReadonlyExcept<MyComponentProps, 'ref'>;

/**
 * Detailed JSDoc comment explaining component purpose, accessibility behavior,
 * and usage examples.
 */
export default function MyComponent({
  children,
  className,
  elements,
  id,
  modifiers,
  onClick,
  ref,
  ...rest
}: ReadonlyMyComponentProps) {
  const componentClassName = clsx(
    'MyComponent',
    className,
    elements,
    modifiers,
  );

  return (
    <button
      className={componentClassName}
      id={id}
      onClick={onClick}
      ref={ref}
      type="button"
      {...rest}
    >
      {children}
    </button>
  );
}
```

### Key Rules:

1. **Deep Immutability:** Always type props using `ReadonlyExcept<MyComponentProps, 'ref'>` imported from `@/types/ReadonlyExcept`.
2. **Modern React 19 Standards & Deprecated Code Removal:**
   - The codebase strictly runs on React 19.
   - Deprecated React APIs, types and legacy patterns are strictly forbidden:
     - Never use `MutableRef` or `MutableRefObject` (`useRef` returns `RefObject<T>` where `.current` is mutable).
     - Never use `forwardRef` (`ref` is a standard component prop in React 19).
     - Never use `defaultProps` (use ES6 default parameter values).
   - Check your work for modern React 19 idioms and deprecated APIs before committing. If uncertain about 2026 React 19 or TypeScript idioms, search web documentation to verify.
3. **Event Handler Parameter Naming:** In all React event handlers and callbacks (`onChange`, `onClick`, `onKeyDown`, `onFocus` etc.), always name the event parameter `e`, never `event`.
4. **Documentation Parity & Starlight TypeDoc:** Whenever authoring a new component, hook or utility, register its entry point in `docs/astro.config.ts` under `starlightTypeDoc.entryPoints`.
5. **Import Ordering:** Must follow the `eslint-plugin-perfectionist` groups:
   `react` -> `builtin` -> `external` -> `hooks` (`@/hooks/.*`) -> `layout` (`@/layout/.*`) -> `pages` (`@/pages/.*`) -> `components` (`@/components/.*`) -> `utils` (`@/utils/.*`) -> relative imports -> `assets` (`@/assets/.*`) -> `style` (`./*.scss`) -> `type` (`import type ...`) -> `unknown`.
6. **JSX Props Ordering:**
   `shorthand-prop` (e.g. `disabled`) -> `unknown` (e.g. `className`, `id`) -> `callback` (e.g. `onClick`) -> `multiline-prop`.
7. **No Redundant Effects:** Do not introduce `useEffect` for state synchronisation or derived values. Calculate values directly during render.
8. **Accessible Labeling:** If creating form controls, ensure inputs have an explicit `id` and corresponding `<label htmlFor={id}>`.

---

## 3. SCSS Styling Guidelines (`MyComponent.scss`)

1. **BEM Naming:**
   - Block: `.MyComponent`
   - Elements: `.MyComponent-Header`, `.MyComponent-Body`
   - Modifiers: `.MyComponent_variant_primary`, `.MyComponent_size_large`
2. **Nesting Depth:** Maximum nesting depth is **3** (`max-nesting-depth: 3`).
3. **Property Ordering:** Strictly follow concentric ordering (Positioning -> Box Model -> Typography -> Visual -> Misc):

   ```scss
   .MyComponent {
     display: flex;
     flex-direction: column;
     border: 0;
     border-radius: 5px;
     background-color: var(--secondary-color);
     padding: 1rem;
     color: var(--text-color);

     &:hover {
       cursor: pointer;
     }

     &_variant {
       &_primary {
         background-color: var(--button-bgc-main);
       }
     }
   }
   ```

4. **Responsive Strategy:** Use `@container` for internal component layout shifts. Do not use `@media` inside UI components.
5. **Comment & Typography Standards:**
   - Multiline JSDoc blocks (`/** ... */`) with leading asterisks on continuation lines.
   - Traditional British English spelling ("optimise", "initialise", "behaviour", "centre", "colour").
   - Double quotes (`"..."`) for natural language and prose punctuation.
   - Spaced em-rules ("—"), unspaced en-rules ("–") for ranges and forward slashes ("/") surrounded by spaces only when separating compound words.
   - **CRITICAL — STRICT OXFORD COMMA PROHIBITION:** Never use the Oxford comma in code comments, docstrings or commit messages.
     - Correct: `"apples, oranges and bananas"` ✔️
     - Incorrect: `"apples, oranges, and bananas"` ❌
     - Perform a search for `, and` and `, or` across written comments before completing work.

---

## 4. Test Implementation Template (`MyComponent.test.tsx`)

```tsx
import type { MouseEvent } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import MyComponent from './MyComponent';

describe('MyComponent', () => {
  let handleClickMock: jest.Mock<void, [MouseEvent<HTMLButtonElement>]>;

  beforeEach(() => {
    handleClickMock = jest.fn();
  });

  it('should render with accessible role and name', () => {
    // ARRANGE & ACT
    render(<MyComponent onClick={handleClickMock}>Action</MyComponent>);

    // ASSERT
    const btn = screen.getByRole('button', { name: /action/i });
    expect(btn).toBeInTheDocument();
  });

  it('should handle click interactions via userEvent', async () => {
    // ARRANGE
    const user = userEvent.setup();
    render(<MyComponent onClick={handleClickMock}>Action</MyComponent>);
    const btn = screen.getByRole('button', { name: /action/i });

    // ACT
    await user.click(btn);

    // ASSERT
    expect(handleClickMock).toHaveBeenCalledTimes(1);
  });
});
```

### Key Test Rules:

1. **AAA Test Structure (Arrange, Act and Assert):** Every test must clearly follow the Arrange-Act-Assert pattern. Tests must be separated by empty lines into three distinct stages (Arrange, Act and Assert). Whenever a test is not clearly divided by empty lines into these three stages, each stage must be explicitly announced with a comment (`// ARRANGE`, `// ACT` and `// ASSERT`).
2. **Accessible Queries:** Query elements strictly by accessible role (`screen.getByRole('button', { name: /action/i })`), never by CSS class or arbitrary test ID.
3. **User Event:** Always initialise `userEvent.setup()` and await user actions.

### Verification Step:

Run targeted test verification:

```bash
bun x jest --bail --findRelatedTests src/components/MyComponent/MyComponent.tsx --passWithNoTests
```
