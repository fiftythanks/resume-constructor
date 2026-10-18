# Vitest Browser Mode & Engine Mechanics Reference

This reference covers authoring Vitest Browser Mode component tests (`*.browser.test.tsx`) executed in headless Chromium via Playwright under the Vitest `browser` project.

---

## 1. When to Use Browser Mode

Browser Mode tests run against a genuine Chromium browser engine. Reserve them strictly for interactions that happy-dom cannot emulate faithfully:

1. **Native Top-Layer `<dialog>` Mechanics:**
   - Methods like `dialog.showModal()` and `dialog.close()`.
   - Native `Escape` key dismissal.
   - Browser backdrop rendering and top-layer stacking order.
2. **Real Coordinate & Geometry Interactions:**
   - `@dnd-kit` pointer drag-and-drop operations with pixel coordinates.
   - Bounding client rect calculations (`getBoundingClientRect()`).
   - Scroll offsets, overflow boundaries and container dimensions.
3. **True Focus Trapping & Tab Navigation:**
   - Focus geometry evaluated by `tabbable` (verifying elements are genuinely visible and non-zero sized).
4. **CSS Container Queries & Viewport Sizing:**
   - Verifying layout behaviour at explicit viewport resolutions.

---

## 2. Test Setup & Architecture

Browser Mode tests use `vitest-browser-react` and `vitest/browser`:

```tsx
import { render } from 'vitest-browser-react';
import { expect, page, userEvent } from 'vitest/browser';

import DeleteModal from './DeleteModal';

describe('DeleteModal (Browser Mode)', () => {
  it('dismisses modal and restores focus on Escape key', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const handleClose = vi.fn();

    await render(<DeleteModal isOpen={true} onClose={handleClose} />);

    const dialog = page.getByRole('dialog', { name: /confirm deletion/i });
    await expect.element(dialog).toBeVisible();

    // ACT
    await user.keyboard('{Escape}');

    // ASSERT
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
```

---

## 3. Element Assertions (`expect.element`)

In Vitest Browser Mode, DOM queries return locator handles wrapped with asynchronous element matchers:

```tsx
// Visibility and DOM presence
await expect.element(locator).toBeVisible();
await expect.element(locator).toBeInTheDocument();

// Text and values
await expect.element(locator).toHaveTextContent('Software Engineer');
await expect.element(locator).toHaveValue('React');

// Focus
await expect.element(locator).toHaveFocus();

// Attributes and BEM classes
await expect.element(locator).toHaveAttribute('aria-expanded', 'false');
await expect.element(locator).toHaveClass('Button_variant_danger');
```

---

## 4. Drag-and-Drop & Coordinate Operations

When testing `@dnd-kit` drag interactions in Browser Mode:

```tsx
const itemOne = page.getByRole('listitem', { name: /item 1/i });
const itemTwo = page.getByRole('listitem', { name: /item 2/i });

// Perform pointer drag using userEvent
await user.dragAndDrop(itemOne, itemTwo);

// Or simulate keyboard-based accessible reordering
await itemOne.focus();
await user.keyboard(' '); // Pick up item
await user.keyboard('{ArrowDown}'); // Move down
await user.keyboard(' '); // Drop item
```

---

## 5. Viewport Control & Geometry

To test layout shifts or container query adaptations in real browser environments:

```tsx
// Set explicit viewport dimensions
await page.viewport(375, 667); // Mobile portrait
await page.viewport(1440, 900); // Desktop widescreen
```
