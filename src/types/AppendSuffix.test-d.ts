import type { AppendSuffix } from './AppendSuffix';

describe('AppendSuffix', () => {
  it('should append the correct suffix', () => {
    type Items = readonly ['item-one', 'item-two', 'item-three'];

    type Result = AppendSuffix<Items, '-some-suffix'>;

    type Expected = readonly [
      'item-one-some-suffix',
      'item-two-some-suffix',
      'item-three-some-suffix',
    ];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
