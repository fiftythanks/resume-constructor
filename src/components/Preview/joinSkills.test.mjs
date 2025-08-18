import joinSkills from './joinSkills';

describe('joinSkills()', () => {
  it('joins "value" property values of an array of { value: ... } elements with a ", " separator', () => {
    const skills = [
      { value: 'string' },
      { value: 'another string' },
      { value: 'third' },
    ];

    expect(joinSkills(skills)).toBe('string, another string, third');
  });

  it.each([
    { value: 'string', type: 'String' },
    { value: 5, type: 'Number' },
    { value: null, type: 'Null' },
    { value: undefined, type: 'Undefined' },
    { value: Symbol('string'), type: 'Symbol' },
    { value: true, type: 'Boolean' },
    { value: 151324314n, type: 'BigInt' },
    { value: { string: 'string' }, type: 'Object' },
    { value: function () {}, type: 'Function' },
  ])('throws TypeError if the argument is $type', ({ value }) => {
    expect(() => joinSkills(value)).toThrow(
      'Incorrect argument! joinSkills() accepts arrays only.',
    );
  });

  it.each([
    { item: 'string', type: 'String' },
    { item: 5, type: 'Number' },
    { item: null, type: 'Null' },
    { item: undefined, type: 'Undefined' },
    { item: Symbol('string'), type: 'Symbol' },
    { item: true, type: 'Boolean' },
    { item: 151324314n, type: 'BigInt' },
  ])('throws if the input array has $type elements', ({ item }) => {
    expect(() => joinSkills([{ value: 'string' }, item])).toThrow(
      'Incorrect argument! Input array must consist of objects with a property "value" that has a string value.',
    );
  });

  it('throws if the input array has object elements that do not have a property "value"', () => {
    expect(() => joinSkills([{ Value: 'string' }])).toThrow(
      'Incorrect argument! Input array must consist of objects with a property "value" that has a string value.',
    );
  });

  it.each([
    { value: 5, type: 'Number' },
    { value: null, type: 'Null' },
    { value: undefined, type: 'Undefined' },
    { value: Symbol('string'), type: 'Symbol' },
    { value: true, type: 'Boolean' },
    { value: 151324314n, type: 'BigInt' },
    { value: { string: 'string' }, type: 'Object' },
    { value: ['string'], type: 'Array' },
    { value: function () {}, type: 'Function' },
  ])(
    'throws if the input array has object elements that have a property "value" whose value is $type',
    ({ value }) => {
      expect(() => joinSkills([{ value }])).toThrow(
        'Incorrect argument! Input array must consist of objects with a property "value" that has a string value.',
      );
    },
  );
});
