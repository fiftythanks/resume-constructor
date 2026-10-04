import capitalize from './capitalize';

describe('capitalize()', () => {
  it('should capitalise the first letter of a lower-case string', () => {
    const result = capitalize('string');

    expect(result).toBe('String');
  });

  it('should return the string untouched if it is already capitalised', () => {
    const result = capitalize('String');

    expect(result).toBe('String');
  });

  it.each([
    ['1fd', '1fd'],
    ['%ds', '%ds'],
  ])(
    'should return the string untouched when starting with non-letter "%s"',
    (input, expected) => {
      const result = capitalize(input);

      expect(result).toBe(expected);
    },
  );

  it('should return an empty string when given an empty string', () => {
    const result = capitalize('');

    expect(result).toBe('');
  });
});
