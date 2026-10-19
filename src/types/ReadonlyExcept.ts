import type { ReadonlyDeep } from 'type-fest';

/**
 * Constructs a type by recursively setting all properties of `T` to readonly,
 * except for the keys specified in `K`, which retain their original mutability.
 *
 * @typeParam T - The source object type.
 * @typeParam K - Keys in `T` to exempt from deep immutability.
 *
 * @example
 * ```ts
 * interface State {
 *   meta: { id: string; flags: string[] };
 *   buffer: { position: number };
 * }
 *
 * // `buffer` remains mutable; `meta` and all its nested members become readonly:
 * type SessionState = ReadonlyExcept<State, 'buffer'>;
 * ```
 */
export type ReadonlyExcept<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  K extends keyof T,
> = Pick<T, K> & ReadonlyDeep<Omit<T, K>>;
