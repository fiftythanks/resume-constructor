import React from 'react';

import Button from '@/components/Button';

import Project from './Project';

import addSrc from '@/assets/icons/add-black.svg';
import deleteSrc from '@/assets/icons/delete.svg';
import nextSrc from '@/assets/icons/next.svg';
import prevSrc from '@/assets/icons/prev.svg';

export default function Projects({
  className,
  data,
  functions,
  isNavbarExpanded = false,
  updateScreenReaderAnnouncement,
}) {
  const { shownProjectIndex } = data;

  function addProject() {
    functions.addProject();
    document.getElementById('project-name').focus();
  }

  function getProjectFunctions(index) {
    return {
      addBulletPoint() {
        functions.addBulletPoint(index);
      },

      deleteBulletPoint(itemIndex) {
        functions.deleteBulletPoint(index, itemIndex);
      },

      edit(field, value) {
        functions.editProject(index, field, value);
      },

      editBulletPoint(itemIndex, value) {
        functions.editBulletPoint(index, itemIndex, value);
      },

      updateBulletPoints(value) {
        functions.updateBulletPoints(index, value);
      },
    };
  }

  return (
    <main
      aria-labelledby="projects"
      aria-owns="app-layout-heading projects-tabpanel-form"
      className={`${className} section${isNavbarExpanded ? ` section__navbar-expanded` : ''}`}
      id="projects-tabpanel"
      role="tabpanel"
      tabIndex={-1}
    >
      <form
        action="#"
        className="section--form section--form__bullet-points"
        id="projects-tabpanel-form"
      >
        <header className="section--form-header">
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
              {shownProjectIndex !== data.projects.length - 1 && (
                <Button
                  aria-label="Show Next Project"
                  id="show-next-project"
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
          {/* TODO: redesign it or at least put it in some other place. It looks terrible. */}
          <Button
            aria-label={`Add Project ${data.projects.length}`}
            id="add-project"
            onClick={addProject}
            modifiers={[
              'Button_paddingBlock_none',
              'Button_paddingInline_small',
            ]}
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
    </main>
  );
}
