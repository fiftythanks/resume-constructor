import React from 'react';

import Button from '@/components/Button';

import Degree from './Degree';

import addSrc from '@/assets/icons/add-black.svg';
import deleteSrc from '@/assets/icons/delete.svg';
import nextSrc from '@/assets/icons/next.svg';
import prevSrc from '@/assets/icons/prev.svg';

// FIXME: there's an issue some field(s). You can't insert data in it/them. Fix it.

export default function Education({
  data,
  functions,
  updateScreenReaderAnnouncement,
}) {
  const { shownDegreeIndex } = data;

  function addDegree() {
    functions.addDegree();
    document.getElementById('university-name').focus();
  }

  function getDegreeFunctions(index) {
    return {
      addBulletPoint() {
        functions.addBulletPoint(index);
      },

      deleteBulletPoint(itemIndex) {
        functions.deleteBulletPoint(index, itemIndex);
      },

      edit(field, value) {
        functions.editDegree(index, field, value);
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
    <form
      action="#"
      aria-labelledby="education"
      className="section section__bullet-points"
      id="education-tabpanel"
      role="tabpanel"
    >
      <header className="section--header">
        <h2>Degree {shownDegreeIndex + 1}</h2>
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
          aria-label={`Add Degree ${data.degrees.length}`}
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
