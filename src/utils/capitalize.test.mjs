import capitalize from './capitalize';

describe('capitalize()', () => {
  describe('Returns a capitalised string when the argument is a string', () => {
    test('when the argument is a lowercase string and it starts with a letter', () => {
      expect(capitalize('string')).toBe('String');
    });

    test('when the argument is a capitalised string', () => {
      expect(capitalize('String')).toBe('String');
    });

    test('when the argument is a string that starts with a non-letter symbol', () => {
      expect(capitalize('1fd')).toBe('1fd');
      expect(capitalize('%ds')).toBe('%ds');
    });

    test('when the argument is an empty string', () => {
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
        TypeError('Incorrect argument! `capitalize` accepts strings only.'),
      );
    },
  );
});
