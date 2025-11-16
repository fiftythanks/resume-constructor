import React from 'react';

import useResumeData from '@/hooks/useResumeData';

import Button from '@/components/Button';

import Project from './Project';

import addSrc from '@/assets/icons/add-black.svg';
import deleteSrc from '@/assets/icons/delete.svg';
import nextSrc from '@/assets/icons/next.svg';
import prevSrc from '@/assets/icons/prev.svg';

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
  data: Projects;
  functions: ReturnType<typeof useResumeData>['projectsFunctions'];
  updateScreenReaderAnnouncement: (announcement: string) => void;
}

export default function Projects({
  data,
  functions,
  updateScreenReaderAnnouncement,
}: ReadonlyDeep<ProjectsProps>) {
  const { shownProjectIndex } = data;

  function addProject() {
    functions.addProject();
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
    <form
      action="#"
      aria-labelledby="projects"
      className="section section__bullet-points"
      id="projects-tabpanel"
      role="tabpanel"
    >
      {/* On smaller mobile screens, if you believe Chrome devtools, the header doesn't fit in one line and the design breaks. It needs to be tested on real devices because they probably display content differently from the devtools. But it will be possible only after I deploy the project. */}
      {/* TODO: test on real devices and check the problem after deploy. */}
      <header className="section--header">
        <h2>Project {shownProjectIndex + 1}</h2>
        {/* Conditional rendering to get rid of redundant flex gap. */}
        {shownProjectIndex > 0 && (
          <div className="section--item-navigation">
            <Button
              aria-label="Show Previous Project"
              className="section--item-navigation-button"
              id="show-previous-project"
              onClick={() => functions.showProject(shownProjectIndex - 1)}
              modifiers={[
                'Button_paddingBlock_none',
                'Button_paddingInline_small',
              ]}
            >
              <img alt="Previous" height="25px" src={prevSrc} width="25px" />
            </Button>
          </div>
        )}
        {/* Conditional rendering to get rid of redundant flex gap. */}
        {shownProjectIndex !== data.projects.length - 1 && (
          <div className="section--item-navigation">
            <Button
              aria-label="Show Next Project"
              id="show-next-project"
              onClick={() => functions.showProject(shownProjectIndex + 1)}
              modifiers={[
                'Button_paddingBlock_none',
                'Button_paddingInline_small',
              ]}
            >
              <img alt="Previous" height="25px" src={nextSrc} width="25px" />
            </Button>
          </div>
        )}
        {/* TODO: redesign it or at least put it in some other place. It looks terrible. (Talking about the UI, not the code.) */}
        <Button
          aria-label={`Add Project ${data.projects.length + 1}`}
          id="add-project"
          modifiers={['Button_paddingBlock_none', 'Button_paddingInline_small']}
          onClick={addProject}
        >
          <img alt="Add" height="25px" src={addSrc} width="25px" />
        </Button>
        {data.projects.length > 1 && (
          <button
            aria-label={`Delete Project ${shownProjectIndex + 1}`}
            className="section--delete-item"
            id="delete-project"
            type="button"
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
  );
}
