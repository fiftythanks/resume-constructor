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
2. **Import Ordering:** Must follow the `eslint-plugin-perfectionist` groups:
   `react` -> `builtin` -> `external` -> `hooks` (`@/hooks/.*`) -> `layout` (`@/layout/.*`) -> `pages` (`@/pages/.*`) -> `components` (`@/components/.*`) -> `utils` (`@/utils/.*`) -> relative imports -> `assets` (`@/assets/.*`) -> `style` (`./*.scss`) -> `type` (`import type ...`) -> `unknown`.
3. **JSX Props Ordering:**
   `shorthand-prop` (e.g. `disabled`) -> `unknown` (e.g. `className`, `id`) -> `callback` (e.g. `onClick`) -> `multiline-prop`.
4. **No Redundant Effects:** Do not introduce `useEffect` for state synchronisation or derived values. Calculate values directly during render.
5. **Accessible Labeling:** If creating form controls, ensure inputs have an explicit `id` and corresponding `<label htmlFor={id}>`.

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
5. **Comment & Typography Standards:** Multiline JSDoc blocks (`/** ... */`), traditional British English, strictly no Oxford comma, double quotes (`"..."`) for natural language, spaced em-rules ("—"), unspaced en-rules ("–") for ranges and forward slashes ("/") surrounded by spaces only when separating compound words.

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
    render(<MyComponent onClick={handleClickMock}>Action</MyComponent>);

    const btn = screen.getByRole('button', { name: /action/i });
    expect(btn).toBeInTheDocument();
  });

  it('should handle click interactions via userEvent', async () => {
    const user = userEvent.setup();
    render(<MyComponent onClick={handleClickMock}>Action</MyComponent>);

    const btn = screen.getByRole('button', { name: /action/i });
    await user.click(btn);

    expect(handleClickMock).toHaveBeenCalledTimes(1);
  });
});
```

### Verification Step:

Run targeted test verification:

```bash
bun x jest --bail --findRelatedTests src/components/MyComponent/MyComponent.tsx --passWithNoTests
```
