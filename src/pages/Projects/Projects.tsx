import React from 'react';
import type { RefObject } from 'react';

import useResumeData from '@/hooks/useResumeData';

import Button from '@/components/Button';

import Project from './Project';

import addSrc from '@/assets/icons/add-black.svg';
import deleteSrc from '@/assets/icons/delete.svg';
import nextSrc from '@/assets/icons/next.svg';
import prevSrc from '@/assets/icons/prev.svg';

import type { ReadonlyExcept } from '@/types/ReadonlyExcept';
import type { ItemWithId, Projects } from '@/types/resumeData';

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
  data: Projects;
  firstTabbable: RefObject<HTMLButtonElement | null>;
  functions: ReturnType<typeof useResumeData>['projectsFunctions'];
  updateScreenReaderAnnouncement: (announcement: string) => void;
}

/**
 * The Projects section form.
 */
export default function Projects({
  data,
  firstTabbable,
  functions,
  updateScreenReaderAnnouncement,
}: ReadonlyExcept<ProjectsProps, 'firstTabbable'>) {
  const shownProjectIndex = data.shownProjectIndex;

  function addProject() {
    functions.addProject();
    // TODO: use ref!
    document.getElementById('project-name')!.focus();
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
      role="tabpanel"
    >
      <form action="#" className="section--form section--form__bullet-points">
        {/* On smaller mobile screens, if you believe Chrome devtools, the header doesn't fit in one line and the design breaks. It needs to be tested on real devices because they probably display content differently from the devtools. But it will be possible only after I deploy the project. */}
        {/* TODO: test on real devices and check the problem after deploy. */}
        {/* TODO: refactor it somehow. It's such a shit semantically. A project should be a fieldset with a legend "Project [number]". In the current form, it's like the form itself should be labelled as "Project [number]", because it doesn't have anything but one project that isn't even grouped in any way. */}
        <header className="section--header">
          <h2>Project {shownProjectIndex + 1}</h2>
          {/* Conditional rendering to get rid of redundant flex gap. */}
          {(shownProjectIndex > 0 ||
            shownProjectIndex !== data.projects.length - 1) && (
            <div className="section--item-navigation">
              {shownProjectIndex > 0 && (
                <Button
                  aria-label="Show Previous Project"
                  className="section--item-navigation-button"
                  id="show-previous-project"
                  ref={firstTabbable}
                  onClick={() => functions.showProject(shownProjectIndex - 1)}
                  modifiers={[
                    'Button_paddingBlock_none',
                    'Button_paddingInline_small',
                  ]}
                >
                  <img
                    alt="Previous"
                    height="25px"
                    src={prevSrc}
                    width="25px"
                  />
                </Button>
              )}
              {/* Conditional rendering to get rid of redundant flex gap. */}
              {shownProjectIndex !== data.projects.length - 1 && (
                <Button
                  aria-label="Show Next Project"
                  id="show-next-project"
                  ref={shownProjectIndex === 0 ? firstTabbable : undefined}
                  // TODO: add screen reader announcement?
                  onClick={() => functions.showProject(shownProjectIndex + 1)}
                  modifiers={[
                    'Button_paddingBlock_none',
                    'Button_paddingInline_small',
                  ]}
                >
                  <img
                    alt="Previous"
                    height="25px"
                    src={nextSrc}
                    width="25px"
                  />
                </Button>
              )}
            </div>
          )}
          {/* TODO: redesign it or at least put it in some other place. It looks terrible. (Talking about the UI, not the code.) */}
          <Button
            aria-label={`Add Project ${data.projects.length + 1}`}
            id="add-project"
            ref={data.projects.length === 1 ? firstTabbable : undefined}
            // TODO: add screen reader announcement.
            onClick={addProject}
            modifiers={[
              'Button_paddingBlock_none',
              'Button_paddingInline_small',
            ]}
          >
            <img alt="Add" height="25px" src={addSrc} width="25px" />
          </Button>
          {/* You can't delete the only project. There's always at least one project. */}
          {data.projects.length > 1 && (
            <button
              aria-label={`Delete Project ${shownProjectIndex + 1}`}
              className="section--delete-item"
              id="delete-project"
              type="button"
              // TODO: add screen reader announcement.
              onClick={() => functions.deleteProject(shownProjectIndex)}
            >
              <img alt="Delete" height="25px" src={deleteSrc} width="25px" />
            </button>
          )}
        </header>
        <Project
          data={data.projects[shownProjectIndex]}
          functions={getProjectFunctions(shownProjectIndex)}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
      </form>
    </section>
  );
}
