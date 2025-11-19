/**
 * The rule didn't allow me to use `crypto`, but it's baseline available in
 * browsers so I don't have to worry about it.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import { useImmer } from 'use-immer';

import neverReached from '@/utils/neverReached';

import getDefaultData from './getDefaultData';

import type { ItemWithId, ResumeData, SectionId } from '@/types/resumeData';
import type { WritableDraft } from 'immer';
import type { ReadonlyDeep } from 'type-fest';

/**
 * Initialises and keeps all resume data in the form of a huge state object
 * `data`.
 */
export default function useResumeData() {
  const [data, setData] = useImmer(getDefaultData());

  // Its purpose is just to make `clear` shorter.
  function clearSection<K extends SectionId>(sectionId: K) {
    setData((draft) => {
      draft[sectionId] = getDefaultData(
        sectionId,
      ) as WritableDraft<ResumeData>[K];
    });
  }

  // Clears sections.
  function clear(sectionIds: ReadonlyDeep<SectionId | SectionId[]>) {
    // If it's a string, then it's just one ID.
    if (typeof sectionIds === 'string') {
      clearSection(sectionIds);
    } else if (Array.isArray(sectionIds)) {
      sectionIds.forEach((sectionId) => {
        clearSection(sectionId);
      });
    }
  }

  // ? It may be better to merge `clear` and `clearAll` together.
  function clearAll() {
    setData(getDefaultData());
  }

  // Functions for modifying resume data.

  type ItemType = 'degree' | 'job' | 'project';

  // Utility function for `deleteItem`.
  function getNumberOfItems(itemType: ItemType) {
    let numberOfItems: number;

    switch (itemType) {
      case 'degree': {
        numberOfItems = data.education.degrees.length;
        break;
      }

      case 'job': {
        numberOfItems = data.experience.jobs.length;
        break;
      }

      case 'project': {
        numberOfItems = data.projects.projects.length;
        break;
      }

      default: {
        neverReached(itemType);
      }
    }

    return numberOfItems;
  }

  // Utility function for `deleteItem`.
  function getNextShownIndex(
    currentIndex: number,
    deletedIndex: number,
    numberOfItems: number,
  ) {
    /**
     * If the shown item was after the one we deleted, its index just needs to
     * be decremented.
     */
    if (currentIndex > deletedIndex) {
      return currentIndex - 1;
    }

    // If the shown item was the one we deleted...
    if (currentIndex === deletedIndex) {
      // ...and it's the last index in the array, show the one before it.
      if (deletedIndex === numberOfItems - 1) {
        return deletedIndex - 1;
      }

      /**
       * ...otherwise, the "next" item has now shuffled into the current index.
       * So the next index is just the one we deleted.
       */
      return deletedIndex;
    }

    // Otherwise, the index doesn't need change.
    return currentIndex;
  }

  /**
   * Deletes degrees, jobs and projects in sections
   * "Education", "Experience" and "Projects".
   */
  function deleteItem(itemType: ItemType, index: number) {
    const numberOfItems = getNumberOfItems(itemType);

    if (numberOfItems >= 1 && index >= 0 && index < numberOfItems) {
      setData((draft) => {
        switch (itemType) {
          case 'degree': {
            draft.education.shownDegreeIndex = getNextShownIndex(
              draft.education.shownDegreeIndex,
              index,
              numberOfItems,
            );

            draft.education.degrees.splice(index, 1);

            break;
          }

          case 'job': {
            draft.experience.shownJobIndex = getNextShownIndex(
              draft.experience.shownJobIndex,
              index,
              numberOfItems,
            );

            draft.experience.jobs.splice(index, 1);

            break;
          }

          case 'project': {
            draft.projects.shownProjectIndex = getNextShownIndex(
              draft.projects.shownProjectIndex,
              index,
              numberOfItems,
            );

            draft.projects.projects.splice(index, 1);

            break;
          }

          default: {
            neverReached(itemType);
          }
        }
      });
    }
  }

  /**
   * Adds degrees, jobs and projects in sections "Education",
   * "Experience" and "Projects".
   */
  function addItem(itemType: ItemType) {
    switch (itemType) {
      case 'degree': {
        const newDegree = getDefaultData('education').degrees[0];

        setData((draft) => {
          draft.education.degrees.push(newDegree);

          // Show the degree that has just been added.
          draft.education.shownDegreeIndex = draft.education.degrees.length - 1;
        });

        break;
      }

      case 'job': {
        const newJob = getDefaultData('experience').jobs[0];

        setData((draft) => {
          draft.experience.jobs.push(newJob);

          // Show the job that has just been added.
          draft.experience.shownJobIndex = draft.experience.jobs.length - 1;
        });

        break;
      }

      case 'project': {
        const newProject = getDefaultData('projects').projects[0];

        setData((draft) => {
          draft.projects.projects.push(newProject);

          // Show the project that has just been added.
          draft.projects.shownProjectIndex = draft.projects.projects.length - 1;
        });

        break;
      }

      default: {
        neverReached(itemType);
      }
    }
  }

  /**
   * Changes the ID of the shown degree, job or project of sections "Education",
   * "Experience", "Projects".
   */
  function showItem(itemType: ItemType, newShownItemIndex: number) {
    if (newShownItemIndex >= 0) {
      switch (itemType) {
        case 'degree': {
          if (
            newShownItemIndex < data.education.degrees.length &&
            data.education.shownDegreeIndex !== newShownItemIndex
          ) {
            setData((draft) => {
              draft.education.shownDegreeIndex = newShownItemIndex;
            });
          }

          break;
        }

        case 'job': {
          if (
            newShownItemIndex < data.experience.jobs.length &&
            data.experience.shownJobIndex !== newShownItemIndex
          ) {
            setData((draft) => {
              draft.experience.shownJobIndex = newShownItemIndex;
            });
          }

          break;
        }

        case 'project': {
          if (
            newShownItemIndex < data.projects.projects.length &&
            data.projects.shownProjectIndex !== newShownItemIndex
          ) {
            setData((draft) => {
              draft.projects.shownProjectIndex = newShownItemIndex;
            });
          }

          break;
        }

        default: {
          neverReached(itemType);
        }
      }
    }
  }

  /**
   * Deletes bullet points from degrees, jobs and projects in sections
   * "Education", "Experience" and "Projects".
   */
  function deleteBulletPoint(
    itemType: ItemType,
    itemIndex: number,
    bulletIndex: number,
  ) {
    if (itemIndex >= 0 && bulletIndex >= 0) {
      switch (itemType) {
        case 'degree': {
          if (
            itemIndex < data.education.degrees.length &&
            bulletIndex < data.education.degrees[itemIndex].bulletPoints.length
          ) {
            setData((draft) => {
              draft.education.degrees[itemIndex].bulletPoints.splice(
                bulletIndex,
                1,
              );
            });
          }

          break;
        }

        case 'job': {
          if (
            itemIndex < data.experience.jobs.length &&
            bulletIndex < data.experience.jobs[itemIndex].bulletPoints.length
          ) {
            setData((draft) => {
              draft.experience.jobs[itemIndex].bulletPoints.splice(
                bulletIndex,
                1,
              );
            });
          }

          break;
        }

        case 'project': {
          if (
            itemIndex < data.projects.projects.length &&
            bulletIndex < data.projects.projects[itemIndex].bulletPoints.length
          ) {
            setData((draft) => {
              draft.projects.projects[itemIndex].bulletPoints.splice(
                bulletIndex,
                1,
              );
            });
          }

          break;
        }

        default: {
          neverReached(itemType);
        }
      }
    }
  }

  function getCleanBullet(): ItemWithId {
    return {
      id: crypto.randomUUID(),
      value: '',
    };
  }

  /**
   * Adds bullet points to degrees, jobs and projects in sections
   * "Education", "Experience" and "Projects".
   */
  function addBulletPoint(itemType: ItemType, itemIndex: number) {
    if (itemIndex >= 0) {
      switch (itemType) {
        case 'degree': {
          if (itemIndex < data.education.degrees.length) {
            setData((draft) => {
              draft.education.degrees[itemIndex].bulletPoints.push(
                getCleanBullet(),
              );
            });
          }

          break;
        }

        case 'job': {
          if (itemIndex < data.experience.jobs.length) {
            setData((draft) => {
              draft.experience.jobs[itemIndex].bulletPoints.push(
                getCleanBullet(),
              );
            });
          }

          break;
        }

        case 'project': {
          if (itemIndex < data.projects.projects.length) {
            setData((draft) => {
              draft.projects.projects[itemIndex].bulletPoints.push(
                getCleanBullet(),
              );
            });
          }

          break;
        }

        default: {
          neverReached(itemType);
        }
      }
    }
  }

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
  };

  const educationFunctions = {
    addDegree: () => addItem('degree'),
    deleteDegree: (index: number) => deleteItem('degree', index),

    editDegree(
      index: number,
      field: 'address' | 'degree' | 'graduation' | 'uni',
      value: string,
    ) {
      setData((draft) => {
        draft.education.degrees[index][field] = value;
      });
    },

    showDegree: (newShownDegreeIndex: number) =>
      showItem('degree', newShownDegreeIndex),

    // This function doesn't look good, but it is needed for dnd-kit's API.
    updateBulletPoints(degreeIndex: number, value: ReadonlyDeep<ItemWithId[]>) {
      if (degreeIndex >= 0 && degreeIndex < data.education.degrees.length) {
        const newBulletPoints = structuredClone(value) as WritableDraft<
          ItemWithId[]
        >;

        setData((draft) => {
          draft.education.degrees[degreeIndex].bulletPoints = newBulletPoints;
        });
      }
    },

    addBulletPoint: (degreeIndex: number) =>
      addBulletPoint('degree', degreeIndex),

    deleteBulletPoint: (degreeIndex: number, bulletIndex: number) =>
      deleteBulletPoint('degree', degreeIndex, bulletIndex),

    editBulletPoint(degreeIndex: number, itemIndex: number, value: string) {
      if (
        degreeIndex >= 0 &&
        degreeIndex < data.education.degrees.length &&
        itemIndex >= 0 &&
        itemIndex < data.education.degrees[degreeIndex].bulletPoints.length
      ) {
        setData((draft) => {
          draft.education.degrees[degreeIndex].bulletPoints[itemIndex].value =
            value;
        });
      }
    },
  };

  const experienceFunctions = {
    addJob: () => addItem('job'),
    deleteJob: (index: number) => deleteItem('job', index),
    showJob: (newShownJobIndex: number) => showItem('job', newShownJobIndex),
    addBulletPoint: (jobIndex: number) => addBulletPoint('job', jobIndex),

    editJob(
      index: number,
      field: 'address' | 'companyName' | 'duration' | 'jobTitle',
      value: string,
    ) {
      if (index >= 0 && index < data.experience.jobs.length) {
        setData((draft) => {
          draft.experience.jobs[index][field] = value;
        });
      }
    },

    // This function doesn't look good, but it is needed for dnd-kit's API.
    updateBulletPoints(jobIndex: number, value: ReadonlyDeep<ItemWithId[]>) {
      if (jobIndex >= 0 && jobIndex < data.experience.jobs.length) {
        const newBulletPoints = structuredClone(value) as WritableDraft<
          ItemWithId[]
        >;

        setData((draft) => {
          draft.experience.jobs[jobIndex].bulletPoints = newBulletPoints;
        });
      }
    },

    // TODO: so, itemIndex or bulletIndex?
    deleteBulletPoint: (jobIndex: number, bulletIndex: number) =>
      deleteBulletPoint('job', jobIndex, bulletIndex),

    editBulletPoint(jobIndex: number, itemIndex: number, value: string) {
      if (
        jobIndex >= 0 &&
        jobIndex < data.experience.jobs.length &&
        itemIndex >= 0 &&
        itemIndex < data.experience.jobs[jobIndex].bulletPoints.length
      ) {
        setData((draft) => {
          draft.experience.jobs[jobIndex].bulletPoints[itemIndex].value = value;
        });
      }
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
  };

  const projectsFunctions = {
    addProject: () => addItem('project'),
    deleteProject: (index: number) => deleteItem('project', index),

    editProjectLink(
      index: number,
      field: 'code' | 'demo',
      type: 'link' | 'text',
      value: string,
    ) {
      if (index >= 0 && index < data.projects.projects.length) {
        setData((draft) => {
          draft.projects.projects[index][field][type] = value;
        });
      }
    },

    editProjectText(
      index: number,
      field: 'projectName' | 'stack',
      value: string,
    ) {
      if (index >= 0 && index < data.projects.projects.length) {
        setData((draft) => {
          draft.projects.projects[index][field] = value;
        });
      }
    },

    showProject: (newShownProjectIndex: number) =>
      showItem('project', newShownProjectIndex),

    // This function doesn't look good, but it is needed for dnd-kit's API.
    updateBulletPoints(
      projectIndex: number,
      value: ReadonlyDeep<ItemWithId[]>,
    ) {
      if (projectIndex >= 0 && projectIndex < data.projects.projects.length) {
        setData((draft) => {
          const newBulletPoints = structuredClone(value) as WritableDraft<
            ItemWithId[]
          >;

          draft.projects.projects[projectIndex].bulletPoints = newBulletPoints;
        });
      }
    },

    addBulletPoint: (projectIndex: number) =>
      addBulletPoint('project', projectIndex),

    // FIXME: `bulletIndex` or `itemIndex`? Fix inconsistency.
    deleteBulletPoint: (projectIndex: number, bulletIndex: number) =>
      deleteBulletPoint('project', projectIndex, bulletIndex),

    editBulletPoint(projectIndex: number, itemIndex: number, value: string) {
      if (
        projectIndex >= 0 &&
        projectIndex < data.projects.projects.length &&
        itemIndex >= 0 &&
        itemIndex < data.projects.projects[projectIndex].bulletPoints.length
      ) {
        setData((draft) => {
          draft.projects.projects[projectIndex].bulletPoints[itemIndex].value =
            value;
        });
      }
    },
  };

  const skillsFunctions = {
    // TODO: The user shouldn't be concerned with adding IDs. They must be added automatically.
    updateSkills(
      field: 'frameworks' | 'languages' | 'tools',
      value: ReadonlyDeep<ItemWithId[]>,
    ) {
      const newFieldObject = structuredClone(value) as WritableDraft<
        ItemWithId[]
      >;

      setData((draft) => {
        draft.skills[field] = newFieldObject;
      });
    },

    addLanguage() {
      setData((draft) => {
        draft.skills.languages.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    deleteLanguage(languageIndex: number) {
      if (languageIndex >= 0 && languageIndex < data.skills.languages.length) {
        setData((draft) => {
          draft.skills.languages.splice(languageIndex, 1);
        });
      }
    },

    /**
     * To change it, you need to refactor `BulletPoints`, its `editItem`
     * function.
     */
    // TODO: refactor to update the value directly instead of updating the object that has both the value and the ID.
    editLanguage(languageIndex: number, value: string) {
      if (languageIndex >= 0 && languageIndex < data.skills.languages.length) {
        setData((draft) => {
          draft.skills.languages[languageIndex].value = value;
        });
      }
    },

    addFramework() {
      setData((draft) => {
        draft.skills.frameworks.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    deleteFramework(frameworkIndex: number) {
      if (
        frameworkIndex >= 0 &&
        frameworkIndex < data.skills.frameworks.length
      ) {
        setData((draft) => {
          draft.skills.frameworks.splice(frameworkIndex, 1);
        });
      }
    },

    /**
     * To change it, you need to refactor `BulletPoints`, its `editItem`
     * function.
     */
    // TODO: refactor to update value directly instead of the object that has both the value and the ID.
    editFramework(frameworkIndex: number, value: string) {
      if (
        frameworkIndex >= 0 &&
        frameworkIndex < data.skills.frameworks.length
      ) {
        setData((draft) => {
          draft.skills.frameworks[frameworkIndex].value = value;
        });
      }
    },

    addTool() {
      setData((draft) => {
        draft.skills.tools.push({
          id: crypto.randomUUID(),
          value: '',
        });
      });
    },

    deleteTool(toolIndex: number) {
      if (toolIndex >= 0 && toolIndex < data.skills.tools.length) {
        setData((draft) => {
          draft.skills.tools.splice(toolIndex, 1);
        });
      }
    },

    /**
     * To change it, you need to refactor `BulletPoints`, its `editItem`
     * function.
     */
    // TODO: refactor to update value directly instead of the object that has both the value and the ID.
    editTool(toolIndex: number, value: string) {
      if (toolIndex >= 0 && toolIndex < data.skills.tools.length) {
        setData((draft) => {
          draft.skills.tools[toolIndex].value = value;
        });
      }
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
    projectsFunctions,
    skillsFunctions,
  };
}
