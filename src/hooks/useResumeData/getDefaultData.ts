/**
 * The rule didn't allow me to use `crypto`, but it's baseline available in
 * browsers so I don't have to worry about it.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import { ResumeData, SectionId } from '@/types/resumeData';

const DUMMY_ID = crypto.randomUUID();

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
        id: DUMMY_ID,
        value: '',
      },
      {
        id: DUMMY_ID,
        value: '',
      },
      {
        id: DUMMY_ID,
        value: '',
      },
    ],
    frameworks: [
      {
        id: DUMMY_ID,
        value: '',
      },
      {
        id: DUMMY_ID,
        value: '',
      },
      {
        id: DUMMY_ID,
        value: '',
      },
    ],
    tools: [
      {
        id: DUMMY_ID,
        value: '',
      },
      {
        id: DUMMY_ID,
        value: '',
      },
      {
        id: DUMMY_ID,
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
        id: DUMMY_ID,
        jobTitle: '',
        bulletPoints: [
          {
            id: DUMMY_ID,
            value: '',
          },
          {
            id: DUMMY_ID,
            value: '',
          },
          {
            id: DUMMY_ID,
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
        id: DUMMY_ID,
        projectName: '',
        stack: '',
        bulletPoints: [
          {
            id: DUMMY_ID,
            value: '',
          },
          {
            id: DUMMY_ID,
            value: '',
          },
          {
            id: DUMMY_ID,
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
        id: DUMMY_ID,
        uni: '',
        bulletPoints: [
          {
            id: DUMMY_ID,
            value: '',
          },
          {
            id: DUMMY_ID,
            value: '',
          },
          {
            id: DUMMY_ID,
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

/**
 * This function is needed to make sure new IDs are created when we create new
 * data items.
 */
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

export default function getDefaultData(): ResumeData;
export default function getDefaultData<K extends SectionId>(
  sectionId: K,
): ResumeData[K];
export default function getDefaultData(
  sectionId?: SectionId,
): ResumeData | ResumeData[SectionId] {
  if (sectionId !== undefined) {
    return createNewIds(structuredClone(INITIAL_RESUME_DATA[sectionId]));
  }

  return createNewIds(structuredClone(INITIAL_RESUME_DATA));
}
