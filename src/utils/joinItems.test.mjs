import joinItems from './joinItems';

describe('joinItems()', () => {
  it('joins "value" property values of an array of { value: ... } elements with a ", " separator', () => {
    const items = [
      { value: 'string' },
      { value: 'another string' },
      { value: 'third' },
    ];

    expect(joinItems(items)).toBe('string, another string, third');
  });

  it.each([
    { value: 'string', type: 'string' },
    { value: 5, type: 'number' },
    { value: null, type: 'null' },
    { value: undefined, type: 'undefined' },
    { value: Symbol('string'), type: 'symbol' },
    { value: true, type: 'boolean' },
    { value: 151324314n, type: 'bigint' },
    { value: { string: 'string' }, type: 'object' },
    { value: function () {}, type: 'function' },
  ])('throws TypeError if the argument is $type', ({ value }) => {
    expect(() => joinItems(value)).toThrow(
      TypeError('Incorrect argument! joinItems() accepts arrays only.'),
    );
  });

  it.each([
    { item: 'string', type: 'string' },
    { item: 5, type: 'number' },
    { item: null, type: 'null' },
    { item: undefined, type: 'undefined' },
    { item: Symbol('string'), type: 'symbol' },
    { item: true, type: 'boolean' },
    { item: 151324314n, type: 'bigint' },
  ])('throws if the input array has $type elements', ({ item }) => {
    expect(() => joinItems([{ value: 'string' }, item])).toThrow(
      TypeError(
        'Incorrect argument! Input array must consist of objects with properties "value" with string values.',
      ),
    );
  });
});
