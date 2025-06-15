/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import capitalize from '@/utils/capitalize';

import deleteSrc from '@/assets/icons/delete-cross.svg';

import '@/styles/blocks/appbar-item.scss';
import './NavItem.scss';

export default function NavItem({
  iconSrc,
  alt,
  isSelected,
  selectSection,
  id,
  className,
  editorMode,
  deleteSection,
  activeSectionIDs,
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

  // Outer element
  const outerClassName =
    `NavItem appbar-item ${className} ${isDragging ? 'NavItem_dragged' : ''}`.trimEnd();

  const mainClassName =
    `NavItem-Button appbar-item__inner appbar-item__inner_action ${id !== 'personal' && editorMode ? 'NavItem-Button_editing' : ''} ${isSelected && !editorMode ? 'appbar-item__inner_active' : ''}`.trimEnd();

  // Delete button
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
        aria-label={`${capitalize(id)}`}
        aria-selected={isSelected}
        className={mainClassName}
        id={id}
        // TODO: screen reader announcements (when sections are implemented)
        role="tab"
        type="button"
        onClick={!editorMode ? selectSection : null}
        {...dragProps}
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
