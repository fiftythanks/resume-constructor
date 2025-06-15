import React, { useState } from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import AddSections from '@/components/AddSections';
import AppbarItem from '@/components/AppbarItem';
import NavItem from '@/components/NavItem';

import capitalize from '@/utils/capitalize';

import addSrc from '@/assets/icons/add.svg';
import doneSrc from '@/assets/icons/done.svg';
import editSrc from '@/assets/icons/edit.svg';
import certificationsSrc from '@/assets/icons/sections/certifications.svg';
import educationSrc from '@/assets/icons/sections/education.svg';
import experienceSrc from '@/assets/icons/sections/experience.svg';
import linksSrc from '@/assets/icons/sections/links.svg';
import personalSrc from '@/assets/icons/sections/personal.svg';
import projectsSrc from '@/assets/icons/sections/projects.svg';
import skillsSrc from '@/assets/icons/sections/skills.svg';

import './Navbar.scss';

const icons = {
  add: addSrc,
  certifications: certificationsSrc,
  done: doneSrc,
  edit: editSrc,
  education: educationSrc,
  experience: experienceSrc,
  links: linksSrc,
  personal: personalSrc,
  projects: projectsSrc,
  skills: skillsSrc,
};

export default function Navbar({
  activeSectionIDs,
  addSections,
  className,
  deleteSections,
  isExpanded,
  openedSectionID,
  possibleSectionIDs,
  reorderSections,
  resetScreenReaderAnnouncement,
  selectSection,
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
      activeSectionIDs={activeSectionIDs}
      alt={capitalize(sectionID)}
      className="Navbar-NavItem Navbar-NavItem_draggable"
      editorMode={editorMode}
      iconSrc={icons[sectionID]}
      id={sectionID}
      isSelected={openedSectionID === sectionID}
      key={sectionID}
      selectSection={() => selectSection(sectionID)}
      deleteSection={() => {
        deleteSections([sectionID]);
      }}
    />
  ));

  const addSectionsAttributes = {
    'aria-label': 'Add Sections',
    'aria-haspopup': 'dialog',
    'aria-controls': 'add-sections-dialog',
    id: 'add-sections',
  };

  const editorClassName = `Navbar-Control${canAddSections ? '' : ' Navbar-Control_onTop'}`;

  const editorAttributes = {
    'aria-label': 'Toggle Editor Mode',
    'aria-controls': 'resume-sections',
    'aria-pressed': `${editorMode}`,
    id: 'edit-sections',
  };

  return (
    <>
      <nav
        className={`Navbar ${isExpanded ? '' : 'Navbar_hidden'} ${className}`.trimEnd()}
        id="navbar"
      >
        <ul
          aria-label="Resume Sections"
          aria-orientation="vertical"
          aria-owns="personal links skills experience projects education certifications"
          className="Navbar-Items"
          id="resume-sections"
          role="tablist"
        >
          <NavItem
            activeSectionIDs={activeSectionIDs}
            alt="Personal"
            className="Navbar-NavItem Navbar-NavItem_personal"
            editorMode={editorMode}
            iconSrc={icons.personal}
            id="personal"
            isSelected={openedSectionID === 'personal'}
            selectSection={() => selectSection('personal')}
          />
          {/**
           * This structure is necessary to be able to limit the dragging to
           * the area between "personal" and the end of `Navbar-Items`.
           */}
          <li
            className={`Navbar-DraggableItemsWrapper${activeSectionIDs.length === 1 ? ' Navbar-DraggableItemsWrapper_hidden' : ''}`}
            role="none"
          >
            <DndContext
              /**
               * Since the navigation bar will always stay in the same position
               * (or at least won't move beyond the screen almost certainly),
               * there's no need for autoscroll. It also introduces strange
               * behaviour on mobile Firefox, so turning it off is for the best.
               */
              autoScroll={false}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={draggableSectionIDs}
                strategy={verticalListSortingStrategy}
              >
                <ul className="Navbar-Items Navbar-Items_draggable" role="none">
                  {items}
                </ul>
              </SortableContext>
            </DndContext>
          </li>
        </ul>

        {/* Control buttons */}
        {canAddSections && (
          <AppbarItem
            alt="Add Sections"
            attributes={addSectionsAttributes}
            className="Navbar-Control Navbar-Control_onTop"
            iconSrc={icons.add}
            action={() => {
              showAddSectionsPopup();
            }}
          />
        )}
        <AppbarItem
          action={toggleEditorMode}
          alt="Edit Sections"
          attributes={editorAttributes}
          className={editorClassName}
          iconSrc={editorMode ? icons.done : icons.edit}
          key="toggle-editor-mode"
          modifiers={[`${editorMode ? 'Navbar-Control_editing' : ''}`]}
        />
      </nav>
      <AddSections
        activeSectionIDs={activeSectionIDs}
        addSections={addSections}
        isShown={isAddSectionsPopupShown}
        possibleSectionIDs={possibleSectionIDs}
        onClose={closeAddSectionsPopup}
      />
    </>
  );
}
