import possibleSectionIds from '@/utils/possibleSectionIds';

import getAddableSectionIds from './getAddableSectionIds';

import type { SectionId } from '@/types/resumeData';

describe('getAddableSectionIds', () => {
  it('should return all possible section IDs when no sections are active', () => {
    const activeSectionIds: SectionId[] = [];

    const result = getAddableSectionIds(activeSectionIds);

    expect(result).toEqual(possibleSectionIds);
  });

  it('should return only inactive section IDs in canonical order when some sections are active', () => {
    const activeSectionIds: SectionId[] = [
      'personal',
      'links',
      'education',
      'experience',
    ];

    const result = getAddableSectionIds(activeSectionIds);

    expect(result).toEqual(['skills', 'projects', 'certifications']);
  });

  it('should return an empty array when all possible sections are active', () => {
    const activeSectionIds: readonly SectionId[] = possibleSectionIds;

    const result = getAddableSectionIds(activeSectionIds);

    expect(result).toEqual([]);
  });
});
