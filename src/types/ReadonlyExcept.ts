import type { ReadonlyDeep } from 'type-fest';

/**
 * Constructs a component props' type making all props deeply readonly except
 * for those props that satisfy the constraint `K`.
 */
export type ReadonlyExcept<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  K extends keyof T,
> = Pick<T, K> & ReadonlyDeep<Omit<T, K>>;
