import { useRef } from 'react';
import type { RefObject } from 'react';

import useLastComponentBeforeTabpanel from '@/hooks/useLastComponentBeforeTabpanel';
import useResumeData from '@/hooks/useResumeData';

import SectionItemHeader from '@/components/SectionItemHeader';

import Job from './Job';

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
  const firstFormFieldRef = useRef<HTMLInputElement | null>(null);

  const {
    captureLastComponentBeforeTabpanel,
    focusLastComponentBeforeTabpanel,
  } = useLastComponentBeforeTabpanel('experience');

  const shownJobIndex = data.shownJobIndex;

  function addJob() {
    functions.addJob();

    if (firstFormFieldRef.current && firstFormFieldRef.current.isConnected) {
      firstFormFieldRef.current.focus();
    }
  }

  function deleteJob() {
    functions.deleteJob(shownJobIndex);
  }

  function showNextJob() {
    if (shownJobIndex < data.jobs.length - 1) {
      functions.showJob(shownJobIndex + 1);
    }
  }

  function showPreviousJob() {
    if (shownJobIndex > 0) {
      functions.showJob(shownJobIndex - 1);
    }
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
        <SectionItemHeader
          addItem={addJob}
          deleteItem={deleteJob}
          handleFocus={captureLastComponentBeforeTabpanel}
          handleKeyDown={focusLastComponentBeforeTabpanel}
          itemName="Job"
          itemNumber={shownJobIndex + 1}
          itemsNumber={data.jobs.length}
          showNextItem={showNextJob}
          showPreviousItem={showPreviousJob}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
        <Job
          data={data.jobs[shownJobIndex]}
          firstFormFieldRef={firstFormFieldRef}
          functions={getJobFunctions(shownJobIndex)}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
      </form>
    </section>
  );
}
