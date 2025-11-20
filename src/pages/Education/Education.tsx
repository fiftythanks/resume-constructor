import React from 'react';

import useResumeData from '@/hooks/useResumeData';

import Button from '@/components/Button';

import Degree from './Degree';

import addSrc from '@/assets/icons/add-black.svg';
import deleteSrc from '@/assets/icons/delete.svg';
import nextSrc from '@/assets/icons/next.svg';
import prevSrc from '@/assets/icons/prev.svg';

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
  data: Education;
  functions: ReturnType<typeof useResumeData>['educationFunctions'];
  updateScreenReaderAnnouncement: (announcement: string) => void;
}

export default function Education({
  data,
  functions,
  updateScreenReaderAnnouncement,
}: ReadonlyDeep<EducationProps>) {
  const { shownDegreeIndex } = data;

  function addDegree() {
    functions.addDegree();
    document.getElementById('university-name')!.focus();
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
    <form
      action="#"
      aria-labelledby="education"
      className="section section__bullet-points"
      id="education-tabpanel"
      role="tabpanel"
    >
      <header className="section--header">
        <h2>Degree {shownDegreeIndex + 1}</h2>
        {/**
         * In `Experience` and `Projects`, this logic is different. I
         * simplified it thinking it doesn't make sense. But then I
         * realised I may have forgotten something. I'm leaving this
         * conditional rendering logic for the `<div>` here to see
         * later if it actually has a purpose.
         */}
        {/* Conditional rendering to get rid of redundant flex gap. */}
        {(shownDegreeIndex > 0 ||
          shownDegreeIndex !== data.degrees.length - 1) && (
          <div className="section--item-navigation">
            {shownDegreeIndex > 0 && (
              <Button
                aria-label="Show Previous Degree"
                className="section--item-navigation-button"
                id="show-previous-degree"
                onClick={() => functions.showDegree(shownDegreeIndex - 1)}
                modifiers={[
                  'Button_paddingBlock_none',
                  'Button_paddingInline_small',
                ]}
              >
                <img alt="Previous" height="25px" src={prevSrc} width="25px" />
              </Button>
            )}
            {shownDegreeIndex !== data.degrees.length - 1 && (
              <Button
                aria-label="Show Next Degree"
                id="show-next-degree"
                onClick={() => functions.showDegree(shownDegreeIndex + 1)}
                modifiers={[
                  'Button_paddingBlock_none',
                  'Button_paddingInline_small',
                ]}
              >
                <img alt="Previous" height="25px" src={nextSrc} width="25px" />
              </Button>
            )}
          </div>
        )}
        <Button
          aria-label={`Add Degree ${data.degrees.length + 1}`}
          id="add-degree"
          modifiers={['Button_paddingBlock_none', 'Button_paddingInline_small']}
          onClick={addDegree}
        >
          <img alt="Add" height="25px" src={addSrc} width="25px" />
        </Button>
        {data.degrees.length > 1 && (
          <button
            aria-label={`Delete Degree ${shownDegreeIndex + 1}`}
            className="section--delete-item"
            id="delete-degree"
            type="button"
            onClick={() => functions.deleteDegree(shownDegreeIndex)}
          >
            <img alt="Delete" height="25px" src={deleteSrc} width="25px" />
          </button>
        )}
      </header>
      <Degree
        data={data.degrees[shownDegreeIndex]}
        functions={getDegreeFunctions(shownDegreeIndex)}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    </form>
  );
}
