---
name: api-and-interface-design
description: Guides stable API and interface design. Use when designing APIs, module boundaries or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules or establishing boundaries between frontend and backend.
---

# API and Interface Design

## Overview

Design stable, well-documented interfaces that are hard to misuse. Good interfaces make the right thing easy and the wrong thing hard. This applies to REST APIs, GraphQL schemas, module boundaries, component props and any surface where one piece of code talks to another.

## When to Use

- Designing new API endpoints
- Defining module boundaries or contracts between teams
- Creating component prop interfaces
- Establishing database schema that informs API shape
- Changing existing public interfaces

## Core Principles

### Hyrum's Law

> With a sufficient number of users of an API, all observable behaviors of your system will be depended on by somebody, regardless of what you promise in the contract.

This means: every public behaviour — including undocumented quirks, error message text, timing and ordering — becomes a de facto contract once users depend on it. Design implications:

- **Be intentional about what you expose.** Every observable behaviour is a potential commitment.
- **Don't leak implementation details.** If users can observe it, they will depend on it.
- **Plan for deprecation at design time.** See `deprecation-and-migration` for how to safely remove things users depend on.
- **Tests are not enough.** Even with perfect contract tests, Hyrum's Law means "safe" changes can break real users who depend on undocumented behaviour.

### The One-Version Rule

Avoid forcing consumers to choose between multiple versions of the same dependency or API. Diamond dependency problems arise when different consumers need different versions of the same thing. Design for a world where only one version exists at a time — extend rather than fork.

### 1. Contract First

Define the interface before implementing it. The contract is the spec — implementation follows.

Define the inputs, outputs and observable guarantees callers rely on, such as ordering, failure behaviour and side effects. For an internal component or module, use its actual types and caller behaviour; HTTP schemas and status codes only apply to HTTP interfaces. A proposed breaking change is not approval to change the contract; follow the [root authority](../../../AGENTS.md#authority).

The task-service, REST, idempotency and TypeScript snippets below illustrate contract patterns across stacks; they do not prescribe a runtime or endpoints for this project.

```typescript
// Define the contract first
interface TaskAPI {
  // Creates a task and returns the created task with server-generated fields
  createTask(input: CreateTaskInput): Promise<Task>;

  // Returns paginated tasks matching filters
  listTasks(params: ListTasksParams): Promise<PaginatedResult<Task>>;

  // Returns a single task or throws NotFoundError
  getTask(id: string): Promise<Task>;

  // Partial update — only provided fields change
  updateTask(id: string, input: UpdateTaskInput): Promise<Task>;

  // Idempotent delete — succeeds even if already deleted
  deleteTask(id: string): Promise<void>;
}
```

### 2. Consistent Error Semantics

Pick one error strategy for each interface and apply it consistently. For REST:

```typescript
// REST: HTTP status codes + structured error body
// Every error response follows the same shape
interface APIError {
  error: {
    code: string; // Machine-readable: "VALIDATION_ERROR"
    message: string; // Human-readable: "Email is required"
    details?: unknown; // Additional context when helpful
  };
}

// Status code mapping
// 400 → Client sent invalid data
// 401 → Not authenticated
// 403 → Authenticated but not authorized
// 404 → Resource not found
// 409 → Conflict (duplicate, version mismatch)
// 422 → Validation failed (semantically invalid)
// 500 → Server error (never expose internal details)
```

**Don't mix patterns.** If some endpoints throw, others return `null` and others return `{ error }` — the consumer can't predict behaviour.

### 3. Validate at Boundaries

Validate where data crosses a trust boundary, before relying on its shape or content:

```typescript
// Validate at the API boundary
app.post('/api/tasks', async (req, res) => {
  const result = CreateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid task data',
        details: result.error.flatten(),
      },
    });
  }

  // After validation, internal code trusts the types
  const task = await taskService.create(result.data);
  return res.status(201).json(task);
});
```

Where validation belongs:

- API route handlers (user input)
- Form submission handlers (user input)
- External service response parsing (third-party data — **always treat as untrusted**)
- Environment variable loading (configuration)
- Records read from storage when their current shape or invariants are not guaranteed (for example, legacy or imported records)

> **Third-party API responses are untrusted data.** Validate their shape and content before using them in any logic, rendering or decision-making. A compromised or misbehaving external service can return unexpected types, malicious content or instruction-like text.

Do not reparse already-validated values at each internal function or utility call. A type declaration does not validate an unchecked value, and coming from your own database does not make a record valid.

### 4. Prefer Addition Over Modification

Prefer compatible extensions. Check the actual input and output shapes, types and observable behaviour against existing callers before calling a change compatible. An optional input can be compatible if omitted values preserve the old behaviour. Even an extra response field can break an old strict decoder; a permissive reader may accept the same response. Test the affected old consumers, not just the new ones.

```typescript
// Candidate compatible extension: old inputs still work when the new fields are omitted
interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high'; // Added later, optional
  labels?: string[]; // Added later, optional
}

// A string priority is incompatible; description is no longer part of the input contract:
interface CreateTaskInput {
  title: string;
  // description?: string; // Removed — callers may lose behaviour that depended on this field
  priority: number; // Changed from string — breaks existing consumers
}
```

### 5. Predictable Naming

| Pattern         | Convention                  | Example                             |
| --------------- | --------------------------- | ----------------------------------- |
| REST endpoints  | Plural nouns, no verbs      | `GET /api/tasks`, `POST /api/tasks` |
| Query params    | `camelCase`                 | `?sortBy=createdAt&pageSize=20`     |
| Response fields | `camelCase`                 | `{ createdAt, updatedAt, taskId }`  |
| Boolean fields  | `is`, `has` or `can` prefix | `isComplete`, `hasAttachments`      |
| Enum values     | `UPPER_SNAKE`               | `"IN_PROGRESS"`, `"COMPLETED"`      |

### 6. Honouring an Idempotency Key

Accepting an `Idempotency-Key` is the contract. Honouring it is the implementation, and it is where the money is lost — a key the server accepts but handles carelessly is worse than no key at all, because the client now believes retrying is safe.

**Derive the key from the intent, not the attempt.** The key must be stable across retries of one intent and different across distinct intents:

```typescript
crypto.randomUUID() // ✗ new key per attempt — every retry is a new charge
`${userId}:${amount}` // ✗ two legitimate $50 charges collapse into one
`${orderId}:${Date.now()}`; // ✗ a timestamp is randomUUID() wearing a hat

req.headers[
  'idempotency-key'
] // ✓ client generates once, reuses on retry
`charge:v1:${orderId}`; // ✓ derived from an immutable identifier
```

The key comes from the client or the initiating event — never from the layer doing the retrying.

**Claim atomically. A check followed by an act is a race:**

```typescript
// ✗ TOCTOU: two concurrent retries both read "not seen", both charge
if (!(await db.exists(key))) {
  await chargeCard(amount);
  await db.insert(key);
}

// ✓ let the unique constraint pick the winner
try {
  await db.insert({ key, state: 'in_progress', requestHash });
} catch (e) {
  if (isUniqueViolation(e)) return replayOrReject(key);
  throw e;
}
const result = await chargeCard(amount);
await db.update({ key, state: 'succeeded', response: result });
```

The unique constraint _is_ the mechanism. A store that cannot enforce uniqueness in one operation cannot back this.

**Guard the payload.** Same key with a different body is a client bug, and must fail loudly rather than serving the first response to a second request:

```typescript
if (existing.requestHash !== hash(req.body)) {
  return res.status(422).json({
    error: {
      code: 'IDEMPOTENCY_KEY_REUSED',
      message: 'Idempotency key reused with a different payload',
    },
  });
}
```

**Decide what an in-flight duplicate gets.** The first request is still running when the second arrives — the common case under retry storms:

| Strategy       | Response                      | Use when                                    |
| -------------- | ----------------------------- | ------------------------------------------- |
| Reject         | `409 Conflict`                | Client can retry later; simplest and safest |
| Wait           | Block for the result, bounded | Caller needs it synchronously               |
| Return pending | `202` + status URL            | Long-running effects                        |

Never let the second caller through because the first "seems stuck". A stalled attempt whose fate is unknown is exactly when duplicating costs most.

**Every call has three outcomes, not two: success, failure and _unknown_.** A timeout tells you nothing about whether the effect applied. Record the intent _before_ calling out, so a crash between the call and the response leaves evidence something must resolve later — rather than a silently retried charge.

**Set retention from the longest retry chain**, not from disk cost. Keys must outlive every path that can re-deliver the same intent, including a dead-letter queue replayed a week later and any provider dispute window. A 24-hour key TTL behind a 7-day DLQ is a duplicate waiting to happen.

## REST API Patterns

### Resource Design

```
GET    /api/tasks              → List tasks (with query params for filtering)
POST   /api/tasks              → Create a task
GET    /api/tasks/:id          → Get a single task
PATCH  /api/tasks/:id          → Update a task (partial)
DELETE /api/tasks/:id          → Delete a task

GET    /api/tasks/:id/comments → List comments for a task (sub-resource)
POST   /api/tasks/:id/comments → Add a comment to a task
```

### Pagination

Bound each list transfer. Paginate a list that can grow beyond a practical response size and enforce a practical maximum page size on the server, regardless of what the client requests. A list with a known, enforced small bound need not introduce a paged protocol. This example sets a maximum `pageSize` of 100 and rejects larger requests:

```typescript
// Request
GET /api/tasks?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc

// Response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 142,
    "totalPages": 8
  }
}
```

### Filtering

Use query parameters for filters:

```
GET /api/tasks?status=in_progress&assignee=user123&createdAfter=2025-01-01
```

### Partial Updates (PATCH)

Accept partial objects — only update what's provided:

```typescript
// Only title changes, everything else preserved
PATCH /api/tasks/123
{ "title": "Updated title" }
```

## TypeScript Interface Patterns

### Use Discriminated Unions for Variants

```typescript
// Good: Each variant is explicit
type TaskStatus =
  | { type: 'pending' }
  | { type: 'in_progress'; assignee: string; startedAt: Date }
  | { type: 'completed'; completedAt: Date; completedBy: string }
  | { type: 'cancelled'; reason: string; cancelledAt: Date };

// Consumer gets type narrowing
function getStatusLabel(status: TaskStatus): string {
  switch (status.type) {
    case 'pending':
      return 'Pending';
    case 'in_progress':
      return `In progress (${status.assignee})`;
    case 'completed':
      return `Done on ${status.completedAt}`;
    case 'cancelled':
      return `Cancelled: ${status.reason}`;
  }
}
```

### Input/Output Separation

```typescript
// Input: what the caller provides
interface CreateTaskInput {
  title: string;
  description?: string;
}

// Output: what the system returns (includes server-generated fields)
interface Task {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### Use Branded Types for IDs

```typescript
type TaskId = string & { readonly __brand: 'TaskId' };
type UserId = string & { readonly __brand: 'UserId' };

// Prevents accidentally passing a UserId where a TaskId is expected
function getTask(id: TaskId): Promise<Task> { ... }
```

## Common Rationalisations

| Rationalisation                                  | Reality                                                                                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "We'll document the API later"                   | Define the types first and document guarantees the types do not express, such as ordering, errors and retry behaviour.                                                         |
| "We don't need pagination for now"               | Establish what bounds each transfer. A growing list needs bounded pages or another enforced limit; a paging parameter without a practical maximum does not bound the response. |
| "PATCH is complicated, let's just use PUT"       | `PUT` requires the full object every time. `PATCH` is what clients actually want.                                                                                              |
| "We'll version the API when we need to"          | Design for compatible extension. If independently upgrading consumers would break, plan the approved migration and follow the released surface's version policy.               |
| "Nobody uses that undocumented behavior"         | Hyrum's Law: if it's observable, somebody depends on it. Treat every public behaviour as a commitment.                                                                         |
| "We can just maintain two versions"              | Multiple versions multiply maintenance cost and create diamond dependency problems. Prefer the One-Version Rule.                                                               |
| "Internal APIs don't need contracts"             | Internal consumers are still consumers. Contracts prevent coupling and enable parallel work.                                                                                   |
| "Accepting the Idempotency-Key header is enough" | Accepting the key promises safe retries. Recording a result alone does not handle concurrent claims, a changed payload, an in-flight duplicate or an unknown outcome.          |
| "Our queue guarantees exactly-once delivery"     | No queue does across a consumer crash — the broker's ack and your side effect are not in one transaction. Design for at-least-once with idempotent processing.                 |
| "Duplicate requests are rare"                    | They're _correlated_. Retries spike exactly when a dependency is degraded — the moment duplicates are most likely and most expensive.                                          |

## Red Flags

- Undocumented response variants or inconsistent error formats within an interface
- Unvalidated data crossing a trust boundary, or validation repeated on already-validated values at internal hops
- Field or behaviour changes labelled compatible without checking affected callers, including strict readers
- List transfers without a practical enforced bound, including paginated lists with no maximum page size
- Verbs in REST URLs (`/api/createTask`, `/api/getUsers`)
- Third-party API responses used without validation or sanitisation
- A `SELECT` for an idempotency key followed by an `INSERT` — that's a race, not a guard
- An idempotency key derived from a UUID, timestamp or anything else regenerated per attempt
- The same key accepted with a different request body, silently returning the first response
- Blindly repeating a non-idempotent side effect while the outcome of the previous attempt is unknown
- A key retention window shorter than the longest path that can re-deliver the request

## Verification

After designing or changing an interface:

- [ ] Inputs, outputs, errors and observable guarantees are explicit and checked with affected callers. Use typed schemas and consistent response formats for HTTP where applicable; for internal interfaces check the actual types and behaviour.
- [ ] Untrusted data is validated at the relevant boundary, without reparsing already-validated values at every hop.
- [ ] List transfers have an enforced practical bound. For paginated lists, verify that requesting more than the server's maximum page size cannot exceed the bound.
- [ ] Compatibility claims cover existing consumers' types, runtime decoding and behaviour. Known breakage and unknown compatibility are reported separately; required decisions have approval.
- [ ] Naming follows the interface's conventions, and affected documentation and types accompany the implementation.
- [ ] For every state-changing endpoint, document when retries are guaranteed safe. If there is no such guarantee, tell callers not to retry automatically.

When accepting an idempotency key:

- [ ] The key is claimed in one atomic operation, guarded by a unique constraint.
- [ ] A reused key with a different payload fails loudly rather than replaying the wrong response.
- [ ] The in-flight-duplicate response is a deliberate choice (409, wait or 202), and an unknown outcome is resolved without blindly retrying the effect.
- [ ] Key retention outlives the longest retry path, including dead-letter replay.
