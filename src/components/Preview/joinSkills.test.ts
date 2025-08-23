import joinSkills from './joinSkills';

describe('joinSkills()', () => {
  it('should transform an array of skill objects into a single, comma-separated string', () => {
    const skills = [
      { value: 'string' },
      { value: 'another string' },
      { value: 'third' },
    ];

    expect(joinSkills(skills)).toBe('string, another string, third');
  });

  it('should return an empty string when provided with an empty array', () => {
    expect(joinSkills([])).toBe('');
  });
});
