# TypeScript and React

Deep immutability is the invariant. Default to `ReadonlyDeep` for props and other immutable inputs. `ReadonlyExcept` is a convenience for legitimate mutable exceptions, such as a ref, not a requirement on every component. Use Immer for complicated updates; straightforward updates do not need it merely because data is nested.

Keep reusable UI in `src/components/`, feature composition in `src/pages/` and business logic separate from presentation. Business functions need not be hooks. Extract meaningful pure logic when it improves clarity and colocate its tests; private extraction is discretionary and does not require a barrel re-export. Documentation discovery is covered in [Documentation](documentation.md).

Name event parameters `e`. Use `neverReached` for exhaustive handling. Prefer inference and narrowing to type or non-null assertions. An unavoidable assertion needs a local explanation and a narrow override when a configured lint rule enforces the restriction.

Derive values during rendering or in the interaction that changes them rather than synchronising redundant state with effects. Effects remain appropriate for necessary external synchronisation. Consult current React documentation for API details; configuration establishes compiler activation and machine-enforced rules.

Use JSDoc-style multiline explanatory comments with leading asterisks; use standalone `//` remarks for single-line explanations or annotations. See [Prose](prose.md) for original wording and [Styling](styling.md) for Sass and native CSS comments.
