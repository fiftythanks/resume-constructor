# Accessibility Checklist

Quick checks for the [WCAG 2.2 AA web target](../../docs/reference/accessibility.md) in the editor and preview interaction, not exported-PDF conformance. Use alongside [frontend UI engineering](../skills/frontend-ui-engineering/SKILL.md). Apply the relevant WCAG criteria when judging conformance; practices such as a single `<h1>`, a keyboard-visible skip link and a focusable error summary are recommendations, not blanket requirements.

## Table of Contents

- [Essential Checks](#essential-checks)
- [Common HTML Patterns](#common-html-patterns)
- [Testing Tools](#testing-tools)
- [Quick Reference: ARIA Live Regions](#quick-reference-aria-live-regions)
- [Common Anti-Patterns](#common-anti-patterns)

## Essential Checks

### Keyboard Navigation

- [ ] All interactive functionality is keyboard-operable. Tab moves between controls and composites; test the keys that operate items inside a composite (often arrows), not a Tab stop on every item. Use the [APG keyboard conventions](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) as pattern guidance.
- [ ] Focus order follows visual/logical order
- [ ] Focus is visible and the focused component is not entirely obscured by author-created content.
- [ ] Custom widgets support the keys for their pattern (for example, Enter to activate or Escape to dismiss).
- [ ] No inescapable keyboard traps. In a modal, focus moves inside, stays contained while open and returns to the opener (or a logical fallback) on dismissal. Test Escape and the close control.
- [ ] Skip-to-content link at the top of the page, visible at least on keyboard focus, where useful for bypassing repeated blocks.

### Screen Readers

- [ ] All images have `alt` text (or `alt=""` for decorative images)
- [ ] Form controls have meaningful accessible names, preferably from associated visible labels.
- [ ] Buttons and links have descriptive accessible names (not "Click here").
- [ ] Icon-only buttons have a meaningful name, for example `aria-label="Close dialog"`, and a recognisable icon.
- [ ] Page has one `<h1>` and headings don't skip levels
- [ ] Meaningful status changes that do not move focus are available to assistive technology, with urgency suited to the message. Do not announce a drag item as moved over its own starting position on pickup.
- [ ] Tables have `<th>` headers with scope

### Visual

- [ ] Text contrast ≥ 4.5:1 for normal text or ≥ 3:1 for large text (at least 18pt / 24 CSS px, or 14pt / about 18.67 CSS px when bold). Do not round a failing contrast ratio up to the threshold.
- [ ] Visual information needed to identify controls and their states has at least 3:1 contrast against adjacent colours where WCAG non-text contrast applies.
- [ ] Color is not the only way to convey information
- [ ] Text resizable to 200% without breaking layout
- [ ] No content that flashes more than 3 times per second

### Forms

- [ ] Give each field, including optional fields, an associated visible label or clear visible context that identifies its purpose. Provide any instructions needed to enter the value.
- [ ] Required fields indicated (not by color alone)
- [ ] Error messages specific and associated with the field
- [ ] Error state visible by more than color (icon, text, border)
- [ ] Form submission errors summarized and focusable
- [ ] Known fields use autocomplete (for example `type="email" autocomplete="email"`)

### Content

- [ ] Language declared (`<html lang="en">`)
- [ ] Page has a descriptive `<title>`
- [ ] Links distinguish from surrounding text (not by color alone)
- [ ] Drag functionality has a single-pointer alternative without dragging (for example, Move Up and Move Down buttons), unless dragging is essential or the behaviour is determined by the user agent and not modified by the author. Keyboard access alone is not a pointer alternative.
- [ ] Pointer targets meet [WCAG 2.2 AA target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): each can contain an axis-aligned 24 × 24 CSS px square, or an exception applies. For the spacing exception, place a 24 CSS px diameter circle at the centre of the bounding box of each undersized target. It must not intersect another target or the circle of another undersized target. Other exceptions: an equivalent conforming control on the same page, an inline target in a sentence or constrained by non-target text line height, size set by the user agent and not modified by the author, or essential or legally required presentation.
- [ ] On touch displays, check targets against the [project’s touch target minimum](../../docs/reference/accessibility.md).
- [ ] Meaningful empty states (not blank screens)

## Common HTML Patterns

### Buttons vs. Links

```html
<!-- Use <button> for actions -->
<button onClick="{handleDelete}">Delete Task</button>

<!-- Use <a> for navigation -->
<a href="/tasks/123">View Task</a>

<!-- NEVER use div/span as buttons -->
<div onClick="{handleDelete}">Delete</div>
<!-- BAD -->
```

### Form Labels

```html
<!-- Explicit label association -->
<label for="email">Email address</label>
<input id="email" type="email" required />

<!-- Implicit wrapping -->
<label>
  Email address
  <input type="email" required />
</label>

<!-- A visible label names the search field and explains its purpose -->
<label for="task-search">Search tasks</label>
<input id="task-search" type="search" />
```

### ARIA Roles

Keep a status region mounted before updating its text, for example to "Retrying…" and then "Tasks loaded". Keep that text visible. Initial loading text and a decorative skeleton do not need a live region of their own. Use an alert for urgent messages, not for every error.

```html
<!-- Navigation -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Footer links">...</nav>

<!-- Mount before updates such as "Task saved" or "Retrying…" -->
<p id="task-status" role="status"></p>

<!-- Mount before inserting an urgent message -->
<p id="task-alert" role="alert"></p>

<!-- Named native modal -->
<button id="open-details" type="button">Task details</button>
<dialog id="task-details" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Task details</h2>
  <p>Review the task before marking it complete.</p>
  <form method="dialog">
    <button type="submit">Close</button>
  </form>
</dialog>
<script>
  const opener = document.querySelector('#open-details');
  const dialog = document.querySelector('#task-details');
  opener.addEventListener('click', () => {
    opener.focus();
    dialog.showModal();
  });
</script>

<!-- Initial loading only; do not remount this as a retry announcement -->
<p>Loading tasks…</p>
<div class="task-skeleton" aria-hidden="true">
  <div></div>
  <div></div>
  <div></div>
</div>
```

```scss
.task-skeleton {
  display: grid;
  gap: 0.5rem;
}

.task-skeleton > div {
  height: 1rem;
  background-color: currentColor;
  opacity: 0.2;
}
```

`showModal()` makes the background inert; `<dialog open>` alone does not. The form closes the modal without submitting data. Test both the close control and Escape with the keyboard and verify focus returns to the opener.

### Accessible Lists

```html
<ul role="list" aria-label="Tasks">
  <li>
    <input type="checkbox" id="task-1" aria-label="Complete: Buy groceries" />
    <label for="task-1">Buy groceries</label>
  </li>
</ul>
```

## Testing Tools

- **Automated audit:** Use available project checks. [`e2e/a11y.spec.ts`](../../e2e/a11y.spec.ts) uses `@axe-core/playwright` and is not part of `verify`. Run it when the approved scope and existing environment support it. Do not assume a running server. Install nothing in the project unless the user explicitly requests that installation and the reason it is needed has been explained.
- **Browser inspection:** On an authorised synthetic surface, use available DevTools or Lighthouse to inspect the accessibility tree and diagnose relevant failures. The tree exposes roles, names and states; it does not prove speech. An automated pass does not establish conformance.
- **Manual keyboard:** Use real keys to test order, visibility, composite navigation, modal dismissal and focus return.
- **Assistive technology:** Use a real screen reader (for example, VoiceOver, NVDA, JAWS or Orca) to check reading order, names and announcements. Report missing manual or runtime evidence rather than substituting an audit result.

## Quick Reference: ARIA Live Regions

| Value                   | Behaviour                                                  | Use for                                                |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| `aria-live="polite"`    | Request an announcement at the next suitable pause         | Status updates, saved confirmations                    |
| `aria-live="assertive"` | Request an immediate announcement; it may interrupt speech | Urgent errors, time-sensitive alerts                   |
| `role="status"`         | Implicitly `aria-live="polite"`                            | Status messages                                        |
| `role="alert"`          | Implicitly `aria-live="assertive"`                         | Errors or other messages that need immediate attention |

## Common Anti-Patterns

| Anti-Pattern                 | Problem                              | Fix                                          |
| ---------------------------- | ------------------------------------ | -------------------------------------------- |
| `div` as button              | Not focusable, no keyboard support   | Use `<button>`                               |
| Missing `alt` text           | Images invisible to screen readers   | Add descriptive `alt`                        |
| Color-only states            | Invisible to color-blind users       | Add icons, text, or patterns                 |
| Autoplaying media            | Disorienting, can't be stopped       | Add controls, don't autoplay                 |
| Custom dropdown with no ARIA | Unusable by keyboard/screen reader   | Use native `<select>` or proper ARIA listbox |
| Removing focus outlines      | Users can't see where they are       | Style outlines, don't remove them            |
| Empty links/buttons          | "Link" announced with no description | Add text or `aria-label`                     |
| `tabindex > 0`               | Breaks natural tab order             | Use `tabindex="0"` or `-1` only              |
