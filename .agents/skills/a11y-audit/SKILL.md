---
name: a11y-audit
description: >-
  Use this skill when auditing or implementing accessibility features, keyboard navigation,
  screen reader announcements, ARIA patterns or testing with @axe-core/playwright.
---

# Accessibility (A11y) Implementation & Audit Guide

This project enforces strict **WCAG 2.2 Level AA** compliance, keyboard operability and screen reader compatibility.

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

  // Always specify displayCheck for test environments:
  const tabbables = tabbable(containerRef.current, {
    displayCheck: process.env.NODE_ENV === 'test' ? 'none' : 'full',
  });
  if (tabbables.length > 0) {
    tabbables[0].focus();
  }
  ```

- Visual focus indicators: Never remove `:focus` or `:focus-visible` outlines without providing high-contrast custom indicators.

### C. Screen Reader Announcements (`aria-live="polite"`)

- Dynamic UI changes (e.g., reordering sections, drag-and-drop operations, deleting items or switching editor modes) must trigger polite live announcements:
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

### D. Accessible Drag & Drop (`@dnd-kit`)

- Keyboard controls must be fully operational:
  - `Space` / `Enter`: Pick up item / drop item.
  - `ArrowUp` / `ArrowDown`: Move item.
  - `Escape`: Cancel drag operation.
- Provide descriptive `aria-roledescription="sortable item"` and update screen reader announcements on pick up, movement and drop.

---

## 2. Testing & Verification Checklist

1. **Jest + React Testing Library:**
   - Query elements strictly by accessible role and accessible name:
     ```tsx
     expect(
       screen.getByRole('button', { name: /delete section/i }),
     ).toBeInTheDocument();
     ```
   - Assert ARIA attributes directly:
     ```tsx
     expect(tab).toHaveAttribute('aria-selected', 'true');
     expect(tabpanel).toHaveAttribute('aria-labelledby', tab.id);
     ```
2. **Automated Axe Audits in Playwright:**
   - Run Playwright E2E tests with `@axe-core/playwright` to catch automated WCAG regressions:
     ```bash
     bun run e2e
     ```
3. **Contrast Standards:**
   - Verify all text and interactive icons against WCAG 2.2 AA (minimum 4.5:1 for normal text, 3:1 for large text and UI components).
