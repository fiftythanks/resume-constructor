import type { RefObject } from 'react';

import useLastComponentBeforeTabpanel from '@/hooks/useLastComponentBeforeTabpanel';
import useResumeData from '@/hooks/useResumeData';

import SectionItemHeader from '@/components/SectionItemHeader';

import Degree from './Degree';

import type { Education, ItemWithId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

export interface DegreeFunctions {
  addBulletPoint: () => void;
  deleteBulletPoint: (itemIndex: number) => void;
  edit: (
    field: 'address' | 'degree' | 'graduation' | 'uni',
    value: string,
  ) => void;
  editBulletPoint: (itemIndex: number, value: string) => void;
  updateBulletPoints: (value: ItemWithId[]) => void;
}

export interface EducationProps {
  data: ReadonlyDeep<Education>;
  functions: ReadonlyDeep<
    ReturnType<typeof useResumeData>['educationFunctions']
  >;
  ref: RefObject<HTMLElement | null>;
  updateScreenReaderAnnouncement: ReadonlyDeep<(announcement: string) => void>;
}

/**
 * The Education section form.
 */
export default function Education({
  data,
  functions,
  ref,
  updateScreenReaderAnnouncement,
}: EducationProps) {
  const {
    captureLastComponentBeforeTabpanel: handleFocus,
    focusLastComponentBeforeTabpanel: handleKeyboard,
  } = useLastComponentBeforeTabpanel('education');

  const shownDegreeIndex = data.shownDegreeIndex;

  function addDegree() {
    functions.addDegree();
    // FIXME: Replace raw `document.getElementById` lookup with React refs, and defer `.focus()` until after reconciliation while verifying `isConnected`.
    document.getElementById('university-name')?.focus();
  }

  function deleteDegree() {
    functions.deleteDegree(shownDegreeIndex);
  }

  function showNextDegree() {
    if (shownDegreeIndex < data.degrees.length - 1) {
      functions.showDegree(shownDegreeIndex + 1);
    }
  }

  function showPreviousDegree() {
    if (shownDegreeIndex > 0) {
      functions.showDegree(shownDegreeIndex - 1);
    }
  }

  function getDegreeFunctions(degreeIndex: number): DegreeFunctions {
    return {
      addBulletPoint() {
        functions.addBulletPoint(degreeIndex);
      },
      deleteBulletPoint(itemIndex) {
        functions.deleteBulletPoint(degreeIndex, itemIndex);
      },
      edit(field, value) {
        functions.editDegree(degreeIndex, field, value);
      },
      editBulletPoint(itemIndex, value) {
        functions.editBulletPoint(degreeIndex, itemIndex, value);
      },
      updateBulletPoints(value) {
        functions.updateBulletPoints(degreeIndex, value);
      },
    };
  }

  return (
    <section
      aria-labelledby="education"
      className="section"
      id="education-tabpanel"
      ref={ref}
      role="tabpanel"
    >
      <form action="#" className="section--form section--form__bullet-points">
        <SectionItemHeader
          addItem={addDegree}
          deleteItem={deleteDegree}
          handleFocus={handleFocus}
          handleKeyDown={handleKeyboard}
          itemName="Degree"
          itemNumber={shownDegreeIndex + 1}
          itemsNumber={data.degrees.length}
          showNextItem={showNextDegree}
          showPreviousItem={showPreviousDegree}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
        <Degree
          data={data.degrees[shownDegreeIndex]}
          functions={getDegreeFunctions(shownDegreeIndex)}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
      </form>
    </section>
  );
}
