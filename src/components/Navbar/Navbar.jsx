/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
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
import AppbarIconButton from '@/components/AppbarIconButton';
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

/**
 * The tab shouldn't be draggable in the navbar. You can't put
 * links anywhere but the resume header!
 */
// TODO: make the Links tab not draggable.

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
  canAddSections,
  className,
  deleteSections,
  editorMode,
  isExpanded,
  possibleSectionIDs,
  reorderSections,
  resetScreenReaderAnnouncement,
  selectedSectionID,
  selectSection,
  toggleEditorMode,
  titles,
}) {
  // For the "Add Sections" popup
  const [isAddSectionsPopupShown, setIsAddSectionsPopupShown] = useState(false);

  // Drag and drop hooks
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [isDragging, setIsDragging] = useState(false);

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
  function handleDragStart() {
    setIsDragging(true);
  }

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

    setIsDragging(false);
  }

  /**
   * The `personal` item isn't draggable, and has to be added to the DOM
   * separately.
   */
  const draggableSectionIDs = activeSectionIDs.filter(
    (sectionID) => sectionID !== 'personal',
  );

  function getDeleteSectionFunc(sectionID) {
    return function deleteSection() {
      deleteSections([sectionID]);

      const i = activeSectionIDs.indexOf(sectionID);

      // If we delete the last deletable section.
      if (activeSectionIDs.length === 2) {
        document.getElementById('edit-sections').focus();
        // If the deleted section isn't going to be the last deletable section.
      } else if (i < activeSectionIDs.length - 1) {
        document.getElementById(`delete-${activeSectionIDs[i + 1]}`).focus();
      } else {
        document.getElementById(`delete-${activeSectionIDs[i - 1]}`).focus();
      }
    };
  }

  const items = draggableSectionIDs.map((sectionID) => {
    const isSelected = selectedSectionID === sectionID;
    const tabIndex = isSelected || editorMode ? 0 : -1;

    return (
      <NavItem
        activeSectionIDs={activeSectionIDs}
        alt={capitalize(sectionID)}
        className="Navbar-NavItem Navbar-NavItem_draggable"
        editorMode={editorMode}
        iconSrc={icons[sectionID]}
        id={sectionID}
        isSelected={isSelected}
        key={sectionID}
        tabIndex={tabIndex}
        title={titles[sectionID]}
        onDeleteSection={getDeleteSectionFunc(sectionID)}
        onSelectSection={() => selectSection(sectionID)}
      />
    );
  });

  const addSectionsAttributes = {
    'aria-label': 'Add Sections',
    'aria-haspopup': 'dialog',
    'aria-controls': 'add-sections-dialog',
    id: 'add-sections',
  };

  const editorClassName = `Navbar-Control${canAddSections ? '' : ' Navbar-Control_onTop'}${editorMode ? ' Navbar-Control_editing' : ''}`;

  const editorAttributes = {
    'aria-label': 'Toggle Editor Mode',
    'aria-controls': 'resume-sections',
    'aria-pressed': `${editorMode}`,
    id: 'edit-sections',
  };

  // Keyboard navigation
  function handleKeyDown(e) {
    const { id } = e.target;

    if (
      possibleSectionIDs.includes(id) &&
      activeSectionIDs.length === 1 &&
      !isDragging
    ) {
      if (e.key === 'ArrowDown') {
        document.getElementById('add-sections').focus();
      } else if (e.key === 'ArrowUp') {
        document.getElementById('edit-sections').focus();
      }
    } else if (
      possibleSectionIDs.includes(id) &&
      activeSectionIDs.length > 1 &&
      !isDragging
    ) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();

        const i = activeSectionIDs.indexOf(id);

        if (i < activeSectionIDs.length - 1) {
          document.getElementById(activeSectionIDs[i + 1]).focus();
        } else if (canAddSections) {
          document.getElementById('add-sections').focus();
        } else {
          document.getElementById('edit-sections').focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();

        const i = activeSectionIDs.indexOf(id);
        if (i > 0) {
          document.getElementById(activeSectionIDs[i - 1]).focus();
        } else {
          document.getElementById('edit-sections').focus();
        }
      }
    } else if (
      editorMode &&
      activeSectionIDs.length > 1 &&
      /^delete-[a-z]+/.test(id)
    ) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();

        const sectionID = id.replace('delete-', '');
        const i = activeSectionIDs.indexOf(sectionID);

        if (i < activeSectionIDs.length - 1) {
          document.getElementById(`delete-${activeSectionIDs[i + 1]}`).focus();
        } else {
          document.getElementById(`delete-${activeSectionIDs[1]}`).focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();

        const sectionID = id.replace('delete-', '');
        const i = activeSectionIDs.indexOf(sectionID);

        if (i > 1) {
          document.getElementById(`delete-${activeSectionIDs[i - 1]}`).focus();
        } else {
          document.getElementById(`delete-${activeSectionIDs.at(-1)}`).focus();
        }
      }
    } else if (id === 'add-sections') {
      if (e.key === 'ArrowDown') {
        document.getElementById('edit-sections').focus();
      } else if (e.key === 'ArrowUp') {
        document.getElementById(activeSectionIDs.at(-1)).focus();
      }
    } else if (id === 'edit-sections') {
      if (e.key === 'ArrowDown') {
        document.getElementById(activeSectionIDs[0]).focus();
      } else if (e.key === 'ArrowUp') {
        if (canAddSections) {
          document.getElementById('add-sections').focus();
        } else {
          document.getElementById(activeSectionIDs.at(-1)).focus();
        }
      } else if (
        e.key === 'Tab' &&
        e.shiftKey === true &&
        editorMode &&
        activeSectionIDs.length > 1
      ) {
        e.preventDefault();

        document.getElementById(activeSectionIDs[1]).focus();
      }
    }
  }

  function handleKeyUp(e) {
    const { id } = e.target;

    // The RegExp checks if it's not a delete button.
    if (
      e.key === 'Delete' &&
      /^(?!delete-).+/.test(id) &&
      id !== 'personal' &&
      !isDragging
    ) {
      e.preventDefault();

      deleteSections([id]);

      const i = activeSectionIDs.indexOf(id);

      // If there's only "Personal" left.
      if (activeSectionIDs.length === 2) {
        document.getElementById('personal').focus();

        // If the deleted item wasn't the last in the array
      } else if (i < activeSectionIDs.length - 1) {
        document.getElementById(activeSectionIDs[i + 1]).focus();
      } else {
        document.getElementById(activeSectionIDs[i - 1]).focus();
      }
    }
  }

  // If there's no selected section, "Personal" is focusable.
  const personalNavItemTabIndex =
    selectedSectionID === 'personal' ||
    editorMode ||
    // FIXME: `null`? `selectedSectionID` shouldn't ever be null. It's always an ID. Or an empty string at least.
    selectedSectionID === null
      ? 0
      : -1;

  return (
    <>
      <nav
        aria-labelledby="toggle-navbar"
        className={`Navbar ${isExpanded ? '' : 'Navbar_hidden'} ${className}`.trimEnd()}
        id="navbar"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
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
            isSelected={selectedSectionID === 'personal'}
            selectSection={() => selectSection('personal')}
            tabIndex={personalNavItemTabIndex}
            title={titles[sectionID]}
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
              onDragStart={handleDragStart}
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
          <AppbarIconButton
            alt="Add Sections"
            attributes={addSectionsAttributes}
            className="Navbar-Control Navbar-Control_onTop"
            iconSrc={icons.add}
            onClick={showAddSectionsPopup}
          />
        )}
        <AppbarIconButton
          alt="Edit Sections"
          attributes={editorAttributes}
          className={editorClassName}
          iconSrc={editorMode ? icons.done : icons.edit}
          key="toggle-editor-mode"
          onClick={toggleEditorMode}
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
