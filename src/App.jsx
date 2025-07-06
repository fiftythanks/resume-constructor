/* eslint-disable no-param-reassign */
import React, { useState } from 'react';

import { useImmer } from 'use-immer';

import Links from '@/pages/Links';
import Personal from '@/pages/Personal';
import Skills from '@/pages/Skills';

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
  const [openedSectionID, setOpenedSectionID] = useState('skills');

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
      languages: [
        {
          id: crypto.randomUUID(),
          value: '',
        },
        {
          id: crypto.randomUUID(),
          value: '',
        },
        {
          id: crypto.randomUUID(),
          value: '',
        },
      ],
      frameworks: [
        {
          id: crypto.randomUUID(),
          value: '',
        },
        {
          id: crypto.randomUUID(),
          value: '',
        },
        {
          id: crypto.randomUUID(),
          value: '',
        },
      ],
      tools: [
        {
          id: crypto.randomUUID(),
          value: '',
        },
        {
          id: crypto.randomUUID(),
          value: '',
        },
        {
          id: crypto.randomUUID(),
          value: '',
        },
      ],
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

  // TODO: when you add a bunch of sections, only the last one is announced, for some reason. Fix it.
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

  function clear(sectionID) {
    switch (sectionID) {
      case 'certifications':
        setResumeData((draft) => {
          draft.certifications = {
            certificates: '',
            skills: '',
            interests: '',
          };
        });
        break;
      case 'education':
        setResumeData((draft) => {
          draft.education = [
            {
              uni: '',
              degree: '',
              graduation: '',
              address: '',
              bulletPoints: ['', '', ''],
            },
          ];
        });
        break;
      case 'experience':
        setResumeData((draft) => {
          draft.experience = [
            {
              companyName: '',
              jobTitle: '',
              duration: '',
              address: '',
              bulletPoints: ['', '', ''],
            },
          ];
        });
        break;
      case 'links':
        setResumeData((draft) => {
          draft.links = {
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
          };
        });
        break;
      case 'personal':
        setResumeData((draft) => {
          draft.personal = {
            fullName: '',
            jobTitle: '',
            email: '',
            phone: '',
            address: '',
            summary: '',
          };
        });
        break;
      case 'projects':
        setResumeData((draft) => {
          draft.projects = [
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
          ];
        });
        break;
      case 'skills':
        setResumeData((draft) => {
          draft.skills = {
            languages: [
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
            ],
            frameworks: [
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
            ],
            tools: [
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
            ],
          };
        });
        break;
      // Clears all sections' data
      default:
        setResumeData({
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
            languages: [
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
            ],
            frameworks: [
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
            ],
            tools: [
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
              {
                id: crypto.randomUUID(),
                value: '',
              },
            ],
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
    }
  }

  // TODO: when all deletable sections are deleted, the focus should move to the Add Section button instead of the Toggle Editor Mode button.
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

  function clearAll() {
    clear('personal');
    deleteSections(possibleSectionIDs);
  }

  function fillAll() {
    addSections(possibleSectionIDs);
  }

  function preview() {
    // do nothing
  }

  // Functions for modifying resume data.
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

  const skillsFunctions = {
    updateSkills(field, value) {
      setResumeData((draft) => {
        draft.skills[field] = value;
      });
    },

    clear() {
      clear('skills');
    },

    addLanguage() {
      setResumeData((draft) => {
        draft.skills.languages.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    deleteLanguage(index) {
      setResumeData((draft) => {
        draft.skills.languages.splice(index, 1);
      });
    },

    editLanguage(index, value) {
      setResumeData((draft) => {
        draft.skills.languages[index] = value;
      });
    },

    addFramework() {
      setResumeData((draft) => {
        draft.skills.frameworks.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    deleteFramework(index) {
      setResumeData((draft) => {
        draft.skills.frameworks.splice(index, 1);
      });
    },

    editFramework(index, value) {
      setResumeData((draft) => {
        draft.skills.frameworks[index] = value;
      });
    },

    addTool() {
      setResumeData((draft) => {
        draft.skills.tools.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    deleteTool(index) {
      setResumeData((draft) => {
        draft.skills.tools.splice(index, 1);
      });
    },

    editTool(index, value) {
      setResumeData((draft) => {
        draft.skills.tools[index] = value;
      });
    },
  };

  /* function updateExperience(index, field, value) {
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
    skills: (
      <Skills
        className="AppLayout-Main"
        data={resumeData.skills}
        functions={skillsFunctions}
        isNavbarExpanded={isNavbarExpanded}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
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
