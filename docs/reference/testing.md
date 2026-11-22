# Testing

Use strict test-first development. Changed behaviour begins with a test failing for the intended reason; implementation then makes it green. Behaviour-preserving refactors use existing green tests. Changes to contracts or coverage are governed by the [root authority](../../AGENTS.md#authority).

Test observable behaviour and deliberate module/API contracts. Assertions should survive behaviour-preserving implementation refactors. Test CSS effects through behaviour, browser or visual evidence rather than blanket internal class-name checks. Prefer role/name queries, with labels or text where appropriate. One coherent behaviour can require several interactions; interaction count is not a useful proxy for test scope.

Choose the environment that can establish the contract:

- Node for pure logic.
- A simulated DOM for component and hook contracts that do not depend on browser layout or native mechanics.
- A browser for native dialogs, focus geometry, drag-and-drop coordinates and layout behaviour.

Keep tests deterministic and isolated, derive expected results independently of the implementation and await asynchronous interactions and assertions. Test discovery belongs to `vitest.config.ts`; consult current upstream documentation for testing-library API syntax. [Verification](verification.md) explains how these checks support review without proving test-first history.
