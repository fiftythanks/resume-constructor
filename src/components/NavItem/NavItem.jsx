/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import deleteSrc from '@/assets/icons/delete-cross.svg';

import './NavItem.scss';

export default function NavItem({
  activeSectionIDs,
  alt,
  className,
  deleteSection,
  editorMode,
  iconSrc,
  id,
  selectSection,
  selectedSectionID,
  titles,
}) {
  // Drag and drop logic
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  let dragProps;

  if (id === 'personal' || !editorMode) {
    dragProps = {};
  } else if (id !== 'personal' && editorMode) {
    dragProps = {
      ...listeners,
      'aria-roledescription': 'draggable',
      'aria-describedby': attributes['aria-describedby'],
      ref: setActivatorNodeRef,
    };
  }

  const isSelected = selectedSectionID === id;

  // Outer element
  const outerClassName =
    `NavItem ${className} ${isDragging ? 'NavItem_dragged' : ''} ${isSelected ? 'NavItem_selected' : ''}`.trimEnd();

  const mainClassName =
    `NavItem-Button ${id !== 'personal' && editorMode ? 'NavItem-Button_editing' : ''} ${isSelected && !editorMode ? 'NavItem-Button_active' : ''}`.trimEnd();

  // Delete button
  // TODO: move this logic to the `Navbar` component.
  function handleDeleteClick() {
    deleteSection();

    const i = activeSectionIDs.indexOf(id);

    // If there's only "Personal" left.
    if (activeSectionIDs.length === 2) {
      document.getElementById('edit-sections').focus();

      // If the deleted item wasn't the last in the array
    } else if (i < activeSectionIDs.length - 1) {
      document.getElementById(`delete-${activeSectionIDs[i + 1]}`).focus();
    } else {
      document.getElementById(`delete-${activeSectionIDs[i - 1]}`).focus();
    }
  }

  const deleteClassName =
    `NavItem-ControlBtn NavItem-ControlBtn_delete ${editorMode ? '' : 'NavItem-ControlBtn_disabled'}`.trimEnd();

  return (
    <li
      className={outerClassName}
      ref={id === 'personal' ? null : setNodeRef}
      style={id === 'personal' ? null : style}
    >
      <button
        aria-controls={`${id}-tabpanel`}
        // To indicate that the tabbing functionality is disabled
        aria-disabled={editorMode}
        aria-label={titles[`${id}`]}
        aria-selected={isSelected}
        className={mainClassName}
        id={id}
        // TODO: add screen reader announcements (when all sections are implemented).
        role="tab"
        type="button"
        onClick={!editorMode ? selectSection : null}
        {...dragProps}
        // If there's no selected section, "personal" is focusable.
        tabIndex={
          isSelected ||
          editorMode ||
          (id === 'personal' && selectedSectionID === null)
            ? '0'
            : '-1'
        }
      >
        <img
          alt={alt}
          className="appbar-item__icon"
          height="25px"
          src={iconSrc}
          width="25px"
        />
      </button>

      {id !== 'personal' && (
        <button
          aria-label={`Delete ${id}`}
          className={deleteClassName}
          id={`delete-${id}`}
          type="button"
          onClick={handleDeleteClick}
        >
          <img
            alt="Delete"
            className="NavItem-ControlBtnIcon"
            height="12px"
            src={deleteSrc}
            width="12px"
          />
        </button>
      )}
    </li>
  );
}
