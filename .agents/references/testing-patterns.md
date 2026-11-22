# Testing Patterns Reference (JavaScript/TypeScript)

Quick reference of JavaScript/TypeScript testing patterns — Vitest, React Testing Library, Supertest and Playwright — illustrating the universal principles from the `test-driven-development` skill. The principles (Arrange-Act-Assert, naming, mock discipline, anti-patterns) apply in any ecosystem; the examples use a hypothetical task application. Follow the repository's own test framework and commands.

Vitest runs the project tests. Choose the project by what the test must establish:

- **`unit` — Node, no DOM.** Use it for pure logic, including tests that use `vi.fn()` but do not render a component.
- **`component` — `happy-dom`.** React Testing Library renders into a simulated DOM. Use it for behaviour such as submitting a form, receiving a callback or displaying a validation message. This does not establish browser layout or native dialog behaviour.
- **`browser` — real headless Chromium.** Use `*.browser.test.tsx` for React behaviour that depends on browser mechanics, such as dismissing a native dialog with Escape. `@vitest/browser-playwright` starts the browser; `vitest-browser-react` renders the component; `vitest/browser` provides `page` and `userEvent`.

`@testing-library/jest-dom/vitest` adds DOM matchers. It is neither a DOM implementation nor the Jest runner. Vitest Browser Mode is also distinct from the standalone Playwright end-to-end example below.

See the [project test scripts](../../package.json), [Vitest project configuration](../../vitest.config.ts), [DOM matcher setup](../../vitest.setup.tsx) and [testing requirements](../../docs/reference/testing.md).

## Table of Contents

- [Test Structure (Arrange-Act-Assert)](#test-structure-arrange-act-assert)
- [Test Naming Conventions](#test-naming-conventions)
- [Common Assertions](#common-assertions)
- [Mocking Patterns](#mocking-patterns)
- [React/Component Testing](#reactcomponent-testing)
- [API / Integration Testing](#api--integration-testing)
- [E2E Testing (Playwright)](#e2e-testing-playwright)
- [Test Anti-Patterns](#test-anti-patterns)

## Test Structure (Arrange-Act-Assert)

```typescript
it('describes expected behavior', () => {
  // Arrange: Set up test data and preconditions
  const input = { title: 'Test Task', priority: 'high' };

  // Act: Perform the action being tested
  const result = createTask(input);

  // Assert: Verify the outcome
  expect(result.title).toBe('Test Task');
  expect(result.priority).toBe('high');
  expect(result.status).toBe('pending');
});
```

## Test Naming Conventions

```typescript
// Pattern: [unit] [expected behavior] [condition]
describe('TaskService.createTask', () => {
  it('creates a task with default pending status', () => {});
  it('throws ValidationError when title is empty', () => {});
  it('trims whitespace from title', () => {});
  it('generates a unique ID for each task', () => {});
});
```

## Common Assertions

```typescript
// Equality
expect(result).toBe(expected); // Strict equality (===)
expect(result).toEqual(expected); // Deep equality (objects/arrays)
expect(result).toStrictEqual(expected); // Deep equality + type matching

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();
expect(result).toBeNull();
expect(result).toBeDefined();
expect(result).toBeUndefined();

// Numbers
expect(result).toBeGreaterThan(5);
expect(result).toBeLessThanOrEqual(10);
expect(result).toBeCloseTo(0.3, 5); // Floating point

// Strings
expect(result).toMatch(/pattern/);
expect(result).toContain('substring');

// Arrays / Objects
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(object).toHaveProperty('key', 'value');

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(ValidationError);
expect(() => fn()).toThrow('specific message');

// Async
await expect(asyncFn()).resolves.toBe(value);
await expect(asyncFn()).rejects.toThrow(Error);
```

## Mocking Patterns

Use Vitest’s `vi` for mocks. Assert calls when the interaction itself is observable and contractual, such as the payload passed to a public callback, rather than an internal call sequence.

### Mock Functions

```typescript
import { submitTitle } from './taskService';

it('submits the trimmed title to the caller', () => {
  const onSubmit = vi.fn();

  submitTitle('  Buy groceries  ', onSubmit);

  expect(onSubmit).toHaveBeenCalledWith({ title: 'Buy groceries' });
});
```

Use `mockReturnValue` for a fixed result, `mockResolvedValue` for an asynchronous result or `mockImplementation` when the result depends on the input.

### Mock Modules

```typescript
import { createTask, listTaskTitles } from './taskService';

// Replace the database boundary; no real query should run.
vi.mock(import('./database'), () => ({
  query: vi
    .fn()
    .mockResolvedValue([{ id: 'saved-id', title: 'Buy groceries' }]),
}));

// Keep the real title normalisation; replace only ID generation.
vi.mock(import('./utils'), async (importOriginal) => ({
  ...(await importOriginal()),
  generateId: vi.fn(() => 'test-id'),
}));

it('lists the titles of saved tasks', async () => {
  expect(await listTaskTitles()).toEqual(['Buy groceries']);
});

it('creates a task with the generated ID and the trimmed title', () => {
  expect(createTask('  Buy groceries  ')).toEqual({
    id: 'test-id',
    title: 'Buy groceries',
  });
});
```

### Mock at Boundaries Only

```
Mock these:                    Don't mock these:
├── Database calls             ├── Internal utility functions
├── HTTP requests              ├── Business logic
├── File system operations     ├── Data transformations
├── External API calls         ├── Validation functions
└── Time/Date (when needed)    └── Pure functions
```

## React/Component Testing

**Vitest `component` project (`happy-dom`):** render the form with React Testing Library, use a `vi.fn()` callback and assert the submitted value or visible validation error.

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import TaskForm from './TaskForm';

describe('TaskForm', () => {
  it('submits the form with entered data', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    // Find elements by accessible role/label (not test IDs)
    fireEvent.change(await screen.findByRole('textbox', { name: /title/i }), {
      target: { value: 'New Task' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ title: 'New Task' });
    });
  });

  it('shows validation error for empty title', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(await screen.findByText(/title is required/i)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

For examples of the boundary in this repository, compare the [AddSections component test](../../src/components/AddSections/AddSections.test.tsx), which queries the rendered dialog by role and name in `happy-dom`, with the [AddSections browser test](../../src/components/AddSections/AddSections.browser.test.tsx), which sends Escape and verifies dismissal in Chromium.

## API / Integration Testing

Illustrative Supertest example with a hypothetical API; Supertest is not part of the project stack.

```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('POST /api/tasks', () => {
  it('creates a task and returns 201', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task' })
      .set('Authorization', `Bearer ${testToken}`)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      title: 'Test Task',
      status: 'pending',
    });
  });

  it('returns 422 for invalid input', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: '' })
      .set('Authorization', `Bearer ${testToken}`)
      .expect(422);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 without authentication', async () => {
    await request(app).post('/api/tasks').send({ title: 'Test' }).expect(401);
  });
});
```

## E2E Testing (Playwright)

Illustrative Playwright Test example for a hypothetical application. This is separate from the project's Vitest browser project.

```typescript
import { test, expect } from '@playwright/test';

test('user can create and complete a task', async ({ page }) => {
  // Navigate and authenticate
  await page.goto('/');
  await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
  await page.getByLabel(/password/i).fill('testpass123');
  await page.getByRole('button', { name: /log in/i }).click();

  // Create a task
  await page.getByRole('button', { name: /new task/i }).click();
  await page.getByRole('textbox', { name: /title/i }).fill('Buy groceries');
  await page.getByRole('button', { name: /create/i }).click();

  // Verify task appears
  // listitem has no accessible name from its content, so filter by text
  const task = page.getByRole('listitem').filter({ hasText: /buy groceries/i });
  await expect(task).toBeVisible();

  // Complete the task
  await task.getByRole('checkbox', { name: /complete buy groceries/i }).check();
  await expect(task).toHaveCSS('text-decoration-line', 'line-through');
});
```

## Test Anti-Patterns

| Anti-Pattern                                | Problem                        | Better Approach                                                      |
| ------------------------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Testing implementation details              | Breaks on refactor             | Test inputs/outputs                                                  |
| Snapshot everything                         | No one reviews snapshot diffs  | Assert specific values                                               |
| Shared mutable state                        | Tests pollute each other       | Setup/teardown per test                                              |
| Testing third-party code                    | Wastes time, not your bug      | Mock the boundary                                                    |
| Skipping tests to pass CI                   | Hides real bugs                | Investigate the failure and report unmet checks                      |
| Leaving `test.skip` in place without review | Hides unverified behaviour     | Account for disabled cases and repair them within the approved scope |
| Overly broad assertions                     | Doesn't catch regressions      | Be specific                                                          |
| No async error handling                     | Swallowed errors, false passes | Always `await` async tests                                           |

A contract-preserving test repair is allowed within the approved scope. Changing test strategy or expectations, removing coverage or bypassing checks requires [user approval](../../AGENTS.md#authority). An unauthorised skip leaves the applicable check unmet. When a snapshot is useful, review every change before accepting it.
