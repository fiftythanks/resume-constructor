/**
 * The rule didn't allow me to use `crypto`, but it's baseline available in
 * browsers so I don't have to worry about it.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */
import { WritableDraft } from 'immer';
import { useImmer } from 'use-immer';

import { SectionId } from '@/types/resumeData';

// ? Put it to a separate file?
interface Personal {
  address: string;
  email: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  summary: string;
}

interface Link {
  link: string;
  text: string;
}

interface Links {
  github: Link;
  linkedin: Link;
  telegram: Link;
  website: Link;
}

interface ItemWithId {
  id: ReturnType<Crypto['randomUUID']>;
  value: string;
}

interface Skills {
  frameworks: ItemWithId[];
  languages: ItemWithId[];
  tools: ItemWithId[];
}

interface Job {
  address: string;
  bulletPoints: ItemWithId[];
  companyName: string;
  duration: string;
  id: ReturnType<Crypto['randomUUID']>;
  jobTitle: string;
}

interface Experience {
  jobs: Job[];
  // TODO: make it of type `number` as soon as you make it impossible to delete the only job.
  shownJobIndex: null | number;
}

interface Project {
  bulletPoints: ItemWithId[];
  code: Link;
  demo: Link;
  id: ReturnType<Crypto['randomUUID']>;
  projectName: string;
  stack: string;
}

interface Projects {
  projects: Project[];
  // TODO: make it of type `number` as soon as you make it impossible to delete the only job.
  shownProjectIndex: null | number;
}

interface Degree {
  address: string;
  bulletPoints: ItemWithId[];
  degree: string;
  graduation: string;
  id: ReturnType<Crypto['randomUUID']>;
  uni: string;
}

interface Education {
  degrees: Degree[];
  // TODO: make it of type `number` as soon as you make it impossible to delete the only job.
  shownDegreeIndex: null | number;
}

interface Certifications {
  certificates: string;
  interests: string;
  skills: string;
}

interface ResumeData {
  certifications: Certifications;
  education: Education;
  experience: Experience;
  links: Links;
  personal: Personal;
  projects: Projects;
  skills: Skills;
}

const INITIAL_RESUME_DATA: ResumeData = {
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// This function is needed to make sure new IDs are created when we clear data.
function createNewIds<T extends object | unknown[]>(target: T): T {
  if (Array.isArray(target)) {
    for (const elem of target) {
      if (Array.isArray(elem) || isObject(elem)) {
        createNewIds(elem);
      }
    }
  } else {
    if (isObject(target)) {
      for (const [key, value] of Object.entries(target)) {
        if (key === 'id') {
          target[key] = crypto.randomUUID();
        } else if (Array.isArray(value) || isObject(value)) {
          createNewIds(value);
        }
      }
    }
  }

  return target;
}

function getDefaultData(): ResumeData;
function getDefaultData(sectionId: SectionId): ResumeData[SectionId];
function getDefaultData(
  sectionId?: SectionId,
): ResumeData | ResumeData[SectionId] {
  if (sectionId !== undefined) {
    return createNewIds(structuredClone(INITIAL_RESUME_DATA[sectionId]));
  }

  return createNewIds(structuredClone(INITIAL_RESUME_DATA));
}

export default function useResumeData() {
  const [data, setData] = useImmer(INITIAL_RESUME_DATA);

  function clearSection<K extends SectionId>(sectionId: K) {
    setData((draft) => {
      draft[sectionId] = getDefaultData(
        sectionId,
      ) as WritableDraft<ResumeData>[K];
    });
  }

  function clear(sectionIDs: SectionId | SectionId[]) {
    // If it's a string, then it's just one ID.
    if (typeof sectionIDs === 'string') {
      clearSection(sectionIDs);
    } else if (Array.isArray(sectionIDs)) {
      sectionIDs.forEach((sectionID) => {
        clearSection(sectionID);
      });
    }
  }

  function clearAll() {
    clear([
      'personal',
      'links',
      'skills',
      'experience',
      'projects',
      'education',
      'certifications',
    ]);
  }

  // Functions for modifying resume data.
  // ? Should I put them inside one big object, e.g. `resumeDataHandlers`, where their names will be not `personalFunctions` etc. but just `personal`? Or should I even create a separate file for all these functions maybe?

  // ? (Application-wide): is putting `clear` and other functions inside objects and then passing them down as simply `skillsFunctions` etc. not very good? Should I instead export functions on their own from this hook and then pass them down on their own, for better readability?

  const certificationsFunctions = {
    updateCertifications(
      field: 'certificates' | 'interests' | 'skills',
      value: string,
    ) {
      setData((draft) => {
        draft.certifications[field] = value;
      });
    },

    clear() {
      clear('certifications');
    },
  };

  const educationFunctions = {
    editDegree(
      index: number,
      field: 'address' | 'degree' | 'graduation' | 'uni',
      value: string,
    ) {
      setData((draft) => {
        draft.education.degrees[index][field] = value;
      });
    },

    // TODO: make it shorter by using `structuredClone()`.
    addDegree() {
      setData((draft) => {
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

    deleteDegree(index: number) {
      setData((draft) => {
        // TODO: the last cloze is redundant if it's impossible to delete a degree when there aren't any more degrees. It should be like that. If it's like that, delete the last cloze. If it isn't, make it like that and delete the last cloze.
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

        if (
          // TODO: delete this condition when you make it impossible to delete the only degree.
          draft.education.shownDegreeIndex !== null &&
          draft.education.shownDegreeIndex > index
        ) {
          draft.education.shownDegreeIndex -= 1;
        }
      });
    },

    // TODO: add a check for the validity of the passed index.
    showDegree(index: number) {
      setData((draft) => {
        draft.education.shownDegreeIndex = index;
      });
    },

    // TODO: add a check for the validity of the passed index.
    // TODO: check if this function is used, refactor the places where it's used so they don't use it anymore, and delete the function. There shouldn't be such a function.
    updateBulletPoints(index: number, value: ItemWithId[]) {
      setData((draft) => {
        draft.education.degrees[index].bulletPoints = value;
      });
    },

    // TODO: add a check for the validity of the passed index.
    addBulletPoint(index: number) {
      setData((draft) => {
        draft.education.degrees[index].bulletPoints.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    // TODO: add a check for the validity of the passed indices.
    deleteBulletPoint(degreeIndex: number, itemIndex: number) {
      setData((draft) => {
        draft.education.degrees[degreeIndex].bulletPoints.splice(itemIndex, 1);
      });
    },

    // TODO: add a check for the validity of the passed index.
    // TODO: the ID should not be possible to update with this function. The only thing being changed with it should be the value of the bullet point. Refactor.
    editBulletPoint(degreeIndex: number, itemIndex: number, value: ItemWithId) {
      setData((draft) => {
        draft.education.degrees[degreeIndex].bulletPoints[itemIndex] = value;
      });
    },

    clear() {
      clear('education');
    },
  };

  const experienceFunctions = {
    editJob(
      index: number,
      field: 'address' | 'companyName' | 'jobTitle',
      value: string,
    ) {
      setData((draft) => {
        draft.experience.jobs[index][field] = value;
      });
    },

    // TODO: make it shorter by using `structuredClone()`.
    addJob() {
      setData((draft) => {
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

    deleteJob(index: number) {
      setData((draft) => {
        // TODO: the last cloze is redundant if it's impossible to delete a degree when there aren't any more degrees. It should be like that. If it's like that, delete the last cloze. If it isn't, make it like that and delete the last cloze.
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

        if (
          // TODO: delete this condition when you make it impossible to delete the only job.
          draft.experience.shownJobIndex !== null &&
          draft.experience.shownJobIndex > index
        ) {
          draft.experience.shownJobIndex -= 1;
        }
      });
    },

    // TODO: add a check for the validity of the passed index.
    showJob(index: number) {
      setData((draft) => {
        draft.experience.shownJobIndex = index;
      });
    },

    // TODO: add a check for the validity of the passed index.
    // TODO: check if this function is used, refactor the places where it's used so they don't use it anymore, and delete the function. There shouldn't be such a function.
    updateBulletPoints(index: number, value: ItemWithId[]) {
      setData((draft) => {
        draft.experience.jobs[index].bulletPoints = value;
      });
    },

    // TODO: add a check for the validity of the passed index.
    addBulletPoint(index: number) {
      setData((draft) => {
        draft.experience.jobs[index].bulletPoints.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    // TODO: add a check for the validity of the passed indices.
    deleteBulletPoint(jobIndex: number, itemIndex: number) {
      setData((draft) => {
        draft.experience.jobs[jobIndex].bulletPoints.splice(itemIndex, 1);
      });
    },

    // TODO: add a check for the validity of the passed index.
    // TODO: the ID should not be possible to update with this function. The only thing being changed with it should be the value of the bullet point. Refactor.
    editBulletPoint(jobIndex: number, itemIndex: number, value: ItemWithId) {
      setData((draft) => {
        draft.experience.jobs[jobIndex].bulletPoints[itemIndex] = value;
      });
    },

    clear() {
      clear('experience');
    },
  };

  const linksFunctions = {
    updateLinks(
      field: 'github' | 'linkedin' | 'telegram' | 'website',
      type: 'link' | 'text',
      value: string,
    ) {
      setData((draft) => {
        draft.links[field][type] = value;
      });
    },

    clear() {
      clear('links');
    },
  };

  const personalFunctions = {
    updatePersonal(
      field:
        | 'address'
        | 'email'
        | 'fullName'
        | 'jobTitle'
        | 'phone'
        | 'summary',
      value: string,
    ) {
      setData((draft) => {
        draft.personal[field] = value;
      });
    },

    clear() {
      clear('personal');
    },
  };

  const projectFunctions = {
    // TODO: add a check for the validity of the passed index.
    editProject<K extends Exclude<keyof Project, 'bulletPoints' | 'id'>>(
      index: number,
      field: K,
      value: Project[K],
    ) {
      setData((draft) => {
        draft.projects.projects[index][field] = value;
      });
    },

    addProject() {
      setData((draft) => {
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

    // TODO: add a check for the validity of the passed index.
    deleteProject(index: number) {
      setData((draft) => {
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

        if (
          // TODO: delete this condition when you make it impossible to delete the only project.
          draft.projects.shownProjectIndex !== null &&
          draft.projects.shownProjectIndex > index
        ) {
          draft.projects.shownProjectIndex -= 1;
        }
      });
    },

    // TODO: add a check for the validity of the passed index.
    showProject(index: number) {
      setData((draft) => {
        draft.projects.shownProjectIndex = index;
      });
    },

    // TODO: add a check for the validity of the passed index.
    // TODO: check if this function is used, refactor the places where it's used so they don't use it anymore, and delete the function. There shouldn't be such a function.
    updateBulletPoints(index: number, value: ItemWithId[]) {
      setData((draft) => {
        draft.projects.projects[index].bulletPoints = value;
      });
    },

    // TODO: add a check for the validity of the passed index.
    addBulletPoint(index: number) {
      setData((draft) => {
        draft.projects.projects[index].bulletPoints.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    // TODO: add a check for the validity of the passed indices.
    deleteBulletPoint(projectIndex: number, itemIndex: number) {
      setData((draft) => {
        draft.projects.projects[projectIndex].bulletPoints.splice(itemIndex, 1);
      });
    },

    // TODO: add a check for the validity of the passed indices.
    // TODO: the ID should not be possible to update with this function. The only thing being changed with it should be the value of the bullet point. Refactor.
    editBulletPoint(
      projectIndex: number,
      itemIndex: number,
      value: ItemWithId,
    ) {
      setData((draft) => {
        draft.projects.projects[projectIndex].bulletPoints[itemIndex] = value;
      });
    },

    clear() {
      clear('projects');
    },
  };

  const skillsFunctions = {
    updateSkills(
      field: 'frameworks' | 'languages' | 'tools',
      value: ItemWithId[],
    ) {
      setData((draft) => {
        draft.skills[field] = value;
      });
    },

    clear() {
      clear('skills');
    },

    addLanguage() {
      setData((draft) => {
        draft.skills.languages.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    // TODO: add a check for the validity of the passed index.
    deleteLanguage(index: number) {
      setData((draft) => {
        draft.skills.languages.splice(index, 1);
      });
    },

    // TODO: refactor to update value directly instead of the object that has both the value and the ID.
    // TODO: add a check for the validity of the passed index.
    editLanguage(index: number, value: ItemWithId) {
      setData((draft) => {
        draft.skills.languages[index] = value;
      });
    },

    addFramework() {
      setData((draft) => {
        draft.skills.frameworks.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    // TODO: add a check for the validity of the passed index.
    deleteFramework(index: number) {
      setData((draft) => {
        draft.skills.frameworks.splice(index, 1);
      });
    },

    // TODO: refactor to update value directly instead of the object that has both the value and the ID.
    // TODO: add a check for the validity of the passed index.
    editFramework(index: number, value: ItemWithId) {
      setData((draft) => {
        draft.skills.frameworks[index] = value;
      });
    },

    addTool() {
      setData((draft) => {
        draft.skills.tools.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    // TODO: add a check for the validity of the passed index.
    deleteTool(index: number) {
      setData((draft) => {
        draft.skills.tools.splice(index, 1);
      });
    },

    // TODO: refactor to update value directly instead of the object that has both the value and the ID.
    // TODO: add a check for the validity of the passed index.
    editTool(index: number, value: ItemWithId) {
      setData((draft) => {
        draft.skills.tools[index] = value;
      });
    },
  };

  return {
    certificationsFunctions,
    clear,
    clearAll,
    data,
    educationFunctions,
    experienceFunctions,
    linksFunctions,
    personalFunctions,
    projectFunctions,
    skillsFunctions,
  };
}
