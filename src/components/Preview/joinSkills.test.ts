import joinSkills from './joinSkills';

import type { ItemWithId } from '@/types/resumeData';

describe('joinSkills()', () => {
  it('should transform an array of skill objects into a single, comma-separated string', () => {
    const skills: ItemWithId[] = [
      { id: '1-1-1-1-1', value: 'string' },
      { id: '2-2-2-2-2', value: 'another string' },
      { id: '3-3-3-3-3', value: 'third' },
    ];

    const result = joinSkills(skills);

    expect(result).toBe('string, another string, third');
  });

  it('should return an empty string when provided with an empty array', () => {
    const result = joinSkills([]);

    expect(result).toBe('');
  });
});
