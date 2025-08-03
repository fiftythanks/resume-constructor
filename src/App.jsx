/* eslint-disable no-param-reassign */
import React, { useState } from 'react';

import Certifications from '@/pages/Certifications';
import Education from '@/pages/Education';
import Experience from '@/pages/Experience';
import Links from '@/pages/Links';
import Personal from '@/pages/Personal';
import Projects from '@/pages/Projects';
import Skills from '@/pages/Skills';

import AppLayout from '@/components/AppLayout';

import capitalize from '@/utils/capitalize';

import useResumeData from './hooks/useResumeData';

// --------- Application-wide TODOs, FIXMEs and dilemmas ---------

// ? `modifiers[]` props aren't convenient. Should I make them simple strings?

/**
 * So that you don't lose everything when the browser crashes abruply or
 * something else happens. And simply because it's more user-friendly.
 */
// TODO (application-wide): add local storage use for the data.

// TODO (application-wide): change all compile-time constants' names to UPPER_SNAKE_CASE.

/**
 * The app needs a Russian version, since I will be using it for my job search.
 * There needs to be a toggle or something like that. Russian language needs a
 * different typeface, and the style of the resume should be a bit different, I
 * think.
 */
// TODO (application-wide): add Russian version.

/**
 * I've just stumbled upon one great article about accessibility,
 * https://blog.logrocket.com/ux-design/wcag-3-vs-2-ux/.
 * I should go through it thoroughly, as well as through all basic WCAG
 * guidelines, and see what I should change in the app to reasonably
 * improve accessibility.
 */
// TODO (application-wide): fix color contrasts with APCA (https://apcacontrast.com/).
// TODO (application-wide): go through the article and change whatever needs a change.

// ? Are tabpanels controlled by tabs valid when the tabs are hidden? Should I conditionalise related ARIA attributes?

// --------- Component-specific TODOs, FIXMEs and questions ---------

// TODO: modularise the component.

const possibleSectionIDs = [
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
];

const fullSectionNames = {
  personal: 'Personal Details',
  links: 'Links',
  skills: 'Technical Skills',
  experience: 'Work Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications',
};

export default function App() {
  const [screenReaderAnouncement, setScreenReaderAnnouncement] = useState(null);
  const [openedSectionID, setOpenedSectionID] = useState('personal');

  const [activeSectionIDs, setActiveSectionIDs] = useState([
    'personal',
    'links',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
  ]);

  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);

  /**
   * This state determines whether to allow DnD and to render delete buttons
   * with `NavItem`s or not.
   */
  const [editorMode, setEditorMode] = useState(false);

  const {
    certificationsFunctions,
    clear,
    educationFunctions,
    experienceFunctions,
    linksFunctions,
    personalFunctions,
    projectFunctions,
    resumeData,
    skillsFunctions,
  } = useResumeData();

  function resetScreenReaderAnnouncement() {
    setScreenReaderAnnouncement(null);
  }

  function updateScreenReaderAnnouncement(announcement) {
    setScreenReaderAnnouncement(announcement);
  }

  function openSection(sectionID) {
    setOpenedSectionID(sectionID);
    setScreenReaderAnnouncement(
      `Section ${fullSectionNames[sectionID]} was opened.`,
    );
  }

  function reorderSections(newActiveSectionIDs) {
    setActiveSectionIDs(newActiveSectionIDs);
  }

  // FIXME (application-wide): when you add a bunch of sections, only the last one is announced, for some reason. Fix it.
  function addSections(sectionIDs) {
    if (Array.isArray(sectionIDs)) {
      const newActiveSectionIDs = activeSectionIDs.slice();

      sectionIDs.forEach((sectionID) => {
        if (possibleSectionIDs.includes(sectionID)) {
          if (!activeSectionIDs.includes(sectionID)) {
            newActiveSectionIDs.push(sectionID);
          }
        } else {
          throw new Error(
            'Incorrect section ID. Available section IDs: personal, links, skills, experience, projects, education, certifications',
          );
        }
      });

      setActiveSectionIDs(newActiveSectionIDs);

      const areAllSectionsActive =
        newActiveSectionIDs.filter(
          (sectionID) => !possibleSectionIDs.includes(sectionID),
        ).length === 0;

      if (areAllSectionsActive) {
        if (sectionIDs.length === 1) {
          setScreenReaderAnnouncement(
            `Section ${fullSectionNames[sectionIDs[0]]} was added.`,
          );
        } else {
          setScreenReaderAnnouncement(
            `Sections ${sectionIDs.map((sectionID) => fullSectionNames[sectionID]).join(', ')} added.`,
          );
        }
      }
    } else {
      throw new TypeError(
        'Incorrect argument! `addSections` accepts only arrays.',
      );
    }
  }

  function deleteSections(sectionIDs) {
    if (Array.isArray(sectionIDs)) {
      const newActiveSectionIDs = activeSectionIDs.slice();
      let newScreenReaderAnnouncement = '';
      let wasOpenedSectionDeleted = false;

      sectionIDs.forEach((sectionID) => {
        if (possibleSectionIDs.includes(sectionID)) {
          if (
            activeSectionIDs.includes(sectionID) &&
            sectionID !== 'personal'
          ) {
            newActiveSectionIDs.splice(
              newActiveSectionIDs.indexOf(sectionID),
              1,
            );
            clear(sectionID);

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

  function toggleNavbar() {
    setIsNavbarExpanded(!isNavbarExpanded);

    if (editorMode) setEditorMode(false);
  }

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

  // It's not `clearAll`, it's `deleteAll`.
  // TODO: rename to `deleteAll`.
  function clearAll() {
    clear('personal');
    deleteSections(possibleSectionIDs);
  }

  // TODO: make the function real.
  function fillAll() {
    addSections(possibleSectionIDs);
  }

  // Section components.
  const sections = {
    personal: (
      <Personal data={resumeData.personal} functions={personalFunctions} />
    ),
    links: <Links data={resumeData.links} functions={linksFunctions} />,
    skills: (
      <Skills
        data={resumeData.skills}
        functions={skillsFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    experience: (
      <Experience
        data={resumeData.experience}
        functions={experienceFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    projects: (
      <Projects
        data={resumeData.projects}
        functions={projectFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    education: (
      <Education
        data={resumeData.education}
        functions={educationFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    certifications: (
      <Certifications
        data={resumeData.certifications}
        functions={certificationsFunctions}
      />
    ),
  };

  return (
    <>
      <span aria-live="polite" className="visually-hidden">
        {screenReaderAnouncement}
      </span>
      <AppLayout
        activeSectionIDs={activeSectionIDs}
        addSections={addSections}
        clearAll={clearAll}
        data={resumeData}
        deleteSections={deleteSections}
        editorMode={editorMode}
        fillAll={fillAll}
        isNavbarExpanded={isNavbarExpanded}
        openedSectionID={openedSectionID}
        openSection={openSection}
        possibleSectionIDs={possibleSectionIDs}
        reorderSections={reorderSections}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
        selectSection={openSection}
        toggleEditorMode={toggleEditorMode}
        toggleNavbar={toggleNavbar}
      >
        {sections[openedSectionID]}
      </AppLayout>
    </>
  );
}
