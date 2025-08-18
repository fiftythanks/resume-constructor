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
      'Incorrect argument! joinItems() accepts arrays only.',
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
      'Incorrect argument! Input array must consist of objects with a property "value" that has a string value.',
    );
  });

  it('throws if the input array has object elements that do not have a property "value"', () => {
    expect(() => joinItems([{ Value: 'string' }])).toThrow(
      'Incorrect argument! Input array must consist of objects with a property "value" that has a string value.',
    );
  });

  it.each([
    { value: 5, type: 'number' },
    { value: null, type: 'null' },
    { value: undefined, type: 'undefined' },
    { value: Symbol('string'), type: 'symbol' },
    { value: true, type: 'boolean' },
    { value: 151324314n, type: 'bigint' },
    { value: { string: 'string' }, type: 'object' },
    { value: ['string'], type: 'array' },
    { value: function () {}, type: 'function' },
  ])(
    'throws if the input array has object elements that have a property "value" whose value is $type',
    ({ value }) => {
      expect(() => joinItems([{ value }])).toThrow(
        'Incorrect argument! Input array must consist of objects with a property "value" that has a string value.',
      );
    },
  );
});
