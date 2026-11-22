import possibleSectionIds from '@/utils/possibleSectionIds';

import type {
  SectionIds,
  SectionIdsDeletable,
  TabpanelIds,
} from '@/types/resumeData';
import type { ArraySplice } from 'type-fest';

type AppendSuffix<T extends SectionIds> = {
  [K in keyof T]: `${T[K]}-tabpanel`;
};

/**
 * Returns the space-separated list of DOM element IDs controlled by the
 * "Clear All" and "Fill All" toolbar actions: all deletable section tab IDs
 * (every section except "personal") followed by all section tabpanel IDs.
 *
 * @returns Space-separated string of controlled tab and tabpanel IDs for `aria-controls`.
 */
export default function getControlledIds(): string {
  /**
   * `Array.prototype.toSpliced` widens the tuple return type to `SectionId[]`,
   * so we narrow it back to `ArraySplice<SectionIds, 0, 1>`.
   */
  const deletableSectionIds: SectionIdsDeletable = possibleSectionIds.toSpliced(
    0,
    1,
  ) as ArraySplice<SectionIds, 0, 1>;

  /**
   * `Array.prototype.map` widens the mapped tuple return type to `string[]`,
   * so we narrow it back to `AppendSuffix<SectionIds>`.
   */
  const tabpanelIds: TabpanelIds = possibleSectionIds.map(
    (sectionId) => `${sectionId}-tabpanel`,
  ) as AppendSuffix<SectionIds>;

  return [...deletableSectionIds, ...tabpanelIds].join(' ');
}
