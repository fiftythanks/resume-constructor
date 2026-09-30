import type { RefObject } from 'react';

import useLastComponentBeforeTabpanel from '@/hooks/useLastComponentBeforeTabpanel';
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
  const { handleFocus, handleKeyboard } =
    useLastComponentBeforeTabpanel('education');

  const shownDegreeIndex = data.shownDegreeIndex;

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
    <section
      aria-labelledby="education"
      className="section"
      id="education-tabpanel"
      ref={ref}
      role="tabpanel"
    >
      <form action="#" className="section--form section--form__bullet-points">
        <header className="section--header">
          <h2>Degree {shownDegreeIndex + 1}</h2>
          {/* FIXME: When you press "Show Previous/Next Degree" or delete a degree, the browser loses focus. */}
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
              {shownDegreeIndex !== data.degrees.length - 1 && (
                <Button
                  aria-label="Show Next Degree"
                  id="show-next-degree"
                  onClick={() => functions.showDegree(shownDegreeIndex + 1)}
                  onFocus={(e) => {
                    // Don't handle focus if it's not the first tabbable element.
                    if (shownDegreeIndex > 0) return;

                    handleFocus(e);
                  }}
                  onKeyDown={(e) => {
                    // Don't handle keydown if it's not the first tabbable element.
                    if (shownDegreeIndex > 0) return;

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
          <Button
            aria-label={`Add Degree ${data.degrees.length + 1}`}
            id="add-degree"
            onClick={addDegree}
            onFocus={(e) => {
              // Don't handle focus if it's not the first tabbable element.
              if (
                shownDegreeIndex > 0 ||
                shownDegreeIndex !== data.degrees.length - 1
              ) {
                return;
              }

              handleFocus(e);
            }}
            onKeyDown={(e) => {
              // Don't handle keydown if it's not the first tabbable element.
              if (
                shownDegreeIndex > 0 ||
                shownDegreeIndex !== data.degrees.length - 1
              ) {
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
    </section>
  );
}
