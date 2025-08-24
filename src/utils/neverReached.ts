/**
 * A utility function for exhaustivness checking in TypeScript `switch`
 * statements.
 *
 * This function is used in the `default` case of a `switch` to ensure that all
 * possible values of a union type have been handled. If the function is ever
 * called, it means a new case was added to the union type without being
 * handled, causing an immediate runtime error.
 */
export default function neverReached(never: never) {
  throw new Error(`Unhandled case: ${never}`);
}
