import { useState } from 'react';

import capitalize from '@/utils/capitalize';

import type { SectionId, SectionIds, SectionTitles } from '@/types/resumeData';

// TODO: add JSDoc to all exported functions here.

// TODO: either pass it to `INITIAL_ACTIVE_SECTION_IDS` or merge them for now. What's the purpose of having two identical arrays that won't change?
//! Order matters.
const SECTION_IDS: Readonly<SectionIds> = Object.freeze([
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
]);

// TODO: rename to SECTION_TITLES
const SECTION_TITLES: Readonly<SectionTitles> = Object.freeze({
  personal: 'Personal Details',
  links: 'Links',
  skills: 'Technical Skills',
  experience: 'Work Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications',
});

// TODO: decide which initial sections to use.
const INITIAL_ACTIVE_SECTION_IDS: SectionId[] = [
  'personal',
  // 'links',
  // 'skills',
  // 'experience',
  // 'projects',
  // 'education',
  // 'certifications',
];

export default function useAppState() {
  const [editorMode, setEditorMode] = useState(false);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
  const [openedSectionId, setOpenedSectionId] = useState<SectionId>('personal');

  const [activeSectionIds, setActiveSectionIds] = useState<SectionId[]>(
    INITIAL_ACTIVE_SECTION_IDS,
  );

  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  // Screen Reader Announcement Functions

  function resetScreenReaderAnnouncement(): void {
    setScreenReaderAnnouncement('');
  }

  function updateScreenReaderAnnouncement(announcement: string): void {
    setScreenReaderAnnouncement(announcement);
  }

  // General Functions for Handling Sections

  // FIXME (application-wide): when you add a bunch of sections, only the last one is announced, for some reason. Fix it. (Should be fixed already. Check.)
  function addSections(sectionIds: SectionId[]) {
    const sectionIdsToAdd = sectionIds.filter(
      (sectionId) => !activeSectionIds.includes(sectionId),
    );

    const newActiveSectionIds = [...activeSectionIds, ...sectionIdsToAdd];
    setActiveSectionIds(newActiveSectionIds);

    if (sectionIdsToAdd.length === 1) {
      setScreenReaderAnnouncement(
        `Section ${SECTION_TITLES[sectionIdsToAdd[0]]} was added.`,
      );
    } else if (sectionIdsToAdd.length > 1) {
      const addedSectionTitles = sectionIdsToAdd
        .map((sectionId) => SECTION_TITLES[sectionId])
        .join(', ');

      setScreenReaderAnnouncement(`Sections ${addedSectionTitles} were added.`);
    }
  }

  function deleteSections(
    sectionIds: SectionId[],
    clear: (sectionId: SectionId | SectionId[]) => void,
  ): void {
    const newActiveSectionIds = new Set(activeSectionIds);
    let newScreenReaderAnnouncement = '';
    let wasOpenedSectionDeleted = false;

    sectionIds.forEach((sectionId) => {
      // TODO (application-wide): add an array/set of the IDs of sections that are undraggable and undeletable and in every such place like this check if the collection contains the ID instead of checking like `sectionId !== 'personal'`.
      /**
       * If the section ID isn't "personal" and is currently active, it's
       * corresponding section is eligible for deletion. Otherwise, no need to * do anything unless it's "personal", in which case the section must be
       * cleared, but not deleted.
       */
      if (activeSectionIds.includes(sectionId) && sectionId !== 'personal') {
        newActiveSectionIds.delete(sectionId);
        clear(sectionId);

        // TODO (application-wide): this use of `capitalize` is dirty. Refactor. As well as in all other components that do this.
        newScreenReaderAnnouncement +=
          newScreenReaderAnnouncement === ''
            ? capitalize(sectionId)
            : `, ${sectionId}`;

        // TODO: change it to be a more sophisticated logic. It should work similarly to how focus works when you delete an open section.
        // If an opened section is deleted, open Personal.
        if (openedSectionId === sectionId) {
          setOpenedSectionId('personal');
          wasOpenedSectionDeleted = true;
        }
      } else if (sectionId === 'personal') {
        clear(sectionId);
      }
    });

    if (wasOpenedSectionDeleted) {
      const firstDeleletedSectionIndex = activeSectionIds.indexOf(
        sectionIds[0],
      );

      const lastDeleletedSectionIndex =
        sectionIds.length === 1
          ? firstDeleletedSectionIndex
          : activeSectionIds.indexOf(sectionIds.at(-1)!);

      // If the last deleted section wasn't the last active section.
      if (lastDeleletedSectionIndex < activeSectionIds.length - 1) {
        setOpenedSectionId(activeSectionIds[lastDeleletedSectionIndex + 1]);
      } else if (firstDeleletedSectionIndex !== 0) {
        setOpenedSectionId(activeSectionIds[firstDeleletedSectionIndex - 1]);
      }
    }

    setActiveSectionIds([...newActiveSectionIds]);

    // TOOD: make the announcement "The section(s) ... was/were deleted. The opened section was deleted. The new opened section is [SectionName]". Use CLSX for the task.(Or maybe without the definite articles, to conform to language in all other announcements.)
    if (newScreenReaderAnnouncement !== '') {
      newScreenReaderAnnouncement += ' deleted.';

      if (wasOpenedSectionDeleted) {
        newScreenReaderAnnouncement += ' Opened section deleted.';
      }

      setScreenReaderAnnouncement(newScreenReaderAnnouncement);
    }
  }

  function deleteAll(
    clear: (sectionId: SectionId | SectionId[]) => void,
  ): void {
    deleteSections([...SECTION_IDS], clear);
  }

  function openSection(sectionId: SectionId): void {
    setOpenedSectionId(sectionId);
    setScreenReaderAnnouncement(
      `Section ${SECTION_TITLES[sectionId]} was opened.`,
    );
  }

  function reorderSections(newActiveSectionIds: SectionId[]): void {
    setActiveSectionIds(newActiveSectionIds);
  }

  // Navbar Functions

  function toggleEditorMode(): void {
    setEditorMode(!editorMode);

    if (editorMode) {
      setScreenReaderAnnouncement('Editor Mode off');
    } else {
      setScreenReaderAnnouncement(
        'Editor Mode on. To move focus to tabs for editing, press Tab while holding Shift. If you collapse the navbar either by pressing Escape or pressing the "Toggle Navbar" button, the editor mode will be turned off automatically.',
      );
    }
  }

  function toggleNavbar(): void {
    setIsNavbarExpanded(!isNavbarExpanded);

    if (editorMode) setEditorMode(false);
  }

  return {
    activeSectionIds,
    addSections,
    deleteAll,
    deleteSections,
    editorMode,
    isNavbarExpanded,
    openSection,
    openedSectionId,
    reorderSections,
    resetScreenReaderAnnouncement,
    screenReaderAnnouncement,
    toggleEditorMode,
    toggleNavbar,
    updateScreenReaderAnnouncement,
    possibleSectionIDs: SECTION_IDS,
  };
}
