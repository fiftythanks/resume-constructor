import React from 'react';

import Button from '@/components/Button';
import Popup from '@/components/Popup';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import closeSrc from '@/assets/icons/cross.svg';

import './AddSections.scss';

import type { SectionId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

//? (1) Should it be in the bottom? It's visually in an upper corner of the modal. Shouldn't it be on top of `AddSections-List` in the DOM?

export interface AddSectionsProps {
  activeSectionIds: SectionId[];
  addSections: (sectionIds: SectionId[]) => void;
  isShown: boolean;
  onClose: () => void;
}

/**
 * A dialog component with a close button that lets users to add
 * sections to the resume. The component has an "add-button" for each
 * section that can be added and an "Add All Sections" button to add
 * all addable sections at once. As soon as the last addable section is
 * added or "Add All Sections" is clicked, the component calls `onClose`
 * which should close the dialog.
 */
export default function AddSections({
  activeSectionIds,
  addSections,
  isShown,
  onClose,
}: ReadonlyDeep<AddSectionsProps>) {
  /**
   * The `onClose` function changes a state, and this change
   * results in the closing of the popup. So in some contexts, for
   * readability, it's better to call the function `closePopup`, which
   * I will do. It's entirely the same function, but its name conveys
   * more meaning.
   */
  const closePopup = onClose;

  /**
   * Creates an array of "add-buttons" for adding sections.
   */
  const createAddBtns = () => {
    const addableSectionIds = possibleSectionIds.filter(
      (sectionId) => !activeSectionIds.includes(sectionId),
    );

    return addableSectionIds.map((sectionId, i) => {
      const handleClick = () => {
        addSections([sectionId]);
        const nextAddableSectionIds = addableSectionIds.toSpliced(i, 1);

        /**
         * If there are still sections that are possible to be added (i.e.
         * there are add-buttons corresponding to them), focus on either the
         * next or previous button. Otherwise, close the popup.
         */
        if (nextAddableSectionIds.length > 0) {
          /**
           * If the added section wasn't the last (i.e. there's a next
           * add-button), focus on the next add-button; otherwise, focus on the
           * previous one.
           */
          if (nextAddableSectionIds[i] !== undefined) {
            document.getElementById(`add-${nextAddableSectionIds[i]}`)!.focus();
          } else {
            document
              .getElementById(`add-${nextAddableSectionIds[i - 1]}`)!
              .focus();
          }
        } else {
          closePopup();
        }
      };

      return (
        <Button
          aria-label={`Add ${sectionTitles[sectionId]}`}
          elements={['AddSections-Button']}
          id={`add-${sectionId}`}
          key={`add-${sectionId}`}
          modifiers={['AddSections-Button_add']}
          onClick={handleClick}
        >
          {sectionTitles[sectionId]}
        </Button>
      );
    });
  };

  return (
    <Popup
      block="AddSections"
      id="add-sections-dialog"
      isShown={isShown}
      title="Add Sections"
      onClose={onClose}
    >
      <ul className="AddSections-List">
        {createAddBtns()}
        <Button
          aria-label="Add All Sections"
          elements={['AddSections-Button']}
          id="add-all-sections"
          modifiers={['AddSections-Button_add AddSections-Button_all']}
          onClick={() => {
            addSections([...possibleSectionIds]);
            closePopup();
          }}
        >
          All
        </Button>
      </ul>
      {/* (1) */}
      <button
        className="AddSections-CloseBtn"
        type="button"
        onClick={closePopup}
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
