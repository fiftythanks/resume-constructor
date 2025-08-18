import capitalize from './capitalize';

describe('capitalize()', () => {
  describe('when the argument is a string', () => {
    it('returns the capitalised string when the string starts with a letter', () => {
      expect(capitalize('string')).toBe('String');
    });

    test('returns the capitalised string when the string is capitalised', () => {
      expect(capitalize('String')).toBe('String');
    });

    test('returns the capitalised string when the string starts with a non-letter symbol', () => {
      expect(capitalize('1fd')).toBe('1fd');
      expect(capitalize('%ds')).toBe('%ds');
    });

    test('returns the capitalised string when the string is empty', () => {
      expect(capitalize('')).toBe('');
    });
  });

  const testCases = [
    { value: 5, type: 'Number' },
    { value: null, type: 'Null' },
    { value: undefined, type: 'Undefined' },
    { value: Symbol('string'), type: 'Symbol' },
    { value: true, type: 'Boolean' },
    { value: 151324314n, type: 'BigInt' },
    { value: { string: 'string' }, type: 'Object' },
    { value: ['string', 'string'], type: 'Array' },
    { value: function () {}, type: 'Function' },
  ];

  it.each(testCases)(
    'throws TypeError when the argument is $type',
    ({ value }) => {
      expect(() => capitalize(value)).toThrow(
        'Incorrect argument! capitalize() accepts strings only.',
      );
    },
  );
});
