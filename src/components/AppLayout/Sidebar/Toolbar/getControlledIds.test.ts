import possibleSectionIds from '@/utils/possibleSectionIds';

import getControlledIds from './getControlledIds';

describe('getControlledIds', () => {
  it('should return all deletable section IDs followed by all tabpanel IDs separated by spaces', () => {
    const result = getControlledIds();

    expect(result).toBe(
      'links skills experience projects education certifications personal-tabpanel links-tabpanel skills-tabpanel experience-tabpanel projects-tabpanel education-tabpanel certifications-tabpanel',
    );
  });

  it('should omit the undeletable "personal" tab ID while including all tabpanel IDs', () => {
    const ids = getControlledIds().split(' ');

    expect(ids).toHaveLength(possibleSectionIds.length * 2 - 1);
    expect(ids).not.toContain('personal');
    expect(ids).toContain('personal-tabpanel');
  });
});
