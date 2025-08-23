import capitalize from './capitalize';

describe('capitalize()', () => {
  it('should capitalise the first letter of a lower-case string', () => {
    expect(capitalize('string')).toBe('String');
  });

  it('should return the string untouched if it is already capitalised', () => {
    expect(capitalize('String')).toBe('String');
  });

  test('should return the string untouched if it starts with a non-letter symbol', () => {
    expect(capitalize('1fd')).toBe('1fd');
    expect(capitalize('%ds')).toBe('%ds');
  });

  test('should return an empty string when given an empty string', () => {
    expect(capitalize('')).toBe('');
  });
});
