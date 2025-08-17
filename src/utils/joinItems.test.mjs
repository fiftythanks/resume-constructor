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
});
