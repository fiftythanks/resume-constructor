---
name: testing-patterns
description: >-
  Use this skill when designing, writing, reviewing or refactoring unit,
  integration and component-level tests. Enforces test design principles
  and testing practices from Lucas da Costa's "Testing JavaScript Applications"
  (Manning Publications).
---

# Testing Patterns & Guidelines (Lucas da Costa)

This skill provides comprehensive standards and patterns for writing automated tests across the codebase, directly implementing the methodology, techniques and hygiene rules from _Testing JavaScript Applications_ by Lucas da Costa (Manning Publications).

---

## 1. Core Testing Philosophy

- **Test Public Behaviour, Not Implementation Details:**
  Always test software from the perspective of its users and consumers. Focus on inputs, observable DOM outputs, accessible names and exported contracts. Never assert on private state or internal component mechanics.
- **Do Not Test Third-Party Software or Native Engines (Chapter 3, §3.4):**
  Trust that React, JSDOM, browser engines and external libraries work as documented. Do not write redundant tests verifying third-party features; test only your application's integration contracts and business logic.
- **Test Atomicity & Isolation (Chapter 3, §3.1.4):**
  Every test must run completely independent of all others. Executing a test in isolation must produce the exact same outcome as running it alongside one thousand other tests. Never share mutable state between tests; use scoped `beforeEach` hooks or factory functions to provide fresh fixtures.
- **Single Responsibility & Focused Test Scopes (Chapter 3, §3.1.1):**
  Tests must be small and focused on a single facet of behaviour. When a test fails, the diagnostic feedback must be immediate and unambiguous, avoiding bloated tests where multiple unrelated concerns are mixed together.

---

## 2. Writing Good, Tight Assertions (Chapter 3, §3.2)

### A. Avoid Loose Assertions (§3.2.2)

> _"The more values an assertion accepts, the looser it is... The tighter and most valuable assertion you can write is an assertion that allows only a single result to pass... If your assertions customarily allow many results, it can be a sign that your code is not deterministic or that you don't know it well enough."_

- **No Generic Type/Class Matchers for Specific Entities:**
  Never use `expect.any(HTMLElement)` or `expect.any(Object)` when an exact DOM node reference or exact object literal is known. Verify the specific rendered element (e.g. `expect(callbackRef).toHaveBeenCalledWith(headerElement)`).
- **No Loose Test Double Calls:**
  Never use bare `.toHaveBeenCalled()` when the call count and arguments can be asserted. Always assert the exact call count (`expect(spy).toHaveBeenCalledTimes(1)`) and verify expected arguments (`expect(spy).toHaveBeenCalledWith(...)`).

### B. Avoid Circular Assertions (§3.2.4)

- Never compute expected test results using the same application functions or utilities under test.
- Hardcode deterministic expected values or construct independent test-only fixtures so that regressions in application logic cause tests to fail rather than silently passing.

### C. Meaningful Assertions & Error Handling (§3.2.1)

- Every assertion must be directly sensitive to the behaviour under test.
- Never assert unrelated element presence (such as `expect(button).toBeInTheDocument()`) as a proxy for verifying that an action executed without throwing an error. Wrap operations in explicit error assertions (e.g. `await expect(action).resolves.not.toThrow()`) or assert the resulting focus or state.

### D. Assertion Count Guarantees (§3.2.1)

- For asynchronous flows, event-driven interactions or conditional execution branches, declare `expect.hasAssertions()` or `expect.assertions(n)` to ensure the test fails if assertions are accidentally bypassed.

---

## 3. Specialised Custom DOM Matchers (Chapter 3, §3.2.3 & Chapter 6, §6.2.2)

Always use `@testing-library/jest-dom` semantic matchers instead of manually checking raw DOM properties:

| ❌ Raw DOM Check (Loose / Poor Diffs)                | ✅ Semantic `jest-dom` Matcher (Clear Diagnostic Diffs) |
| :--------------------------------------------------- | :------------------------------------------------------ |
| `expect(document.activeElement).toBe(btn)`           | `expect(btn).toHaveFocus()`                             |
| `expect(document.activeElement).not.toBe(btn)`       | `expect(btn).not.toHaveFocus()`                         |
| `expect(node !== null).toBe(true)`                   | `expect(node).toBeInTheDocument()`                      |
| `expect(el.getAttribute('aria-label')).toBe('x')`    | `expect(el).toHaveAccessibleName('x')`                  |
| `expect(el.classList.contains('active')).toBe(true)` | `expect(el).toHaveClass('active')`                      |
| `expect(btn.disabled).toBe(true)`                    | `expect(btn).toBeDisabled()`                            |

---

## 4. Element Selection & Accessible Queries (Chapter 6, §6.2 & Chapter 7)

- **Accessible Roles First:**
  Query elements strictly by accessible role and accessible name:
  ```typescript
  const submitBtn = screen.getByRole('button', { name: 'Submit Application' });
  const heading = screen.getByRole('heading', { level: 2, name: 'Project 1' });
  ```
- **Build Accessibility into Selectors:**
  Querying by role validates both that the element is present and that its semantic markup and ARIA attributes are accessible to assistive technologies.
- **Avoid Implementation Details:**
  Never query by tag names, CSS class names or DOM hierarchies.
- **Avoid Artificial `data-testid` Selectors:**
  Do not rely on `data-testid` unless testing an invisible live announcement region (`aria-live="polite"`). For external interactive targets in test fixtures, render accessible semantic elements (e.g. `<button type="button">Outside Area</button>`).

---

## 5. Realistic User Event Simulation (Chapter 6, §6.3 & Chapter 7)

- **Always Use `@testing-library/user-event`:**
  Simulate user interactions using `userEvent.setup()` and `await user.click(...)`, `await user.keyboard(...)` or `await user.tab()`.
- **Avoid Programmatic Shortcuts Where Realistic Events Exist:**
  Prefer keyboard tabbing (`await user.tab()`) or user clicks over direct `.focus()` invocations when verifying keyboard navigation pathways.
- **Do Not Mix `fireEvent` and `userEvent` Arbitrarily:**
  Reserve `fireEvent` exclusively for synthetic DOM events that JSDOM or `user-event` does not dispatch (such as raw `pointerDown` events for pointer-capture handlers). Document why `fireEvent` was necessary in an explanatory comment.

---

## 6. Testing Styles & CSS BEM Classes (Chapter 8, §8.3)

- **Verify Component Style Contracts:**
  When components define semantic BEM classes (`.Block`, `.Block-Element`, `.Block-Element_modifier`), assert that the rendered DOM nodes apply their required CSS classes using `toHaveClass(...)`.
- Testing classes ensures the component markup correctly links to the design system and stylesheet rules.

---

## 7. Component-Level Acceptance Tests & User Stories (Chapter 8, §8.4)

In addition to atomic unit tests verifying individual prop configurations:

- **Write Component Stories / User Journeys:**
  Create stateful acceptance tests that simulate a realistic multi-step user lifecycle.
- **Stateful Test Harness Pattern:**
  Mount a harness component that manages state and pass callbacks to the component under test. Simulate adding items, navigating back and forth, deleting items and verifying that focus, live announcements and UI elements update seamlessly throughout the user journey.

---

## 8. Arrange-Act-Assert (AAA) & Single-Act Discipline

- **Distinct Stages:**
  Every unit test must follow the Arrange-Act-Assert pattern. Distinct stages must be separated by empty lines (or comments `// ARRANGE`, `// ACT`, `// ASSERT` if lines are compact).
- **Single-Act Principle:**
  Each unit test must contain exactly one `Act` phase. Multi-act cascades are reserved exclusively for component-level acceptance user journeys and E2E workflows.
