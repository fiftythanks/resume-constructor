---
name: a11y-audit
description: >-
  Use this skill when auditing or implementing WCAG 2.2 Level AA accessibility compliance, keyboard navigation,
  focus management and screen reader support. Applies to associating form controls with labels (htmlFor),
  implementing modal focus traps with tabbable, managing dynamic screen reader announcements via aria-live="polite",
  and adding keyboard controls to @dnd-kit sortable lists. Do NOT use for visual responsive layout (use responsive-scaling)
  or unit test design (use testing-patterns).
---

# Accessibility (A11y) Implementation & Audit Guide

This project enforces strict **WCAG 2.2 Level AA** compliance, keyboard operability and screen reader compatibility.

> [!NOTE]
> When implementing accessible keyboard reordering on `@dnd-kit` sortable containers, read `references/dnd-kit-keyboard.md` for custom sensor and announcement contracts.

---

## 1. Core Accessibility Standards

### A. Form Controls & Labels (`jsx-a11y/label-has-associated-control`)

- Always provide explicit `htmlFor` matching the control's `id`:
  ```tsx
  <label className="Form-Label" htmlFor="degree-field">Degree</label>
  <input className="Form-Input" id="degree-field" type="text" />
  ```
- Screen reader-only descriptions: Use `aria-describedby` referencing helper text or error containers.

### B. Focus Management & Keyboard Trapping

- Use `tabbable` for focus trapping and initial focus transfer:

  ```tsx
  import { tabbable } from 'tabbable';

  const tabbables = tabbable(containerRef.current);
  if (tabbables.length > 0) {
    tabbables[0].focus();
  }
  ```

- Visual focus indicators: Never remove `:focus` or `:focus-visible` outlines without providing high-contrast custom indicators.

### C. Screen Reader Announcements (`aria-live="polite"`)

- Dynamic UI changes (e.g. reordering sections, drag-and-drop operations, deleting items or switching editor modes) must trigger polite live announcements:
  ```tsx
  <span
    aria-live="polite"
    className="visually-hidden"
    data-testid="screen-reader-announcement"
  >
    {screenReaderAnnouncement}
  </span>
  ```
- Use `updateScreenReaderAnnouncement('...')` provided by `useAppState()`.
- **Prose Style:** Omit Oxford commas in lists within screen reader announcements.

### D. Accessible Drag & Drop (`@dnd-kit`)

- Keyboard controls must be fully operational:
  - `Space`/`Enter`: Pick up item / drop item.
  - `ArrowUp`/`ArrowDown`: Move item.
  - `Escape`: Cancel drag operation.
- Provide descriptive `aria-roledescription="sortable item"` and update screen reader announcements on pick up, movement and drop.

---

## 2. Testing & Verification Checklist

1. **Vitest Component (`happy-dom`) & Browser Mode (`vitest-browser-react`) Suites:**
   - Query elements strictly by accessible role and accessible name:
     ```tsx
     // In Component.test.tsx (happy-dom):
     expect(
       screen.getByRole('button', { name: /delete section/i }),
     ).toBeInTheDocument();

     // In Component.browser.test.tsx (Vitest Browser Mode):
     await expect
       .element(page.getByRole('button', { name: /delete section/i }))
       .toBeInTheDocument();
     ```
   - Assert ARIA attributes directly:
     ```tsx
     expect(tab).toHaveAttribute('aria-selected', 'true');
     expect(tabpanel).toHaveAttribute('aria-labelledby', tab.id);
     ```
2. **In-Loop Accessibility Audits (`a11y` MCP Server):**
   - Leverage `a11y-mcp` tools for rapid in-loop WCAG 2.2 AA diagnostics against the active Vite dev server (`http://127.0.0.1:5173`):
     - `get_summary`: Fast overview of total issues broken down by severity (`critical`, `serious`, `moderate` and `minor`) alongside passed rule counts.
     - `audit_webpage`: Detailed report filtered by specific WCAG criteria (`tags: ['wcag2a', 'wcag2aa']`) with optional HTML snippets (`includeHtml: true`) to pinpoint offending DOM nodes and remediation guidance.
3. **Automated Axe Audits in Playwright:**
   - Run Playwright E2E tests with `@axe-core/playwright` to catch automated WCAG regressions:
     ```bash
     bun run e2e
     ```
4. **Contrast Standards:**
   - Verify all text and interactive icons against WCAG 2.2 AA (minimum 4.5:1 for normal text, 3:1 for large text and UI components).
