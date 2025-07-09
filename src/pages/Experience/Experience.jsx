import React from 'react';

import Button from '@/components/Button';

import Job from './Job';

import addSrc from '@/assets/icons/add-black.svg';
import deleteSrc from '@/assets/icons/delete.svg';
import nextSrc from '@/assets/icons/next.svg';
import prevSrc from '@/assets/icons/prev.svg';

export default function Experience({
  className,
  data,
  functions,
  isNavbarExpanded = false,
  updateScreenReaderAnnouncement,
}) {
  const { shownJobIndex } = data;

  function addJob() {
    functions.addJob();
    document.getElementById('company-name').focus();
  }

  function getJobFunctions(index) {
    return {
      addBulletPoint() {
        functions.addBulletPoint(index);
      },

      deleteBulletPoint(itemIndex) {
        functions.deleteBulletPoint(index, itemIndex);
      },

      edit(field, value) {
        functions.editJob(index, field, value);
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
      aria-labelledby="experience"
      aria-owns="app-layout-heading experience-tabpanel-form"
      className={`${className} section${isNavbarExpanded ? ` section__navbar-expanded` : ''}`}
      id="experience-tabpanel"
      role="tabpanel"
      tabIndex={-1}
    >
      <form
        action="#"
        className="section--form section--form__bullet-points"
        id="experience-tabpanel-form"
      >
        <header className="section--form-header">
          <h2>Job {shownJobIndex + 1}</h2>
          {/* Conditional rendering to get rid of redundant flex gap. */}
          {(shownJobIndex > 0 || shownJobIndex !== data.jobs.length - 1) && (
            <div className="section--item-navigation">
              {shownJobIndex > 0 && (
                <Button
                  aria-label="Show Previous Job"
                  className="section--item-navigation-button"
                  id="show-previous-job"
                  onClick={() => functions.showJob(shownJobIndex - 1)}
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
              {shownJobIndex !== data.jobs.length - 1 && (
                <Button
                  aria-label="Show Next Job"
                  id="show-next-job"
                  onClick={() => functions.showJob(shownJobIndex + 1)}
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
            aria-label={`Add Job ${data.jobs.length}`}
            id="add-job"
            onClick={addJob}
            modifiers={[
              'Button_paddingBlock_none',
              'Button_paddingInline_small',
            ]}
          >
            <img alt="Add" height="25px" src={addSrc} width="25px" />
          </Button>
          {data.jobs.length > 1 && (
            <button
              aria-label={`Delete Job ${shownJobIndex + 1}`}
              className="section--delete-item"
              id="delete-job"
              type="button"
              onClick={() => functions.deleteJob(shownJobIndex)}
            >
              <img alt="Delete" height="25px" src={deleteSrc} width="25px" />
            </button>
          )}
        </header>
        <Job
          data={data.jobs[shownJobIndex]}
          functions={getJobFunctions(shownJobIndex)}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
      </form>
    </main>
  );
}
