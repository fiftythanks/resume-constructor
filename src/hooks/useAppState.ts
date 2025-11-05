import { useCallback, useEffect, useRef, useState } from 'react';

import { ReadonlyDeep } from 'type-fest';

import type { SectionId, SectionIds, SectionTitles } from '@/types/resumeData';

// TODO: split this hook in three separate hooks: `useUiState` for navbar/editorMode state logic, `useSectionsState` for most of the logic here, and something like `useScreenReaderAnnouncement` for screen-reader logic.

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

interface SectionsState {
  activeSectionIds: SectionId[];
  openedSectionId: SectionId;
}

function getSectionTitlesString(
  sectionIds: ReadonlyDeep<SectionId[] | Set<SectionId>>,
) {
  const input = [...sectionIds];

  return input.map((sectionId) => SECTION_TITLES[sectionId]).join(', ');
}

/**
 * A hook intended for generating and passing all necessary application state,
 * data and functions, such as what section is currently opened, is the navbar
 * expanded, all sections' IDs, functions to add or delete sections and more.
 */
export default function useAppState() {
  // TODO: rename `editorMode` to `isEditorModeOn` or something similar.
  const [editorMode, setEditorMode] = useState(false);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  const [sectionsState, setSectionsState] = useState<SectionsState>({
    activeSectionIds: INITIAL_ACTIVE_SECTION_IDS,
    openedSectionId: 'personal',
  });

  const previousEditorModeRef = useRef(editorMode);

  const previousSectionsStateRef = useRef({
    previousActiveSectionIds: new Set(sectionsState.activeSectionIds),
    previousOpenedSectionId: sectionsState.openedSectionId,
  });

  // Announce manipulations with sections to screen readers.
  useEffect(() => {
    const { activeSectionIds, openedSectionId } = sectionsState;
    const { previousActiveSectionIds, previousOpenedSectionId } =
      previousSectionsStateRef.current;

    const setOfActiveSectionIds = new Set(activeSectionIds);

    const addedSectionIds = setOfActiveSectionIds.difference(
      previousActiveSectionIds,
    );

    const deletedSectionIds = previousActiveSectionIds.difference(
      setOfActiveSectionIds,
    );

    let screenReaderAnnouncement = '';

    // If sections are added.
    if (addedSectionIds.size > 0) {
      if (addedSectionIds.size === 1) {
        screenReaderAnnouncement = `Section ${getSectionTitlesString(addedSectionIds)} was added.`;
      } else if (addedSectionIds.size > 1) {
        screenReaderAnnouncement = `Sections ${getSectionTitlesString(addedSectionIds)} were added.`;
      }

      previousSectionsStateRef.current.previousActiveSectionIds = new Set(
        activeSectionIds,
      );
    }

    // If sections are deleted.
    if (deletedSectionIds.size > 0) {
      if (deletedSectionIds.size === 1) {
        screenReaderAnnouncement += ` Section ${getSectionTitlesString(deletedSectionIds)} was deleted.`;
      } else if (deletedSectionIds.size > 1) {
        screenReaderAnnouncement = ` Sections ${getSectionTitlesString(deletedSectionIds)} were deleted.`;
      }

      previousSectionsStateRef.current.previousActiveSectionIds = new Set(
        activeSectionIds,
      );
    }

    // If a new section is opened.
    if (previousOpenedSectionId !== openedSectionId) {
      screenReaderAnnouncement += ` Section ${SECTION_TITLES[openedSectionId]} was opened.`;

      previousSectionsStateRef.current.previousOpenedSectionId =
        openedSectionId;
    }

    if (screenReaderAnnouncement !== '') {
      setScreenReaderAnnouncement(screenReaderAnnouncement.trimStart());
    }
  }, [sectionsState]);

  // Announce toggling the editor mode to screen readers.
  // FIXME: fix the issue with chaining state changes.
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
  const addSections = useCallback((sectionIds: ReadonlyDeep<SectionId[]>) => {
    setSectionsState((currentState: ReadonlyDeep<SectionsState>) => {
      const { activeSectionIds } = currentState;
      const setOfActiveSectionIds = new Set(activeSectionIds);
      const uniqueSectionIds = [...new Set(sectionIds)];

      const sectionIdsToAdd = uniqueSectionIds.filter(
        (sectionId) => !setOfActiveSectionIds.has(sectionId),
      );

      const newActiveSectionIds = [...activeSectionIds, ...sectionIdsToAdd];

      return { ...currentState, activeSectionIds: newActiveSectionIds };
    });
  }, []);

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
    (sectionIds: ReadonlyDeep<SectionId[]>) => {
      setSectionsState((currentState: ReadonlyDeep<SectionsState>) => {
        const { activeSectionIds, openedSectionId } = currentState;
        const oldActiveSectionIds = new Set(activeSectionIds);

        const sectionIdsToDelete = new Set(sectionIds).intersection(
          oldActiveSectionIds,
        );

        // TODO (application-wide): add an array/set of the IDs of sections that are undraggable and undeletable and in every such place like this check if the collection contains the ID instead of checking like `sectionId !== 'personal'`.
        // The "Personal" section is undeletable.
        sectionIdsToDelete.delete('personal');

        const newActiveSectionIds =
          oldActiveSectionIds.difference(sectionIdsToDelete);

        // In case the opened section is deleted.
        let newOpenedSectionId: SectionId | undefined;

        if (sectionIdsToDelete.has(openedSectionId)) {
          const arrayOfSectionIdsToDelete = [...sectionIdsToDelete];

          const firstDeleletedSectionIndex = activeSectionIds.indexOf(
            arrayOfSectionIdsToDelete[0],
          );

          const lastDeletedSectionIndex =
            arrayOfSectionIdsToDelete.length === 1
              ? firstDeleletedSectionIndex
              : activeSectionIds.indexOf(arrayOfSectionIdsToDelete.at(-1)!);

          // If the last deleted section isn't the last active section.
          if (lastDeletedSectionIndex < activeSectionIds.length - 1) {
            newOpenedSectionId = activeSectionIds[lastDeletedSectionIndex + 1];
            // TODO: as soon as you add more undeletable arrays, change this condition.
            // If the first deleted section isn't "Personal"
          } else if (firstDeleletedSectionIndex !== 0) {
            newOpenedSectionId =
              activeSectionIds[firstDeleletedSectionIndex - 1];
          }
        }

        const newState = {
          activeSectionIds: [...newActiveSectionIds],
          openedSectionId:
            newOpenedSectionId === undefined
              ? openedSectionId
              : newOpenedSectionId,
        };

        return newState;
      });
    },
    [],
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
    setSectionsState((currentState: ReadonlyDeep<SectionsState>) => ({
      activeSectionIds: [...currentState.activeSectionIds],
      openedSectionId: sectionId,
    }));
  }, []);

  /**
   * Reorders active sections (which is visible in the navbar).
   */
  const reorderSections = useCallback(
    (newActiveSectionIds: ReadonlyDeep<SectionId[]>) =>
      setSectionsState((currentState: ReadonlyDeep<SectionsState>) => ({
        ...currentState,
        activeSectionIds: [...newActiveSectionIds],
      })),
    [],
  );

  // Navbar functions

  // Toggles the navbar's editor mode.
  const toggleEditorMode = useCallback(() => {
    setEditorMode((currentMode) => !currentMode);
  }, []);

  // TODO: check if there is a need in another screen reader announcement.
  // Toggles the navbar's visibility.
  const toggleNavbar = useCallback(() => {
    setIsNavbarExpanded((currentState) => !currentState);
    setEditorMode((isEditorModeOn) => isEditorModeOn && false);
  }, []);

  const { activeSectionIds, openedSectionId } = sectionsState;

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
    possibleSectionIds: SECTION_IDS,
  };
}
