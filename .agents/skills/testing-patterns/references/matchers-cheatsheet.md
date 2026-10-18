# Semantic DOM Matchers Cheatsheet

This reference provides a matrix of recommended semantic matchers for Vitest DOM tests across the `component` (`happy-dom` with `@testing-library/jest-dom/vitest`) and `browser` (`vitest-browser-react` with `vitest/browser`) tiers.

---

## 1. Semantic Matcher Matrix

| Assertion Intent         | Recommended Semantic Matcher                          | Forbidden Anti-Pattern                                  |
| :----------------------- | :---------------------------------------------------- | :------------------------------------------------------ |
| Element visibility       | `expect(el).toBeVisible()`                            | `expect(el.style.display).not.toBe('none')`             |
| Element in document      | `expect(el).toBeInTheDocument()`                      | `expect(el).not.toBeNull()`                             |
| Focus state              | `expect(el).toHaveFocus()`                            | `expect(document.activeElement).toBe(el)`               |
| Disabled state           | `expect(el).toBeDisabled()`                           | `expect(el.disabled).toBe(true)`                        |
| Enabled state            | `expect(el).toBeEnabled()`                            | `expect(el.disabled).toBe(false)`                       |
| Accessible name          | `expect(el).toHaveAccessibleName('Save')`             | `expect(el.textContent).toContain('Save')`              |
| Accessible description   | `expect(el).toHaveAccessibleDescription('Hint')`      | `expect(el.getAttribute('aria-describedby')).toBe(...)` |
| Input value              | `expect(el).toHaveValue('Software Engineer')`         | `expect(el.value).toBe('Software Engineer')`            |
| Checkbox / radio checked | `expect(el).toBeChecked()`                            | `expect(el.checked).toBe(true)`                         |
| ARIA attribute           | `expect(el).toHaveAttribute('aria-expanded', 'true')` | `expect(el.getAttribute('aria-expanded')).toBe('true')` |
| BEM class name           | `expect(el).toHaveClass('Button_variant_primary')`    | `expect(el.className).toContain('primary')`             |
| Form validity            | `expect(el).toBeValid()` / `expect(el).toBeInvalid()` | `expect(el.checkValidity()).toBe(true)`                 |

---

## 2. Accessible Queries Hierarchy

Always query DOM elements using accessible roles, prioritising the way users and assistive technology experience the UI:

1. **`screen.getByRole(role, { name })`:** The primary query for interactive elements (`button`, `link`, `textbox`, `combobox`, `dialog`, `tab`, `tabpanel`).
2. **`screen.getByLabelText(text)`:** For form inputs where testing the explicit label association is the primary target.
3. **`screen.getByText(text)`:** For non-interactive elements containing static text (`p`, `span`, `div`).
4. **`screen.queryByRole(...)`:** Use **only** when asserting that an element is absent (`expect(screen.queryByRole('dialog')).not.toBeInTheDocument()`).
5. **`screen.findByRole(...)`:** Use when waiting asynchronously for an element to appear due to transitions or timers.

### Query Anti-Patterns

- **Never query by CSS class:** Avoid `container.querySelector('.Button')`. CSS classes are implementation details of styling, not accessible interfaces.
- **Never query by test ID unless unavoidable:** `data-testid` is an escape hatch reserved strictly for non-standard invisible containers like `aria-live` announcement spans.

---

## 3. Strict Tight Assertion Rules

1. **No Generic Type Matchers:**
   - Do not write `expect.any(HTMLElement)` or `expect.any(Object)` when the exact DOM node or value is known.
   - Assert against the exact element reference: `expect(onSelect).toHaveBeenCalledWith(selectedItem)`.
2. **Exact Call Counts:**
   - Always verify exact invocation counts with `toHaveBeenCalledTimes(n)`.
   - Never use unquantified `toHaveBeenCalled()` in isolation.
3. **Exact Mock Arguments:**
   - Always verify call arguments using `toHaveBeenCalledWith(...)` or `toHaveBeenLastCalledWith(...)`.
4. **Single-Act Principle:**
   - Each test must execute exactly one action followed by its assertions.
   - Do not chain multiple actions and assertions across a single test case; split them into independent, atomic tests.
