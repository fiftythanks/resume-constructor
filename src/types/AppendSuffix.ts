/**
 * Appends a string suffix to each element of a tuple or array of strings.
 *
 * @typeParam T - The source tuple or array of strings.
 * @typeParam Suffix - The string literal to append to each element.
 *
 * @example
 * ```typescript
 * type Elements = readonly ['one', 'two'];
 *
 * // Result: readonly ['one-random', 'two-random']
 * type Result = AppendSuffix<Elements, '-random'>;
 * ```
 */
export type AppendSuffix<T extends readonly string[], Suffix extends string> = {
  readonly [K in keyof T]: `${T[K]}${Suffix}`;
};
