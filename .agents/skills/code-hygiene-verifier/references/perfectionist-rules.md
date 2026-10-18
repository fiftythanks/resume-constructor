# Perfectionist Sorting Rules & Grouping Precedence

This reference documents the sorting precedence enforced by `eslint-plugin-perfectionist` in `eslint.config.ts`.

---

## 1. Import Sorting (`perfectionist/sort-imports`)

Imports must follow this strict grouping order, with a blank line separating each group. Within each group, imports are sorted alphabetically:

1. **`react`:** `react` and `react-dom` packages.
2. **`builtin`:** Node.js built-in modules (`node:path`, `node:fs`, etc.).
3. **`external`:** Third-party npm dependencies (`@dnd-kit/core`, `immer`, `type-fest`, etc.).
4. **`hooks`:** Internal hooks mapped via `@/hooks/*`.
5. **`layout`:** Internal layout components mapped via `@/layout/*`.
6. **`pages`:** Feature pages mapped via `@/pages/*`.
7. **`components`:** UI components mapped via `@/components/*`.
8. **`utils`:** Internal helper utilities mapped via `@/utils/*`.
9. **`['parent', 'sibling', 'index']`:** Relative imports (`../`, `./`, `./Component`).
10. **`assets`:** Images, icons and static assets mapped via `@/assets/*`.
11. **`style`:** SCSS or CSS stylesheet imports (`./Component.scss`).
12. **`type`:** Type-only imports (`import type { ... }`).
13. **`unknown`:** Any remaining imports not matched by preceding groups.

### Example Compliant Import Block

```tsx
import { useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import type { ReadonlyDeep } from 'type-fest';

import useAppState from '@/hooks/useAppState';
import Button from '@/components/Button';
import neverReached from '@/utils/neverReached';

import SubHeader from './SubHeader';

import './MyComponent.scss';

import type { MyComponentProps } from './types';
```

---

## 2. JSX Prop Sorting (`perfectionist/sort-jsx-props`)

JSX attributes on React elements are sorted into four ordered categories:

1. **`shorthand-prop`:** Boolean shorthand props without explicit values (`disabled`, `required`, `autoFocus`).
2. **`unknown`:** Standard single-line attributes sorted alphabetically (`className`, `id`, `tabIndex`, `type`, `value`).
3. **`callback`:** Event callbacks matching `^on[A-Z].+` sorted alphabetically (`onBlur`, `onChange`, `onClick`, `onKeyDown`).
4. **`multiline-prop`:** Props whose values or JSX children span across multiple lines.

### Example Compliant JSX Element

```tsx
<input
  disabled
  required
  className="Form-Input"
  id="job-title"
  type="text"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  onFocus={(e) => handleFocus(e)}
  aria-describedby={hasError ? 'error-message' : 'helper-text'}
/>
```

---

## 3. Disabled Perfectionist Rules

- **`perfectionist/sort-objects`:** Disabled (`'off'`). Object keys may be ordered logically according to domain structure rather than alphabetically.
- **`perfectionist/sort-modules`:** Disabled (`'off'`). Pure helper functions may precede components even if their names appear later in alphabetical order.

---

## 4. Automated Autofix Command

To sort imports and JSX props across modified files automatically:

```bash
bun run verify --lint
```
