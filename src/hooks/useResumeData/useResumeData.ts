/**
 * The rule didn't allow me to use `crypto`, but it's baseline available in
 * browsers so I don't have to worry about it.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import { WritableDraft } from 'immer';
import { useImmer } from 'use-immer';

import neverReached from '@/utils/neverReached';

import getDefaultData from './getDefaultData';

import { ItemWithId, Project, ResumeData, SectionId } from '@/types/resumeData';

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
  function clear(sectionIds: SectionId | SectionId[]) {
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
   * This function deletes degrees, jobs and projects in sections
   * "Education", "Experience" and "Projects".
   */
  function deleteItem(itemType: ItemType, index: number) {
    const numberOfItems = getNumberOfItems(itemType);

    if (numberOfItems > 1 && index >= 0 && index < numberOfItems) {
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

    addDegree() {
      function getDegree() {
        return getDefaultData('education').degrees[0];
      }

      setData((draft) => {
        draft.education.degrees.push(getDegree());
        draft.education.shownDegreeIndex = draft.education.degrees.length - 1;
      });
    },

    deleteDegree: (index: number) => deleteItem('degree', index),

    showDegree(index: number) {
      if (
        index >= 0 &&
        index < data.education.degrees.length &&
        data.education.shownDegreeIndex !== index
      ) {
        setData((draft) => {
          draft.education.shownDegreeIndex = index;
        });
      }
    },

    // This function doesn't look good, but it is needed for dnd-kit's API.
    updateBulletPoints(degreeIndex: number, value: ItemWithId[]) {
      if (degreeIndex >= 0 && degreeIndex < data.education.degrees.length) {
        setData((draft) => {
          draft.education.degrees[degreeIndex].bulletPoints = value;
        });
      }
    },

    addBulletPoint(degreeIndex: number) {
      if (degreeIndex >= 0 && degreeIndex < data.education.degrees.length) {
        setData((draft) => {
          draft.education.degrees[degreeIndex].bulletPoints.push({
            id: crypto.randomUUID(),
            value: '',
          });
        });
      }
    },

    deleteBulletPoint(degreeIndex: number, itemIndex: number) {
      if (
        degreeIndex >= 0 &&
        degreeIndex < data.education.degrees.length &&
        itemIndex >= 0 &&
        itemIndex < data.education.degrees[degreeIndex].bulletPoints.length
      ) {
        setData((draft) => {
          draft.education.degrees[degreeIndex].bulletPoints.splice(
            itemIndex,
            1,
          );
        });
      }
    },

    /**
     * To change it, you need to refactor `BulletPoints`, its `editItem`
     * function.
     */
    // TODO: the ID should not be possible to update with this function. The only thing being changed with it should be the value of the bullet point. Refactor.
    editBulletPoint(degreeIndex: number, itemIndex: number, value: ItemWithId) {
      if (
        degreeIndex >= 0 &&
        degreeIndex < data.education.degrees.length &&
        itemIndex >= 0 &&
        itemIndex < data.education.degrees[degreeIndex].bulletPoints.length
      ) {
        setData((draft) => {
          draft.education.degrees[degreeIndex].bulletPoints[itemIndex] = value;
        });
      }
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
      if (index >= 0 && index < data.experience.jobs.length) {
        setData((draft) => {
          draft.experience.jobs[index][field] = value;
        });
      }
    },

    addJob() {
      function getJob() {
        return getDefaultData('experience').jobs[0];
      }

      setData((draft) => {
        draft.experience.jobs.push(getJob());

        // Show the job that has just been added.
        draft.experience.shownJobIndex = draft.experience.jobs.length - 1;
      });
    },

    deleteJob: (index: number) => deleteItem('job', index),

    showJob(index: number) {
      if (index >= 0 && index < data.experience.jobs.length) {
        setData((draft) => {
          draft.experience.shownJobIndex = index;
        });
      }
    },

    // This function doesn't look good, but it is needed for dnd-kit's API.
    updateBulletPoints(jobIndex: number, value: ItemWithId[]) {
      if (jobIndex >= 0 && jobIndex < data.experience.jobs.length) {
        setData((draft) => {
          draft.experience.jobs[jobIndex].bulletPoints = value;
        });
      }
    },

    addBulletPoint(jobIndex: number) {
      // TODO: make all these boilerplate validations a utility function to prettify the code.
      if (jobIndex >= 0 && jobIndex < data.experience.jobs.length) {
        setData((draft) => {
          draft.experience.jobs[jobIndex].bulletPoints.push({
            id: crypto.randomUUID(),
            value: '',
          });
        });
      }
    },

    deleteBulletPoint(jobIndex: number, itemIndex: number) {
      if (
        jobIndex >= 0 &&
        jobIndex < data.experience.jobs.length &&
        itemIndex >= 0 &&
        itemIndex < data.experience.jobs[jobIndex].bulletPoints.length
      ) {
        setData((draft) => {
          draft.experience.jobs[jobIndex].bulletPoints.splice(itemIndex, 1);
        });
      }
    },

    /**
     * To change it, you need to refactor `BulletPoints`, i.e. its `editItem`
     * function.
     */
    // TODO: the ID should not be possible to update with this function. The only thing being changed with it should be the value of the bullet point. Refactor.
    editBulletPoint(jobIndex: number, itemIndex: number, value: ItemWithId) {
      if (
        jobIndex >= 0 &&
        jobIndex < data.experience.jobs.length &&
        itemIndex >= 0 &&
        itemIndex < data.experience.jobs[jobIndex].bulletPoints.length
      ) {
        setData((draft) => {
          draft.experience.jobs[jobIndex].bulletPoints[itemIndex] = value;
        });
      }
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
    editProject<K extends Exclude<keyof Project, 'bulletPoints' | 'id'>>(
      index: number,
      field: K,
      value: Project[K],
    ) {
      if (index >= 0 && index < data.projects.projects.length) {
        setData((draft) => {
          draft.projects.projects[index][field] = value;
        });
      }
    },

    addProject() {
      function getProject() {
        return getDefaultData('projects').projects[0];
      }

      setData((draft) => {
        draft.projects.projects.push(getProject());
        draft.projects.shownProjectIndex = draft.projects.projects.length - 1;
      });
    },

    deleteProject: (index: number) => deleteItem('project', index),

    showProject(index: number) {
      if (index >= 0 && index < data.projects.projects.length) {
        setData((draft) => {
          draft.projects.shownProjectIndex = index;
        });
      }
    },

    // This function doesn't look good, but it is needed for dnd-kit's API.
    updateBulletPoints(projectIndex: number, value: ItemWithId[]) {
      if (projectIndex >= 0 && projectIndex < data.projects.projects.length) {
        setData((draft) => {
          draft.projects.projects[projectIndex].bulletPoints = value;
        });
      }
    },

    addBulletPoint(projectIndex: number) {
      if (projectIndex >= 0 && projectIndex < data.projects.projects.length) {
        setData((draft) => {
          draft.projects.projects[projectIndex].bulletPoints.push({
            id: crypto.randomUUID(),
            value: '',
          });
        });
      }
    },

    deleteBulletPoint(projectIndex: number, itemIndex: number) {
      if (
        projectIndex >= 0 &&
        projectIndex < data.projects.projects.length &&
        itemIndex >= 0 &&
        itemIndex < data.projects.projects[projectIndex].bulletPoints.length
      ) {
        setData((draft) => {
          draft.projects.projects[projectIndex].bulletPoints.splice(
            itemIndex,
            1,
          );
        });
      }
    },

    /**
     * To change it, you need to refactor `BulletPoints`, its `editItem`
     * function.
     */
    // TODO: the ID should not be possible to update with this function. The only thing being changed with it should be the value of the bullet point. Refactor.
    editBulletPoint(
      projectIndex: number,
      itemIndex: number,
      value: ItemWithId,
    ) {
      if (
        projectIndex >= 0 &&
        projectIndex < data.projects.projects.length &&
        itemIndex >= 0 &&
        itemIndex < data.projects.projects[projectIndex].bulletPoints.length
      ) {
        setData((draft) => {
          draft.projects.projects[projectIndex].bulletPoints[itemIndex] = value;
        });
      }
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

    deleteLanguage(langIndex: number) {
      if (langIndex >= 0 && langIndex < data.skills.languages.length) {
        setData((draft) => {
          draft.skills.languages.splice(langIndex, 1);
        });
      }
    },

    /**
     * To change it, you need to refactor `BulletPoints`, its `editItem`
     * function.
     */
    // TODO: refactor to update the value directly instead of updating the object that has both the value and the ID.
    editLanguage(langIndex: number, value: ItemWithId) {
      if (langIndex >= 0 && langIndex < data.skills.languages.length) {
        setData((draft) => {
          draft.skills.languages[langIndex] = value;
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

    deleteFramework(fmwkIndex: number) {
      if (fmwkIndex >= 0 && fmwkIndex < data.skills.frameworks.length) {
        setData((draft) => {
          draft.skills.frameworks.splice(fmwkIndex, 1);
        });
      }
    },

    /**
     * To change it, you need to refactor `BulletPoints`, its `editItem`
     * function.
     */
    // TODO: refactor to update value directly instead of the object that has both the value and the ID.
    editFramework(fmwkIndex: number, value: ItemWithId) {
      if (fmwkIndex >= 0 && fmwkIndex < data.skills.frameworks.length) {
        setData((draft) => {
          draft.skills.frameworks[fmwkIndex] = value;
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
    editTool(toolIndex: number, value: ItemWithId) {
      if (toolIndex >= 0 && toolIndex < data.skills.tools.length) {
        setData((draft) => {
          draft.skills.tools[toolIndex] = value;
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
    projectFunctions,
    skillsFunctions,
  };
}
