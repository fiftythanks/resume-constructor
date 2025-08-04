import { useState } from 'react';

import capitalize from '@/utils/capitalize';

// TODO: either pass it to `INITIAL_ACTIVE_SECTION_IDS` or merge them for now. What's the purpose of having two identical arrays that won't change?
//! Order matters.
const POSSIBLE_SECTION_IDS = Object.freeze([
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
]);

const FULL_SECTION_NAMES = Object.freeze({
  personal: 'Personal Details',
  links: 'Links',
  skills: 'Technical Skills',
  experience: 'Work Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications',
});

const INITIAL_ACTIVE_SECTION_IDS = Object.freeze([
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
]);

export default function useAppState() {
  const [editorMode, setEditorMode] = useState(false);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
  const [openedSectionID, setOpenedSectionID] = useState('personal');

  const [activeSectionIDs, setActiveSectionIDs] = useState(
    INITIAL_ACTIVE_SECTION_IDS,
  );

  const [screenReaderAnnouncement, setScreenReaderAnnouncement] =
    useState(null);

  // ====================================
  // Screen Reader Announcement Functions
  // ====================================

  function resetScreenReaderAnnouncement() {
    setScreenReaderAnnouncement(null);
  }

  function updateScreenReaderAnnouncement(announcement) {
    setScreenReaderAnnouncement(announcement);
  }

  // =======================================
  // General Functions for Handling Sections
  // =======================================

  // FIXME (application-wide): when you add a bunch of sections, only the last one is announced, for some reason. Fix it.
  function addSections(sectionIDs) {
    if (Array.isArray(sectionIDs)) {
      const newActiveSectionIDs = activeSectionIDs.slice();

      sectionIDs.forEach((sectionID) => {
        if (POSSIBLE_SECTION_IDS.includes(sectionID)) {
          if (!activeSectionIDs.includes(sectionID)) {
            newActiveSectionIDs.push(sectionID);
          }
        } else {
          throw new Error(
            'Incorrect section ID. Possible section IDs: personal, links, skills, experience, projects, education, certifications',
          );
        }
      });

      setActiveSectionIDs(newActiveSectionIDs);

      const areAllSectionsActive =
        newActiveSectionIDs.filter(
          (sectionID) => !POSSIBLE_SECTION_IDS.includes(sectionID),
        ).length === 0;

      if (areAllSectionsActive) {
        if (sectionIDs.length === 1) {
          setScreenReaderAnnouncement(
            `Section ${FULL_SECTION_NAMES[sectionIDs[0]]} was added.`,
          );
        } else {
          setScreenReaderAnnouncement(
            `Sections ${sectionIDs.map((sectionID) => FULL_SECTION_NAMES[sectionID]).join(', ')} added.`,
          );
        }
      }
    } else {
      throw new TypeError(
        'Incorrect argument! `addSections` only accepts arrays.',
      );
    }
  }

  function deleteSections(sectionIDs, clear) {
    if (Array.isArray(sectionIDs)) {
      const newActiveSectionIDs = activeSectionIDs.slice();
      let newScreenReaderAnnouncement = '';
      let wasOpenedSectionDeleted = false;

      sectionIDs.forEach((sectionID) => {
        if (POSSIBLE_SECTION_IDS.includes(sectionID)) {
          if (
            activeSectionIDs.includes(sectionID) &&
            sectionID !== 'personal'
          ) {
            newActiveSectionIDs.splice(
              newActiveSectionIDs.indexOf(sectionID),
              1,
            );

            if (typeof clear === 'function') clear(sectionID);

            // TODO (application-wide): this use of `capitalize` is dirty. Refactor. As well as in all other components that do this.
            newScreenReaderAnnouncement +=
              newScreenReaderAnnouncement === ''
                ? capitalize(sectionID)
                : `, ${sectionID}`;

            if (openedSectionID === sectionID) {
              setOpenedSectionID(null);
              wasOpenedSectionDeleted = true;
            }
          }
        } else {
          throw new Error(
            'Incorrect section ID. Available section IDs: personal, links, skills, experience, projects, education, certifications',
          );
        }
      });

      if (sectionIDs.includes(openedSectionID)) {
        const firstDeleletedSectionIndex = activeSectionIDs.indexOf(
          sectionIDs[0],
        );
        const lastDeleletedSectionIndex = activeSectionIDs.indexOf(
          sectionIDs.at(-1),
        );

        if (lastDeleletedSectionIndex < activeSectionIDs.length - 1) {
          setOpenedSectionID(activeSectionIDs[lastDeleletedSectionIndex + 1]);
        } else if (sectionIDs[0] !== 'personal') {
          setOpenedSectionID(activeSectionIDs[firstDeleletedSectionIndex - 1]);
        } else {
          setOpenedSectionID('personal');
        }
      }

      setActiveSectionIDs(newActiveSectionIDs);

      if (newScreenReaderAnnouncement !== '') {
        newScreenReaderAnnouncement += ' deleted.';

        if (wasOpenedSectionDeleted) {
          newScreenReaderAnnouncement +=
            ' Opened section deleted. No section is opened currently.';
        }

        setScreenReaderAnnouncement(newScreenReaderAnnouncement);
      }
    } else {
      throw new TypeError(
        'Incorrect argument! `deleteSections` accepts only arrays.',
      );
    }
  }

  function deleteAll(clear) {
    deleteSections(POSSIBLE_SECTION_IDS, clear);
  }

  // TODO: make the function real.
  function fillAll() {
    addSections(POSSIBLE_SECTION_IDS);
  }

  function openSection(sectionID) {
    setOpenedSectionID(sectionID);
    setScreenReaderAnnouncement(
      `Section ${FULL_SECTION_NAMES[sectionID]} was opened.`,
    );
  }

  function reorderSections(newActiveSectionIDs) {
    setActiveSectionIDs(newActiveSectionIDs);
  }

  // ================
  // Navbar Functions
  // ================

  function toggleEditorMode() {
    setEditorMode(!editorMode);

    if (editorMode) {
      setScreenReaderAnnouncement('Editor Mode off');
    } else {
      setScreenReaderAnnouncement(
        'Editor Mode on. To move focus to tabs for editing, press Tab while holding Shift. If you collapse the navbar either by pressing Escape or pressing the "Toggle Navbar" button, the editor mode will be turned off automatically.',
      );
    }
  }

  function toggleNavbar() {
    setIsNavbarExpanded(!isNavbarExpanded);

    if (editorMode) setEditorMode(false);
  }

  return {
    activeSectionIDs,
    addSections,
    deleteAll,
    deleteSections,
    editorMode,
    fillAll,
    isNavbarExpanded,
    openSection,
    openedSectionID,
    reorderSections,
    resetScreenReaderAnnouncement,
    screenReaderAnnouncement,
    toggleEditorMode,
    toggleNavbar,
    updateScreenReaderAnnouncement,
    possibleSectionIDs: POSSIBLE_SECTION_IDS,
  };
}
