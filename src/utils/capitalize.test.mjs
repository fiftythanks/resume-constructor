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
    { value: 5, type: 'number' },
    { value: null, type: 'null' },
    { value: undefined, type: 'undefined' },
    { value: Symbol('string'), type: 'symbol' },
    { value: true, type: 'boolean' },
    { value: 151324314n, type: 'bigint' },
    { value: { string: 'string' }, type: 'object' },
    { value: ['string', 'string'], type: 'array' },
    { value: function () {}, type: 'function' },
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
