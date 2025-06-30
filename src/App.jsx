/* eslint-disable no-param-reassign */
import React, { useState } from 'react';

import { useImmer } from 'use-immer';

import Links from '@/pages/Links';
import Personal from '@/pages/Personal';

import AppLayout from '@/components/AppLayout';

import capitalize from '@/utils/capitalize';

const possibleSectionIDs = [
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
];

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

  const [resumeData, setResumeData] = useImmer({
    personal: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
    },
    links: {
      website: {
        text: '',
        link: '',
      },
      github: {
        text: '',
        link: '',
      },
      linkedin: {
        text: '',
        link: '',
      },
      telegram: {
        text: '',
        link: '',
      },
    },
    skills: {
      languages: ['', '', ''],
      frameworks: ['', '', ''],
      tools: ['', '', ''],
    },
    experience: [
      {
        companyName: '',
        jobTitle: '',
        duration: '',
        address: '',
        bulletPoints: ['', '', ''],
      },
    ],
    projects: [
      {
        projectName: '',
        stack: '',
        bulletPoints: ['', '', ''],
        code: {
          text: '',
          link: '',
        },
        demo: {
          text: '',
          link: '',
        },
      },
    ],
    education: [
      {
        uni: '',
        degree: '',
        graduation: '',
        address: '',
        bulletPoints: ['', '', ''],
      },
    ],
    certifications: {
      certificates: '',
      skills: '',
      interests: '',
    },
  });

  function resetScreenReaderAnnouncement() {
    setScreenReaderAnnouncement(null);
  }

  function openSection(sectionID) {
    setOpenedSectionID(sectionID);
  }

  function reorderSections(newActiveSectionIDs) {
    setActiveSectionIDs(newActiveSectionIDs);
  }

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
          setScreenReaderAnnouncement(`${capitalize(sectionIDs[0])} added.`);
        } else {
          // The first item is omitted because its the "Personal" page.
          setScreenReaderAnnouncement(
            `${capitalize(sectionIDs[1])} ${sectionIDs.slice(2).join(', ')} added.`,
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

  function clearAll() {
    deleteSections(possibleSectionIDs);
  }

  function fillAll() {
    addSections(possibleSectionIDs);
  }

  function preview() {
    // do nothing
  }

  // Resume data updater functions.
  function updatePersonal(field, value) {
    setResumeData((draft) => {
      draft.personal[field] = value;
    });
  }

  function updateLinks(field, type, value) {
    setResumeData((draft) => {
      draft.links[field][type] = value;
    });
  }

  /* function updateSkills(field, value) {
    setResumeData((draft) => {
      draft.skills[field] = value;
    });
  }

  function updateExperience(index, field, value) {
    setResumeData((draft) => {
      draft.experience[index][field] = value;
    });
  }

  function updateProjects(index, field, value) {
    setResumeData((draft) => {
      draft.projects[index][field] = value;
    });
  }

  function updateEducation(index, field, value) {
    setResumeData((draft) => {
      draft.education[index][field] = value;
    });
  }

  function updateCertifications(field, value) {
    setResumeData((draft) => {
      draft.certifications[field] = value;
    });
  } */

  // Section components.
  const sections = {
    personal: (
      <Personal
        className="AppLayout-Main"
        data={resumeData.personal}
        isNavbarExpanded={isNavbarExpanded}
        updateData={updatePersonal}
      />
    ),
    links: (
      <Links
        className="AppLayout-Main"
        data={resumeData.links}
        isNavbarExpanded={isNavbarExpanded}
        updateData={updateLinks}
      />
    ),
    skills: <h2>Skills</h2>,
    experience: <h2>Work Experience</h2>,
    projects: <h2>Projects</h2>,
    education: <h2>Education</h2>,
    certifications: <h2>Certifications</h2>,
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
        deleteSections={deleteSections}
        editorMode={editorMode}
        fillAll={fillAll}
        isNavbarExpanded={isNavbarExpanded}
        openedSectionID={openedSectionID}
        possibleSectionIDs={possibleSectionIDs}
        preview={preview}
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
