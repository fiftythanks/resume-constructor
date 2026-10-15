import possibleSectionIds from '@/utils/possibleSectionIds';

import type { SectionId } from '@/types/resumeData';

/**
 * Returns the section IDs from `possibleSectionIds` that are not currently
 * active in `activeSectionIds`, preserving their canonical order.
 *
 * @param activeSectionIds - Currently active resume section IDs.
 * @returns Inactive section IDs that can still be added.
 */
export default function getAddableSectionIds(
  activeSectionIds: readonly SectionId[],
): SectionId[] {
  return possibleSectionIds.filter(
    (sectionId) => !activeSectionIds.includes(sectionId),
  );
}
