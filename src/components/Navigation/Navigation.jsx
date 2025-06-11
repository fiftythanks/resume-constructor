import React, { useState } from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

import NavItem from '@components/NavItem';
import ToolbarItem from '@components/ToolbarItem';
import AddSections from '@components/AddSections';

import capitalize from '@utils/capitalize';

import personalSrc from '@icons/sections/personal.svg';
import linksSrc from '@icons/sections/links.svg';
import skillsSrc from '@icons/sections/skills.svg';
import experienceSrc from '@icons/sections/experience.svg';
import projectsSrc from '@icons/sections/projects.svg';
import educationSrc from '@icons/sections/education.svg';
import certificationsSrc from '@icons/sections/certifications.svg';
import optionsSrc from '@icons/options.svg';
import closeSrc from '@icons/close.svg';
import addSrc from '@icons/add.svg';
import deleteSrc from '@icons/delete.svg';
import editSrc from '@icons/edit.svg';
import doneSrc from '@icons/done.svg';

import './Navigation.scss';

const icons = {
  personal: personalSrc,
  links: linksSrc,
  skills: skillsSrc,
  experience: experienceSrc,
  projects: projectsSrc,
  education: educationSrc,
  certifications: certificationsSrc,
  options: optionsSrc,
  close: closeSrc,
  add: addSrc,
  delete: deleteSrc,
  edit: editSrc,
  done: doneSrc,
};

export default function Navigation({
  activeSectionIDs,
  openedSectionID,
  selectSection,
  reorderSections,
  addSections,
  deleteSections,
  possibleSectionIDs,
  resetScreenReaderAnnouncement,
}) {
  /**
   * This state determines whether to alow DnD and render delete buttons
   * with `NavItem`s or not.
   */
  const [editorMode, setEditorMode] = useState(false);

  // For the "Add Sections" popup
  const [isAddSectionsPopupShown, setIsAddSectionsPopupShown] = useState(false);

  // Drag and drop hooks
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function toggleEditorMode() {
    setEditorMode(!editorMode);
  }

  const canAddSections =
    possibleSectionIDs.filter(
      (sectionID) => !activeSectionIDs.includes(sectionID),
    ).length > 0;

  function showAddSectionsPopup() {
    // Otherwise, the screen reader will announce incorrect things
    resetScreenReaderAnnouncement();

    setIsAddSectionsPopupShown(true);
  }

  function closeAddSectionsPopup() {
    setIsAddSectionsPopupShown(false);

    if (canAddSections) {
      document.getElementById('add-sections').focus();
    } else {
      const lastAddedSectionID = activeSectionIDs.at(-1);
      document.getElementById(lastAddedSectionID).focus();
    }
  }

  // Drag and drop logic
  function handleDragEnd(e) {
    const { active, over } = e;

    if (active.id !== over.id) {
      const oldIndex = activeSectionIDs.indexOf(active.id);
      const newIndex = activeSectionIDs.indexOf(over.id);

      const newActiveSectionIDs = arrayMove(
        activeSectionIDs,
        oldIndex,
        newIndex,
      );

      reorderSections(newActiveSectionIDs);
    }
  }

  /**
   * The `personal` item isn't draggable, and has to be added to the DOM
   * separately.
   */
  const draggableSectionIDs = activeSectionIDs.filter(
    (sectionID) => sectionID !== 'personal',
  );

  const items = draggableSectionIDs.map((sectionID) => (
    <NavItem
      className="Navigation-NavItem Navigation-NavItem_draggable"
      iconSrc={icons[sectionID]}
      alt={capitalize(sectionID)}
      isSelected={openedSectionID === sectionID}
      key={sectionID}
      id={sectionID}
      selectSection={() => selectSection(sectionID)}
      editorMode={editorMode}
      deleteSection={() => {
        deleteSections([sectionID]);
      }}
      activeSectionIDs={activeSectionIDs}
    />
  ));

  return (
    <>
      <nav className="Navigation">
        <ul
          className="Navigation-Items"
          role="tablist"
          aria-label="Resume Sections"
          aria-orientation="vertical"
          aria-owns="personal links skills experience projects education certifications"
          id="resume-sections"
        >
          <NavItem
            className="Navigation-NavItem Navigation-NavItem_personal"
            iconSrc={icons.personal}
            alt="Personal"
            isSelected={openedSectionID === 'personal'}
            id="personal"
            selectSection={() => selectSection('personal')}
            editorMode={editorMode}
            activeSectionIDs={activeSectionIDs}
          />
          {/**
           * This structure is necessary to be able to limit the dragging to
           * the area between "personal" and the end of `Navigation-Items`.
           */}
          <li role="none" className="Navigation-DraggableItemsWrapper">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              /**
               * Since the navigation bar will always stay in the same position
               * (or at least won't move beyond the screen almost certainly),
               * there's no need for autoscroll. It also introduces strange
               * behaviour on mobile Firefox, so turning it off is for the best.
               */
              autoScroll={false}
            >
              <SortableContext
                items={draggableSectionIDs}
                strategy={verticalListSortingStrategy}
              >
                <ul
                  role="none"
                  className="Navigation-Items Navigation-Items_draggable"
                >
                  {items}
                </ul>
              </SortableContext>
            </DndContext>
          </li>
        </ul>

        {/* Control buttons */}
        {canAddSections && (
          <ToolbarItem
            className="Navigation-Control Navigation-Control_onTop"
            iconSrc={icons.add}
            alt="Add Sections"
            attributes={{
              'aria-label': 'Add Sections',
              'aria-haspopup': 'dialog',
              'aria-controls': 'add-sections-dialog',
              id: 'add-sections',
            }}
            action={() => {
              showAddSectionsPopup();
            }}
          />
        )}
        <ToolbarItem
          className={`Navigation-Control${canAddSections ? '' : ' Navigation-Control_onTop'}`}
          iconSrc={editorMode ? icons.done : icons.edit}
          alt="Edit Sections"
          attributes={{
            'aria-label': 'Toggle Editor Mode',
            'aria-controls': 'resume-sections',
            'aria-pressed': `${editorMode}`,
            id: 'edit-sections',
          }}
          modifiers={[`${editorMode ? 'Navigation-Control_editing' : ''}`]}
          action={toggleEditorMode}
          key="toggle-editor-mode"
        />
      </nav>
      <AddSections
        isShown={isAddSectionsPopupShown}
        onClose={closeAddSectionsPopup}
        possibleSectionIDs={possibleSectionIDs}
        activeSectionIDs={activeSectionIDs}
        addSections={addSections}
      />
    </>
  );
}
