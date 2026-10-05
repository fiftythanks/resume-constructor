import { useRef } from 'react';
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
  const firstFormFieldRef = useRef<HTMLInputElement | null>(null);

  const {
    captureLastComponentBeforeTabpanel,
    focusLastComponentBeforeTabpanel,
  } = useLastComponentBeforeTabpanel('projects');

  const shownProjectIndex = data.shownProjectIndex;

  function addProject() {
    functions.addProject();

    if (firstFormFieldRef.current && firstFormFieldRef.current.isConnected) {
      firstFormFieldRef.current.focus();
    }
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
        {/* On smaller mobile screens, if you believe Chrome devtools, the header doesn't fit in one line and the design breaks. It needs to be tested on real devices because they probably display content differently from the devtools. But it will be possible only after I deploy the project. */}
        {/* TODO: test on real devices and check the problem after deploy. */}
        {/* TODO: refactor it somehow. It's such a shit semantically. A project should be a fieldset with a legend "Project [number]". In the current form, it's like the form itself should be labelled as "Project [number]", because it doesn't have anything but one project that isn't even grouped in any way. */}
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
          firstFormFieldRef={firstFormFieldRef}
          functions={getProjectFunctions(shownProjectIndex)}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
      </form>
    </section>
  );
}
