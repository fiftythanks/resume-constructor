import { useCallback, useEffect, useRef, useState } from 'react';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import type { SectionId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

// TODO: split this hook into three separate hooks: `useUiState`, `useSectionsState` and `useScreenReaderAnnouncement`.
/**
 * `useAppState` currently violates the Single Responsibility Principle by
 * coupling three unrelated concerns:
 * 1. Document Section Topology: managing active sections, current tab and
 *    reordering logic (`sectionsState`).
 * 2. Navbar UI Interaction Mode: managing `editorMode`, which is purely a
 *    local concern of `Navbar.tsx` and does not affect the rest of the shell.
 * 3. Screen Reader Live Announcements: maintaining and clearing live messages.
 *
 * Because this hook is instantiated at the root in `App.tsx`, any change to
 * ephemeral navbar UI state forces a full re-render of `App`, `AppLayout`,
 * `Toolbar` and all active form tabpanels.
 */

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

  return input.map((sectionId) => sectionTitles[sectionId]).join(', ');
}

/**
 * A hook intended for generating and passing all necessary application state,
 * data and functions, such as what section is currently opened, is the navbar
 * expanded, all sections' IDs, functions to add or delete sections and more.
 */
export default function useAppState() {
  // TODO: There's no reason to keep the `editorMode` state so high! Put it into `AppLayout`.
  // TODO: rename `editorMode` to `isEditorModeOn` or something similar.
  const [editorMode, setEditorMode] = useState(false);

  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  // DILEMMA: Since `previousSectionsStateRef` uses sets, maybe this, original, state should do this as well? Or the opposite way.
  const [sectionsState, setSectionsState] = useState<SectionsState>({
    activeSectionIds: INITIAL_ACTIVE_SECTION_IDS,
    openedSectionId: 'personal',
  });

  const previousEditorModeRef = useRef(editorMode);

  // TODO: rename the properties to `activeSectionIds` and `openedSectionId`.
  const previousSectionsStateRef = useRef({
    previousActiveSectionIds: new Set(sectionsState.activeSectionIds),
    previousOpenedSectionId: sectionsState.openedSectionId,
  });

  // FIXME: eliminate `useEffect` state synchronisation and double-render cascades.
  /**
   * Violates 'eslint-plugin-react-you-might-not-need-an-effect'. Observing
   * `sectionsState` inside an effect to compute `screenReaderAnnouncement`
   * triggers an immediate secondary render pass across the entire tree whenever
   * a section is opened, added, deleted or reordered.
   *
   * Screen reader announcements are discrete, event-driven reactions. They
   * should be dispatched directly from user interaction callbacks
   * (`openSection`, `addSections`, `deleteSections` and `reorderSections`),
   * eliminating both the fragile mutable ref diffing (`previousSectionsStateRef`)
   * and the redundant render cascade.
   */
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
      screenReaderAnnouncement += ` Section ${sectionTitles[openedSectionId]} was opened.`;

      previousSectionsStateRef.current.previousOpenedSectionId =
        openedSectionId;
    }

    if (screenReaderAnnouncement !== '') {
      setScreenReaderAnnouncement(screenReaderAnnouncement.trimStart());
    }
  }, [sectionsState]);

  // Announce toggling the editor mode to screen readers.
  // FIXME: fix the issue with chaining state changes.
  /**
   * Refactor editor mode announcements out of `useEffect`. Tracking
   * `editorMode` transitions in an effect causes chained state transitions,
   * race conditions and potential announcement clobbering when combined with
   * section mutations. Announcements should be dispatched directly inside the
   * `toggleEditorMode` callback.
   */
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

  // FIXME: when you add a bunch of sections, only the last one is announced, for some reason. Fix it. (Should be fixed already. Check.)
  // TODO: make it possible to add just one section by passing its ID as a sting.
  // DILEMMA: Should I rename it to `activateSections`, since it **activates** sections?
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

  const addAllSections = useCallback(() => {
    const setOfActiveSectionIds = new Set(sectionsState.activeSectionIds);

    const inactiveSectionIds = possibleSectionIds.filter(
      (sectionId) => !setOfActiveSectionIds.has(sectionId),
    );

    addSections(inactiveSectionIds);
  }, [addSections, sectionsState.activeSectionIds]);

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

        // TODO: add an array/set of the IDs of sections that are undraggable and undeletable and in every such place like this check if the collection contains the ID instead of checking like `sectionId !== 'personal'`.
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
    deleteSections(possibleSectionIds);
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

  const { activeSectionIds, openedSectionId } = sectionsState;

  return {
    activeSectionIds,
    addAllSections,
    addSections,
    deleteAll,
    deleteSections,
    editorMode,
    openSection,
    openedSectionId,
    reorderSections,
    resetScreenReaderAnnouncement,
    screenReaderAnnouncement,
    toggleEditorMode,
    updateScreenReaderAnnouncement,
  };
}
