import React from 'react';

import { ReadonlyDeep } from 'type-fest';

import useResumeData from '@/hooks/useResumeData';

import Button from '@/components/Button';

import Job from './Job';

import addSrc from '@/assets/icons/add-black.svg';
import deleteSrc from '@/assets/icons/delete.svg';
import nextSrc from '@/assets/icons/next.svg';
import prevSrc from '@/assets/icons/prev.svg';

import type { Experience, ItemWithId } from '@/types/resumeData';

export interface JobFunctions {
  addBulletPoint: () => void;
  deleteBulletPoint: (itemIndex: number) => void;

  edit: (
    field: 'address' | 'companyName' | 'duration' | 'jobTitle',
    value: string,
  ) => void;

  editBulletPoint: (itemIndex: number, value: string) => void;
  updateBulletPoints: (value: ItemWithId[]) => void;
}

export interface ExperienceProps {
  data: Experience;
  functions: ReturnType<typeof useResumeData>['experienceFunctions'];
  updateScreenReaderAnnouncement: (announcement: string) => void;
}

/**
 * The Work Experience section form.
 */
export default function Experience({
  data,
  functions,
  updateScreenReaderAnnouncement,
}: ReadonlyDeep<ExperienceProps>) {
  const { shownJobIndex } = data;

  function addJob() {
    functions.addJob();
    document.getElementById('company-name')!.focus();
  }

  function getJobFunctions(jobIndex: number): JobFunctions {
    return {
      addBulletPoint() {
        functions.addBulletPoint(jobIndex);
      },

      deleteBulletPoint(itemIndex) {
        functions.deleteBulletPoint(jobIndex, itemIndex);
      },

      edit(field, value) {
        functions.editJob(jobIndex, field, value);
      },

      editBulletPoint(itemIndex, value) {
        functions.editBulletPoint(jobIndex, itemIndex, value);
      },

      updateBulletPoints(value) {
        functions.updateBulletPoints(jobIndex, value);
      },
    };
  }

  return (
    <form
      action="#"
      aria-labelledby="experience"
      className="section section__bullet-points"
      id="experience-tabpanel"
      role="tabpanel"
    >
      <header className="section--header">
        <h2>Job {shownJobIndex + 1}</h2>
        {/* Conditional rendering to get rid of redundant flex gap. */}
        {shownJobIndex > 0 && (
          <div className="section--item-navigation">
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
              <img alt="Previous" height="25px" src={prevSrc} width="25px" />
            </Button>
          </div>
        )}
        {shownJobIndex !== data.jobs.length - 1 && (
          <div className="section--item-navigation">
            <Button
              aria-label="Show Next Job"
              id="show-next-job"
              onClick={() => functions.showJob(shownJobIndex + 1)}
              modifiers={[
                'Button_paddingBlock_none',
                'Button_paddingInline_small',
              ]}
            >
              <img alt="Previous" height="25px" src={nextSrc} width="25px" />
            </Button>
          </div>
        )}
        {/* TODO: redesign it or at least put it in some other place. It looks terrible. */}
        <Button
          aria-label={`Add Job ${data.jobs.length + 1}`}
          id="add-job"
          modifiers={['Button_paddingBlock_none', 'Button_paddingInline_small']}
          onClick={addJob}
        >
          <img alt="Add" height="25px" src={addSrc} width="25px" />
        </Button>
        {/* You can't delete the only job. There's always at least one job. */}
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
  );
}
