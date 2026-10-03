import type { RefObject } from 'react';

import useLastComponentBeforeTabpanel from '@/hooks/useLastComponentBeforeTabpanel';
import useResumeData from '@/hooks/useResumeData';

import SectionItemHeader from '@/components/SectionItemHeader';

import Project from './Project';

import type { ItemWithId, Projects } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

export interface ProjectFunctions {
  addBulletPoint: () => void;
  deleteBulletPoint: (itemIndex: number) => void;
  editBulletPoint: (itemIndex: number, value: string) => void;
  editLink: (
    field: 'code' | 'demo',
    type: 'link' | 'text',
    value: string,
  ) => void;
  editText: (field: 'projectName' | 'stack', value: string) => void;
  updateBulletPoints: (value: ItemWithId[]) => void;
}

export interface ProjectsProps {
  data: ReadonlyDeep<Projects>;
  functions: ReadonlyDeep<
    ReturnType<typeof useResumeData>['projectsFunctions']
  >;
  ref: RefObject<HTMLElement | null>;
  updateScreenReaderAnnouncement: ReadonlyDeep<(announcement: string) => void>;
}

/**
 * The Projects section form.
 */
export default function Projects({
  data,
  functions,
  ref,
  updateScreenReaderAnnouncement,
}: ProjectsProps) {
  const {
    captureLastComponentBeforeTabpanel,
    focusLastComponentBeforeTabpanel,
  } = useLastComponentBeforeTabpanel('projects');

  const shownProjectIndex = data.shownProjectIndex;

  function addProject() {
    functions.addProject();
    // FIXME: Replace raw `document.getElementById` lookup with React refs, and defer `.focus()` until after reconciliation while verifying `isConnected`.
    document.getElementById('project-name')?.focus();
  }

  function deleteProject() {
    functions.deleteProject(shownProjectIndex);
  }

  function showNextProject() {
    if (shownProjectIndex < data.projects.length - 1) {
      functions.showProject(shownProjectIndex + 1);
    }
  }

  function showPreviousProject() {
    if (shownProjectIndex > 0) {
      functions.showProject(shownProjectIndex - 1);
    }
  }

  function getProjectFunctions(projectIndex: number): ProjectFunctions {
    return {
      addBulletPoint() {
        functions.addBulletPoint(projectIndex);
      },
      deleteBulletPoint(itemIndex) {
        functions.deleteBulletPoint(projectIndex, itemIndex);
      },
      editBulletPoint(itemIndex, value) {
        functions.editBulletPoint(projectIndex, itemIndex, value);
      },
      editLink(field, type, value) {
        functions.editProjectLink(projectIndex, field, type, value);
      },
      editText(field, value) {
        functions.editProjectText(projectIndex, field, value);
      },
      updateBulletPoints(value) {
        functions.updateBulletPoints(projectIndex, value);
      },
    };
  }

  return (
    <section
      aria-labelledby="projects"
      className="section"
      id="projects-tabpanel"
      ref={ref}
      role="tabpanel"
    >
      <form action="#" className="section--form section--form__bullet-points">
        <SectionItemHeader
          addItem={addProject}
          deleteItem={deleteProject}
          handleFocus={captureLastComponentBeforeTabpanel}
          handleKeyDown={focusLastComponentBeforeTabpanel}
          itemName="Project"
          itemNumber={shownProjectIndex + 1}
          itemsNumber={data.projects.length}
          showNextItem={showNextProject}
          showPreviousItem={showPreviousProject}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
        <Project
          data={data.projects[shownProjectIndex]}
          functions={getProjectFunctions(shownProjectIndex)}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
      </form>
    </section>
  );
}
