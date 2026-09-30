import type { RefObject } from 'react';

import useLastComponentBeforeTabpanel from '@/hooks/useLastComponentBeforeTabpanel';
import useResumeData from '@/hooks/useResumeData';

import Button from '@/components/Button';

import Job from './Job';

import addSrc from '@/assets/icons/add-black.svg';
import deleteSrc from '@/assets/icons/delete.svg';
import nextSrc from '@/assets/icons/next.svg';
import prevSrc from '@/assets/icons/prev.svg';

import type { Experience, ItemWithId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

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
  data: ReadonlyDeep<Experience>;
  functions: ReadonlyDeep<
    ReturnType<typeof useResumeData>['experienceFunctions']
  >;
  ref: RefObject<HTMLElement | null>;
  updateScreenReaderAnnouncement: ReadonlyDeep<(announcement: string) => void>;
}

/**
 * The Work Experience section form.
 */
export default function Experience({
  data,
  functions,
  ref,
  updateScreenReaderAnnouncement,
}: ExperienceProps) {
  const { handleFocus, handleKeyboard } =
    useLastComponentBeforeTabpanel('experience');

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
    <section
      aria-labelledby="experience"
      className="section"
      id="experience-tabpanel"
      ref={ref}
      role="tabpanel"
    >
      <form action="#" className="section--form section--form__bullet-points">
        <header className="section--header">
          <h2>Job {shownJobIndex + 1}</h2>
          {/* FIXME: When you press "Show Previous/Next Job" or delete a job, the browser loses focus. */}
          {/* Conditional rendering to get rid of redundant flex gap. */}
          {(shownJobIndex > 0 || shownJobIndex !== data.jobs.length - 1) && (
            <div className="section--item-navigation">
              {shownJobIndex > 0 && (
                <Button
                  aria-label="Show Previous Job"
                  className="section--item-navigation-button"
                  id="show-previous-job"
                  onClick={() => functions.showJob(shownJobIndex - 1)}
                  onFocus={(e) => handleFocus(e)}
                  onKeyDown={(e) => handleKeyboard(e)}
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
                  onFocus={(e) => {
                    // Don't handle focus if it's not the first tabbable element.
                    if (shownJobIndex > 0) return;

                    handleFocus(e);
                  }}
                  onKeyDown={(e) => {
                    // Don't handle keydown if it's not the first tabbable element.
                    if (shownJobIndex > 0) return;

                    handleKeyboard(e);
                  }}
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
            aria-label={`Add Job ${data.jobs.length + 1}`}
            id="add-job"
            onClick={addJob}
            onFocus={(e) => {
              // Don't handle focus if it's not the first tabbable element.
              if (shownJobIndex > 0 || shownJobIndex !== data.jobs.length - 1) {
                return;
              }

              handleFocus(e);
            }}
            onKeyDown={(e) => {
              // Don't handle keydown if it's not the first tabbable element.
              if (shownJobIndex > 0 || shownJobIndex !== data.jobs.length - 1) {
                return;
              }

              handleKeyboard(e);
            }}
            modifiers={[
              'Button_paddingBlock_none',
              'Button_paddingInline_small',
            ]}
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
    </section>
  );
}
