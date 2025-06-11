import React, { useState } from 'react';

import Button from '@/components/Button';
import Popup from '@/components/Popup';

import capitalize from '@/utils/capitalize';

import closeSrc from '@/assets/icons/close.svg';

import './AddSections.scss';

export default function AddSections({
  activeSectionIDs,
  addSections,
  isShown,
  onClose,
  possibleSectionIDs,
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
          elements={['AddSections-Button']}
          id={`add-${sectionID}`}
          key={`add-${sectionID}`}
          label={`Add ${sectionID}`}
          modifiers={['AddSections-Button_add']}
          onClick={handleClick}
        >
          {capitalize(sectionID)}
        </Button>
      );
    });
  };

  return (
    <Popup
      block="AddSections"
      id="add-sections-dialog"
      isShown={isShown}
      onClose={onClose}
      title="Add Sections"
    >
      <span aria-live="polite" className="visually-hidden">
        {screenReaderAnouncement}
      </span>
      <ul className="AddSections-List">
        {createAddBtns()}
        <Button
          elements={['AddSections-Button']}
          id="add-all-sections"
          label="Add All Sections"
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
        className="AddSections-CloseBtn"
        onClick={closePopup}
        type="button"
      >
        <img
          alt="Close Popup"
          className="AddSections-CloseIcon"
          height="32px"
          src={closeSrc}
          width="32px"
        />
      </button>
    </Popup>
  );
}
