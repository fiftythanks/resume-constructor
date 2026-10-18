---
name: responsive-scaling
description: >-
  Use this skill when implementing responsive macro-layouts, CSS Container Queries (@container) and
  viewport adaptations. Applies to modifying AppLayout responsive shell behaviour, toggling mobile drawer
  navigation versus docked desktop sidebars and writing container queries for internal component scaling.
  For live interactive inspection, use Playwright MCP tools (browser_resize). Do NOT use for authoring automated
  regression tests (use testing-patterns) or standard component markup (use component-authoring).
---

# Responsive Scaling Guide

This skill guides responsive macro-layout rules, component scaling via CSS Container Queries and viewport adaptations.

> [!NOTE]
> When implementing multi-breakpoint container queries with custom container names or container units (`cqw`, `cqh`), read `references/container-query-patterns.md`.

---

## 1. Hybrid Breakpoint Strategy

### Macro-Layout (`AppLayout` only)

- Global `@media` queries are **strictly restricted** to macro-layout adjustments in `AppLayout` (e.g. mobile drawer navigation versus desktop docked sidebar).
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

## 2. DOM Integrity & Accessibility (WCAG 2.4.3)

1. **Focus Order & DOM Alignment:**
   - The DOM sequence must match the visual layout: `<aside>` -> `<nav>` -> `<main>`.
   - Never use CSS Grid `grid-column`/`grid-row` to reorder elements visually in a way that diverges from the DOM tab order.
2. **Dynamic ARIA State Synchronisation:**
   - When the mobile navbar toggle button is hidden at desktop breakpoints (`display: none` at `>= 768px`), ensure the desktop sidebar navigation state explicitly forces `aria-expanded="true"`.
   - Ensure screen reader announcements (`aria-live="polite"`) accurately reflect desktop mode transitions.

---

## 3. Verification & Live Inspection

- Validate layout behaviour in Vitest:
  ```bash
  bun x vitest run src/components/AppLayout/AppLayout.test.tsx
  ```
- Use Playwright MCP tools for live visual inspection and breakpoint verification:
  - `browser_navigate`: Navigate to local preview server (`http://127.0.0.1:5173`).
  - `browser_resize`: Test specific responsive breakpoints (e.g. mobile `375x667`, desktop `1440x900`).
  - `browser_snapshot`: Capture accessibility trees to verify DOM order and ARIA states.
  - `browser_take_screenshot`: Capture visual page state across breakpoints to confirm layout behaviour.
- For authoring automated regression tests, invoke the `testing-patterns` skill (Vitest Browser Mode or Playwright E2E).
