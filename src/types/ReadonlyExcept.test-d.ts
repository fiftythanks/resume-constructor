import { describe, expectTypeOf, it } from 'vitest';

import type { ReadonlyExcept } from './ReadonlyExcept';
import type { ReadonlyDeep, ReadonlyKeysOf, WritableKeysOf } from 'type-fest';

interface Target {
  config: {
    retries: number;
    tags: string[];
  };
  count: number;
  id: string;
  nestedMutable: {
    items: number[];
    status: string;
  };
  optional?: string;
}

describe('ReadonlyExcept', () => {
  describe('mutability boundaries', () => {
    type Subject = ReadonlyExcept<Target, 'count' | 'nestedMutable'>;

    it('retains writability on exempt keys', () => {
      expectTypeOf<WritableKeysOf<Subject>>().toEqualTypeOf<
        'count' | 'nestedMutable'
      >();
    });

    it('enforces readonly on omitted top-level keys', () => {
      expectTypeOf<ReadonlyKeysOf<Subject>>().toEqualTypeOf<
        'config' | 'id' | 'optional'
      >();
    });

    it('retains writability inside exempt nested objects and arrays', () => {
      expectTypeOf<WritableKeysOf<Subject['nestedMutable']>>().toEqualTypeOf<
        'items' | 'status'
      >();
      expectTypeOf<Subject['nestedMutable']['items']>().toEqualTypeOf<
        number[]
      >();
    });

    it('enforces deep readonly inside omitted nested objects and arrays', () => {
      expectTypeOf<ReadonlyKeysOf<Subject['config']>>().toEqualTypeOf<
        'retries' | 'tags'
      >();
      expectTypeOf<Subject['config']['tags']>().toEqualTypeOf<
        readonly string[]
      >();
    });
  });

  describe('key selection variations', () => {
    it('leaves all keys writable when all are exempt', () => {
      type AllExempt = ReadonlyExcept<Target, keyof Target>;
      expectTypeOf<AllExempt>().branded.toEqualTypeOf<Target>();
    });

    it('makes all keys readonly when none are exempt', () => {
      type NoneExempt = ReadonlyExcept<Target, never>;
      expectTypeOf<NoneExempt>().branded.toEqualTypeOf<ReadonlyDeep<Target>>();
    });
  });

  describe('structural edge cases', () => {
    it('preserves optionality on omitted properties', () => {
      type Subject = ReadonlyExcept<Target, 'count'>;
      expectTypeOf<Subject['optional']>().toEqualTypeOf<string | undefined>();
    });
  });

  describe('compiler constraints', () => {
    it('rejects keys not present in T', () => {
      // @ts-expect-error Type '"invalid"' is not assignable to type 'keyof Target'
      expectTypeOf<ReadonlyExcept<Target, 'invalid'>>();
    });

    it('rejects primitive types passed to T', () => {
      // @ts-expect-error Type 'number' does not satisfy constraint 'Record<string, any>'
      expectTypeOf<ReadonlyExcept<number, 'toFixed'>>();
    });
  });
});
