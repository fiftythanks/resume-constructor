/* eslint-disable no-param-reassign */
import React, { useState } from 'react';

import { useImmer } from 'use-immer';

import Certifications from '@/pages/Certifications';
import Education from '@/pages/Education';
import Experience from '@/pages/Experience';
import Links from '@/pages/Links';
import Personal from '@/pages/Personal';
import Projects from '@/pages/Projects';
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
    experience: {
      jobs: [
        {
          address: '',
          companyName: '',
          duration: '',
          id: crypto.randomUUID(),
          jobTitle: '',
          bulletPoints: [
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
      ],
      shownJobIndex: 0,
    },
    projects: {
      projects: [
        {
          projectName: '',
          stack: '',
          bulletPoints: [
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
      shownProjectIndex: 0,
    },
    education: {
      degrees: [
        {
          uni: '',
          degree: '',
          graduation: '',
          address: '',
          bulletPoints: [
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
      ],
      shownDegreeIndex: 0,
    },
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
          draft.education = {
            degrees: [
              {
                uni: '',
                degree: '',
                graduation: '',
                address: '',
                bulletPoints: [
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
            ],
            shownDegreeIndex: 0,
          };
        });
        break;
      case 'experience':
        setResumeData((draft) => {
          draft.experience = {
            jobs: [
              {
                address: '',
                companyName: '',
                duration: '',
                id: crypto.randomUUID(),
                jobTitle: '',
                bulletPoints: [
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
            ],
            shownJobIndex: 0,
          };
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
          draft.projects = {
            projects: [
              {
                projectName: '',
                stack: '',
                bulletPoints: [
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
            shownProjectIndex: 0,
          };
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
          experience: {
            jobs: [
              {
                address: '',
                companyName: '',
                duration: '',
                id: crypto.randomUUID(),
                jobTitle: '',
                bulletPoints: [
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
            ],
            shownJobIndex: 0,
          },
          projects: {
            projects: [
              {
                projectName: '',
                stack: '',
                bulletPoints: [
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
            shownProjectIndex: 0,
          },
          education: {
            degrees: [
              {
                uni: '',
                degree: '',
                graduation: '',
                address: '',
                bulletPoints: [
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
            ],
            shownDegreeIndex: 0,
          },
          certifications: {
            certificates: '',
            skills: '',
            interests: '',
          },
        });
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
  const personalFunctions = {
    updatePersonal(field, value) {
      setResumeData((draft) => {
        draft.personal[field] = value;
      });
    },

    clear() {
      clear('personal');
    },
  };

  const linksFunctions = {
    updateLinks(field, type, value) {
      setResumeData((draft) => {
        draft.links[field][type] = value;
      });
    },

    clear() {
      clear('links');
    },
  };

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

  const experienceFunctions = {
    editJob(index, field, value) {
      setResumeData((draft) => {
        draft.experience.jobs[index][field] = value;
      });
    },

    addJob() {
      setResumeData((draft) => {
        draft.experience.jobs.push({
          address: '',
          companyName: '',
          duration: '',
          id: crypto.randomUUID(),
          jobTitle: '',
          bulletPoints: [
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
        });

        // Show the job that has just been added.
        draft.experience.shownJobIndex = draft.experience.jobs.length - 1;
      });
    },

    deleteJob(index) {
      setResumeData((draft) => {
        /**
         * If a job that was shown is deleted and there are other jobs,
         * the next job should be shown unless the deleted job was the
         * last job, in which case the previous job should be shown. If
         * there are no jobs left, then the `shownJobIndex` should become
         * `null`.
         */
        if (draft.experience.shownJobIndex === index) {
          if (
            index === draft.experience.jobs.length - 1 &&
            draft.experience.jobs.length > 1
          ) {
            draft.experience.shownJobIndex = index - 1;
          } else if (draft.experience.jobs.length > 1) {
            draft.experience.shownJobIndex = index + 1;
          } else if (draft.experience.jobs.length === 1) {
            draft.experience.shownJobIndex = null;
          }
        }

        draft.experience.jobs.splice(index, 1);

        if (draft.experience.shownJobIndex > index) {
          draft.experience.shownJobIndex -= 1;
        }
      });
    },

    showJob(index) {
      setResumeData((draft) => {
        draft.experience.shownJobIndex = index;
      });
    },

    updateBulletPoints(index, value) {
      setResumeData((draft) => {
        draft.experience.jobs[index].bulletPoints = value;
      });
    },

    addBulletPoint(index) {
      setResumeData((draft) => {
        draft.experience.jobs[index].bulletPoints.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    deleteBulletPoint(jobIndex, itemIndex) {
      setResumeData((draft) => {
        draft.experience.jobs[jobIndex].bulletPoints.splice(itemIndex, 1);
      });
    },

    editBulletPoint(jobIndex, itemIndex, value) {
      setResumeData((draft) => {
        draft.experience.jobs[jobIndex].bulletPoints[itemIndex] = value;
      });
    },

    clear() {
      clear('experience');
    },
  };

  const projectFunctions = {
    editProject(index, field, value) {
      setResumeData((draft) => {
        draft.projects.projects[index][field] = value;
      });
    },

    addProject() {
      setResumeData((draft) => {
        draft.projects.projects.push({
          projectName: '',
          stack: '',
          bulletPoints: [
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
          code: {
            text: '',
            link: '',
          },
          demo: {
            text: '',
            link: '',
          },
        });
        draft.projects.shownProjectIndex = draft.projects.projects.length - 1;
      });
    },

    deleteProject(index) {
      setResumeData((draft) => {
        /**
         * If a project that was shown is deleted and there are other projects,
         * the next project should be shown unless the deleted project was the
         * last project, in which case the previous project should be shown. If
         * there are no projects left, then the `shownProjectIndex` should become
         * `null`.
         */
        if (draft.projects.shownProjectIndex === index) {
          if (
            index === draft.projects.projects.length - 1 &&
            draft.projects.projects.length > 1
          ) {
            draft.projects.shownProjectIndex = index - 1;
          } else if (draft.projects.projects.length > 1) {
            draft.projects.shownProjectIndex = index + 1;
          } else if (draft.projects.projects.length === 1) {
            draft.projects.shownProjectIndex = null;
          }
        }

        draft.projects.projects.splice(index, 1);

        if (draft.projects.shownProjectIndex > index) {
          draft.projects.shownProjectIndex -= 1;
        }
      });
    },

    showProject(index) {
      setResumeData((draft) => {
        draft.projects.shownProjectIndex = index;
      });
    },

    updateBulletPoints(index, value) {
      setResumeData((draft) => {
        draft.projects.projects[index].bulletPoints = value;
      });
    },

    addBulletPoint(index) {
      setResumeData((draft) => {
        draft.projects.projects[index].bulletPoints.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    deleteBulletPoint(projectIndex, itemIndex) {
      setResumeData((draft) => {
        draft.projects.projects[projectIndex].bulletPoints.splice(itemIndex, 1);
      });
    },

    editBulletPoint(projectIndex, itemIndex, value) {
      setResumeData((draft) => {
        draft.projects.projects[projectIndex].bulletPoints[itemIndex] = value;
      });
    },

    clear() {
      clear('projects');
    },
  };

  const educationFunctions = {
    editDegree(index, field, value) {
      setResumeData((draft) => {
        draft.education[index][field] = value;
      });
    },

    addDegree() {
      setResumeData((draft) => {
        draft.education.degrees.push({
          uni: '',
          degree: '',
          graduation: '',
          address: '',
          bulletPoints: [
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
        });
        draft.education.shownDegreeIndex = draft.education.degrees.length - 1;
      });
    },

    deleteDegree(index) {
      setResumeData((draft) => {
        if (draft.education.shownDegreeIndex === index) {
          if (
            index === draft.education.degrees.length - 1 &&
            draft.education.degrees.length > 1
          ) {
            draft.education.shownDegreeIndex = index - 1;
          } else if (draft.education.degrees.length > 1) {
            draft.education.shownDegreeIndex = index + 1;
          } else if (draft.education.degrees.length === 1) {
            draft.education.shownDegreeIndex = null;
          }
        }

        draft.education.degrees.splice(index, 1);

        if (draft.education.shownDegreeIndex > index) {
          draft.education.shownDegreeIndex -= 1;
        }
      });
    },

    showDegree(index) {
      setResumeData((draft) => {
        draft.shownDegreeIndex = index;
      });
    },

    updateBulletPoints(index, value) {
      setResumeData((draft) => {
        draft.education.degrees[index].bulletPoints = value;
      });
    },

    addBulletPoint(index) {
      setResumeData((draft) => {
        draft.education.degrees[index].bulletPoints.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    deleteBulletPoint(degreeIndex, itemIndex) {
      setResumeData((draft) => {
        draft.education.degrees[degreeIndex].bulletPoints.splice(itemIndex, 1);
      });
    },

    editBulletPoint(degreeIndex, itemIndex, value) {
      setResumeData((draft) => {
        draft.education.degrees[degreeIndex].bulletPoints[itemIndex] = value;
      });
    },

    clear() {
      clear('education');
    },
  };

  const certificationsFunctions = {
    updateCertifications(field, value) {
      setResumeData((draft) => {
        draft.certifications[field] = value;
      });
    },

    clear() {
      clear('certifications');
    },
  };

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
        deleteSections={deleteSections}
        editorMode={editorMode}
        fillAll={fillAll}
        isNavbarExpanded={isNavbarExpanded}
        openedSectionID={openedSectionID}
        openSection={openSection}
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
