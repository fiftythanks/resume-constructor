import { useCallback, useEffect, useRef, useState } from 'react';

import getArrayWithoutDuplicates from '@/utils/getArrayWithoutDuplicates';

import type { SectionId, SectionIds, SectionTitles } from '@/types/resumeData';

// TODO: either pass it to `INITIAL_ACTIVE_SECTION_IDS` or merge them for now. What's the purpose of having two identical arrays that won't change?
//! Order matters.
const SECTION_IDS: SectionIds = [
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
];

const SECTION_TITLES: SectionTitles = {
  personal: 'Personal Details',
  links: 'Links',
  skills: 'Technical Skills',
  experience: 'Work Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications',
};

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

/**
 * A hook intended for generating and passing all necessary application state,
 * data and functions, such as what section is currently opened, is the navbar
 * expanded, all sections' IDs, functions to add or delete sections and more.
 */
export default function useAppState() {
  // TODO: rename `editorMode` to `isEditorModeOn` or something similar.
  const [editorMode, setEditorMode] = useState(false);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
  const [openedSectionId, setOpenedSectionId] = useState<SectionId>('personal');
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  const [activeSectionIds, setActiveSectionIds] = useState<SectionId[]>(
    INITIAL_ACTIVE_SECTION_IDS,
  );

  const previousActiveSectionIdsRef = useRef(new Set(activeSectionIds));
  const previousOpenedSectionIdRef = useRef(openedSectionId);
  const previousEditorModeRef = useRef(editorMode);

  // Announce section addition/deletion to screen readers.
  useEffect(() => {
    // In case new sections are added.
    const newSectionIds = activeSectionIds.filter(
      (sectionId) => !previousActiveSectionIdsRef.current.has(sectionId),
    );

    if (newSectionIds.length > 0) {
      if (newSectionIds.length === 1) {
        setScreenReaderAnnouncement(
          `Section ${SECTION_TITLES[newSectionIds[0]]} was added.`,
        );
      } else if (newSectionIds.length > 1) {
        const addedSectionTitles = newSectionIds
          .map((sectionId) => SECTION_TITLES[sectionId])
          .join(', ');

        setScreenReaderAnnouncement(
          `Sections ${addedSectionTitles} were added.`,
        );
      }

      previousActiveSectionIdsRef.current = new Set(activeSectionIds);
    }

    // In case sections are deleted.
    const deletedSectionIds = [...previousActiveSectionIdsRef.current].filter(
      (sectionId) => !activeSectionIds.includes(sectionId),
    );

    if (deletedSectionIds.length > 0) {
      if (deletedSectionIds.length === 1) {
        setScreenReaderAnnouncement(
          `Section ${SECTION_TITLES[deletedSectionIds[0]]} was deleted.`,
        );
      } else if (deletedSectionIds.length > 1) {
        const deletedSectionTitles = deletedSectionIds
          .map((sectionId) => SECTION_TITLES[sectionId])
          .join(', ');

        setScreenReaderAnnouncement(
          `Sections ${deletedSectionTitles} were deleted.`,
        );
      }

      previousActiveSectionIdsRef.current = new Set(activeSectionIds);
    }
  }, [activeSectionIds]);

  // Announce opening a new section to screen readers.
  useEffect(() => {
    if (previousOpenedSectionIdRef.current !== openedSectionId) {
      setScreenReaderAnnouncement(
        `Previous opened section was closed. New opened section is ${SECTION_TITLES[openedSectionId]}`,
      );

      previousOpenedSectionIdRef.current = openedSectionId;
    }
  }, [openedSectionId]);

  // Announce toggling the editor mode to screen readers.
  useEffect(() => {
    if (previousEditorModeRef.current !== editorMode) {
      if (editorMode) {
        setScreenReaderAnnouncement('Editor Mode off');
      } else {
        setScreenReaderAnnouncement(
          'Editor Mode on. To move focus to tabs for editing, press Tab while holding Shift. If you collapse the navbar either by pressing Escape or pressing the "Toggle Navbar" button, the editor mode will be turned off automatically.',
        );
      }

      previousEditorModeRef.current = editorMode;
    }
  }, [editorMode]);

  // Screen-reader announcement functions.

  /**
   * Resets the screen reader annoncement, making it an empty string.
   */
  const resetScreenReaderAnnouncement = useCallback(
    () => setScreenReaderAnnouncement(''),
    [],
  );

  /**
   * Updates the screen reader announcement.
   */
  const updateScreenReaderAnnouncement = useCallback(
    (announcement: string) => setScreenReaderAnnouncement(announcement),
    [],
  );

  // General functions for manipulating sections' state.

  // FIXME (application-wide): when you add a bunch of sections, only the last one is announced, for some reason. Fix it. (Should be fixed already. Check.)
  // TODO: make it possible to add just one section by passing its ID as a sting.
  // ? Should I rename it to `activateSections`, since it **activates** sections?
  /**
   * Activates sections. In other words, adds them to the navbar and makes it
   * possible to enter the corresponding resume data.
   */
  const addSections = useCallback(
    (sectionIds: SectionId[]) => {
      const sectionIdsToAdd = getArrayWithoutDuplicates(sectionIds).filter(
        (sectionId) => !activeSectionIds.includes(sectionId),
      );

      const newActiveSectionIds = [...activeSectionIds, ...sectionIdsToAdd];
      setActiveSectionIds(newActiveSectionIds);
    },
    [activeSectionIds],
  );

  // TODO: make it possible to delete just one section by passing its ID as a single string.
  /**
   * Deletes sections from the navbar. If an undeletable section's ID is passed,
   * nothing is done with it.
   *
   * If the opened section is deleted, two outcomes are possible:
   *
   * - The deleted section is the last active section, and then the section
   * before it is opened automatically.
   * - Otherwise, the next section is opened.
   */
  const deleteSections = useCallback(
    (sectionIds: SectionId[]) => {
      const newActiveSectionIds = new Set(activeSectionIds);
      let wasOpenedSectionDeleted = false;

      sectionIds.forEach((sectionId) => {
        // TODO (application-wide): add an array/set of the IDs of sections that are undraggable and undeletable and in every such place like this check if the collection contains the ID instead of checking like `sectionId !== 'personal'`.
        /**
         * If the section ID isn't "personal" and is currently active, it's
         * corresponding section is eligible for deletion. Otherwise, no need
         * to do anything.
         */
        if (activeSectionIds.includes(sectionId) && sectionId !== 'personal') {
          newActiveSectionIds.delete(sectionId);

          // TODO: change it to be a more sophisticated logic. It should work similarly to how focus works when you delete an open section.
          // If an opened section is deleted, open Personal.
          if (openedSectionId === sectionId) {
            wasOpenedSectionDeleted = true;
          }
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
    },
    [activeSectionIds, openedSectionId],
  );

  /**
   * Deletes all sections except undeletable ones. Opens the Personal section
   * unless it's already opened.
   */
  const deleteAll = useCallback(() => {
    deleteSections(SECTION_IDS);
  }, [deleteSections]);

  /**
   * Opens the specified section.
   */
  const openSection = useCallback((sectionId: SectionId) => {
    setOpenedSectionId(sectionId);
  }, []);

  /**
   * Reorders active sections (which is visible in the navbar).
   */
  const reorderSections = useCallback(
    (newActiveSectionIds: SectionId[]) =>
      setActiveSectionIds(newActiveSectionIds),
    [],
  );

  // Navbar functions

  /**
   * Toggles the navbar's editor mode.
   */
  const toggleEditorMode = useCallback(() => {
    setEditorMode(!editorMode);
  }, [editorMode]);

  // TODO: check if there is a need in another screen reader announcement.
  /**
   * Toggles the navbar's visibility.
   */
  const toggleNavbar = useCallback(() => {
    setIsNavbarExpanded(!isNavbarExpanded);

    if (editorMode) setEditorMode(false);
  }, [editorMode, isNavbarExpanded]);

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
