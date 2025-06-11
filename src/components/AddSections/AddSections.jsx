import React, { useState } from 'react';

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
  const [screenReaderAnouncement, setScreenReaderAnnouncement] = useState(null);

  /**
   * The `onClose` function changes a state, and this change
   * results in the closing of the popup. So in some contexts, for
   * readability, it's better to call the function `closePopup`, which
   * I will do. It's entirely the same function, but its name conveys
   * more meaning.
   */
  const closePopup = onClose;

  const createAddBtns = () => {
    const addableSectionIDs = possibleSectionIDs.filter(
      (sectionID) => !activeSectionIDs.includes(sectionID),
    );

    return addableSectionIDs.map((sectionID, i) => {
      const handleClick = () => {
        addSections([sectionID]);

        const nextAddableSectionIDs = addableSectionIDs.toSpliced(i, 1);

        if (nextAddableSectionIDs.length > 0) {
          /**
           * If the added section was the last section that the user could add,
           * the modal will close, and the screen reader won't announce the
           * addition. In this case, `addSections` from the App component
           * handles the announcement.
           */
          setScreenReaderAnnouncement(`${capitalize(sectionID)} added.`);

          if (nextAddableSectionIDs[i] !== undefined) {
            document.getElementById(`add-${nextAddableSectionIDs[i]}`).focus();
          } else {
            document
              .getElementById(`add-${nextAddableSectionIDs[i - 1]}`)
              .focus();
          }
        } else {
          closePopup();
        }
      };

      return (
        <Button
          onClick={handleClick}
          key={`add-${sectionID}`}
          id={`add-${sectionID}`}
          elements={['AddSections-Button']}
          modifiers={['AddSections-Button_add']}
          label={`Add ${sectionID}`}
        >
          {capitalize(sectionID)}
        </Button>
      );
    });
  };

  return (
    <Popup
      isShown={isShown}
      onClose={onClose}
      title="Add Sections"
      block="AddSections"
      id="add-sections-dialog"
    >
      <span className="visually-hidden" aria-live="polite">
        {screenReaderAnouncement}
      </span>
      <ul className="AddSections-List">
        {createAddBtns()}
        <Button
          elements={['AddSections-Button']}
          modifiers={['AddSections-Button_add AddSections-Button_all']}
          onClick={() => {
            addSections(possibleSectionIDs);
            closePopup();
          }}
          id="add-all-sections"
          label="Add All Sections"
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
