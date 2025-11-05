import joinSkills from './joinSkills';

import { ItemWithId } from '@/types/resumeData';

describe('joinSkills()', () => {
  it('should transform an array of skill objects into a single, comma-separated string', () => {
    const skills: ItemWithId[] = [
      { value: 'string', id: '5-5-5-5-5' },
      { value: 'another string', id: '5-5-5-5-5' },
      { value: 'third', id: '5-5-5-5-5' },
    ];

    expect(joinSkills(skills)).toBe('string, another string, third');
  });

  it('should return an empty string when provided with an empty array', () => {
    expect(joinSkills([])).toBe('');
  });
});
