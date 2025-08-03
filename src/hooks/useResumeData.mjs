/* eslint-disable no-param-reassign */
import { useImmer } from 'use-immer';

// ? Put it to a separate file?
const initialResumeData = {
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
        id: crypto.randomUUID(),
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
        address: '',
        degree: '',
        graduation: '',
        id: crypto.randomUUID(),
        uni: '',
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
  // It should be certifications, skills and interests.
  // TODO (application-wide): refactor `Certifications` and this state.
  certifications: {
    certificates: '',
    skills: '',
    interests: '',
  },
};

// TODO: create a `clearAll` function.
export default function useResumeData() {
  const [resumeData, setResumeData] = useImmer(initialResumeData);

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
                address: '',
                degree: '',
                graduation: '',
                id: crypto.randomUUID(),
                uni: '',
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
                id: crypto.randomUUID(),
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
                id: crypto.randomUUID(),
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
                address: '',
                degree: '',
                graduation: '',
                id: crypto.randomUUID(),
                uni: '',
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

  // Functions for modifying resume data.
  // ? Should I put them inside one big object, e.g. `resumeDataHandlers`, where their names will be not `personalFunctions` etc. but just `personal`? Or should I even create a separate file for all these functions maybe?

  // ? (Application-wide): is putting `clear` and other functions inside objects and then passing them down as simply `skillsFunctions` etc. not very good? Should I instead export functions on their own from this hook and then pass them down on their own, for better readability?

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

  const educationFunctions = {
    editDegree(index, field, value) {
      setResumeData((draft) => {
        draft.education[index][field] = value;
      });
    },

    addDegree() {
      setResumeData((draft) => {
        draft.education.degrees.push({
          address: '',
          degree: '',
          graduation: '',
          id: crypto.randomUUID(),
          uni: '',
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
        draft.education.shownDegreeIndex = index;
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

  const projectFunctions = {
    editProject(index, field, value) {
      setResumeData((draft) => {
        draft.projects.projects[index][field] = value;
      });
    },

    addProject() {
      setResumeData((draft) => {
        draft.projects.projects.push({
          id: crypto.randomUUID(),
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

  return {
    certificationsFunctions,
    clear,
    educationFunctions,
    experienceFunctions,
    linksFunctions,
    personalFunctions,
    projectFunctions,
    resumeData,
    skillsFunctions,
  };
}
