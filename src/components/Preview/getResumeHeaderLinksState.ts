import type { Link, Links, SectionId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

const LINK_TYPES: readonly (keyof Links)[] = [
  'github',
  'linkedin',
  'telegram',
  'website',
];

export interface ActiveCustomLink {
  item: ReadonlyDeep<Link>;
  type: keyof Links;
}

export interface ResumeHeaderLinksState {
  activeCustomLinks: ActiveCustomLink[];
  hasLinksSection: boolean;
  hasVisibleLinks: boolean;
  shouldShowInlineEmail: boolean;
}

/**
 * Derives header contact and custom link visibility state for `ResumeDocument`
 * based on active sections, personal email and custom link entries.
 */
export default function getResumeHeaderLinksState(
  activeSectionIds: ReadonlyDeep<SectionId[]>,
  email: string,
  links: ReadonlyDeep<Links>,
): ResumeHeaderLinksState {
  const hasLinksSection = activeSectionIds.includes('links');
  const shouldShowInlineEmail = !hasLinksSection && email !== '';

  const activeCustomLinks: ActiveCustomLink[] = [];

  for (const type of LINK_TYPES) {
    const item = links[type];

    if (item.text !== '') {
      activeCustomLinks.push({ item, type });
    }
  }

  const hasVisibleLinks =
    hasLinksSection && (email !== '' || activeCustomLinks.length > 0);

  return {
    activeCustomLinks,
    hasLinksSection,
    hasVisibleLinks,
    shouldShowInlineEmail,
  };
}
