---
name: responsive-scaling
description: >-
  Use this skill when implementing responsive adaptations for medium and large screens,
  working on AppLayout, modifying sidebar/navbar visibility or working with preview rendering.
---

# Responsive Scaling & Parity Execution Guide

This skill guides responsive adaptations, macro-layout rules and rendering engine parity.

---

## 1. Hybrid Breakpoint Strategy

### Macro-Layout (`AppLayout` only)

- Global `@media` queries are **strictly restricted** to macro-layout adjustments in `AppLayout` (e.g. mobile drawer vs desktop docking sidebar).
- Do **not** inject `@media` breakpoints inside leaf or child components (`Button`, `ListItem`, `Degree`, `Job`, etc.).

### Component Scaling (Container Queries)

- All component-level responsive layout shifts must use CSS Container Queries:

  ```scss
  .MyComponent {
    container-type: inline-size;
  }

  @container (min-width: 480px) {
    .MyComponent-Header {
      flex-direction: row;
    }
  }
  ```

- **React 19 Effect Pruning:** Prefer `@container` queries over JavaScript window resize listeners (`useDebouncedWindowSize`). Only use `ResizeObserver` when manual coordinate calculations are strictly necessary.

---

## 2. Rendering Engine Parity & PDF Constraints

The document preview architecture comprises three distinct rendering modes:

1. **DOM Live Preview (Pure JSX):** Fast, non-blocking DOM preview for live interactive editing.
2. **React-PDF Generation (`@react-pdf/renderer`):** Document compilation powered by the **Yoga layout engine** generating binary PDF blobs with preloaded fonts.
3. **On-Demand Canvas & Interactive Text Layer (`pdfjs-dist`):** High-DPI canvas rasterisation inside the native `<dialog>` preview modal with an aligned, invisible `pdfjsLib.TextLayer` DOM overlay enabling text selection and copying.

### Yoga Constraints:

- **Flexbox Only:** Yoga does not parse CSS Grid, container queries or `clamp()` math.
- **Static Dimensions:** Use static or percentage-based dimensions for resume document elements. Fluid typography (`clamp()`) is permitted **only** in the outer application shell, never inside the resume document preview.
- **Universal Primitives:** Keep resume document components strictly decoupled from application shell components. Primitives rendered inside the resume document must remain 100% compliant with Yoga Flexbox rules.

---

## 3. DOM Integrity & Accessibility (WCAG 2.4.3)

1. **Focus Order & DOM Alignment:**
   - The DOM sequence must match the visual layout: `<aside>` -> `<nav>` -> `<main>`.
   - Never use CSS Grid `grid-column`/`grid-row` to reorder elements visually in a way that diverges from the DOM tab order.
2. **Dynamic ARIA State Syncing:**
   - When the mobile navbar toggle button is hidden at desktop breakpoints (`display: none` at `>= 768px`), ensure the desktop sidebar navigation state explicitly forces `aria-expanded="true"`.
   - Ensure screen reader announcements (`aria-live="polite"`) accurately reflect desktop mode transitions.

---

## 4. Verification & Testing

- Validate layout behaviour in Jest:
  ```bash
  bun x jest src/components/AppLayout/AppLayout.test.tsx
  ```
- Run E2E tests in Playwright's deterministic Docker container to prevent font rendering differences across host OS environments:
  ```bash
  bun run e2e
  ```
