import React from 'react';

import Popup from '@components/Popup';
import Button from '@components/Button';

import capitalize from '@utils/capitalize';

import closeSrc from '@icons/close.svg';

import './AddSections.scss';

export default function AddSections({
  isShown,
  onClose,
  possibleSectionIDs,
  activeSectionIDs,
  addSections,
}) {
  /**
   * The `onClose` function changes a state, and this change
   * results in the closing of the popup. So in some contexts, for
   * readability, it's better to call the function `closePopup`, which
   * I will do. It's entirely the same function, but its name conveys
   * more meaning.
   */
  const closePopup = onClose;

  const createAddBtns = () =>
    possibleSectionIDs
      .filter((sectionID) => !activeSectionIDs.includes(sectionID))
      .map((sectionID) => {
        const handleClick = () => {
          addSections([sectionID]);

          /**
           * `addSections` will only change the state for the next render.
           * That's why I can't use the `canAddSections` here and need
           * another way.
           */
          const noMoreToAdd =
            possibleSectionIDs.filter((id) => !activeSectionIDs.includes(id))
              .length <= 1;

          if (noMoreToAdd) closePopup();
        };

        return (
          <Button
            onClick={handleClick}
            key={`add-${sectionID}`}
            elements={['AddSections-Button']}
            modifiers={['AddSections-Button_add']}
          >
            {capitalize(sectionID)}
          </Button>
        );
      });

  return (
    <Popup
      isShown={isShown}
      onClose={onClose}
      title="Add Sections"
      block="AddSections"
      id="add-sections-dialog"
    >
      <ul className="AddSections-List">
        {createAddBtns()}
        <Button
          elements={['AddSections-Button']}
          modifiers={['AddSections-Button_add AddSections-Button_all']}
          onClick={() => {
            addSections(possibleSectionIDs);
            closePopup();
          }}
        >
          All
        </Button>
      </ul>
      <button
        type="button"
        onClick={closePopup}
        className="AddSections-CloseBtn"
      >
        <img
          src={closeSrc}
          alt="Close Popup"
          width="32px"
          height="32px"
          className="AddSections-CloseIcon"
        />
      </button>
    </Popup>
  );
}
