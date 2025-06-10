/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import capitalize from '@utils/capitalize';

import deleteSrc from '@icons/delete-cross.svg';

import '@blocks/toolbar-item.scss';
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

  return (
    <li
      className={`NavItem toolbar-item ${className} ${isDragging ? 'NavItem_dragged' : ''}`.trimEnd()}
      ref={id === 'personal' ? null : setNodeRef}
      style={id === 'personal' ? null : style}
    >
      <button
        id={id}
        type="button"
        className={`NavItem-Button toolbar-item__inner toolbar-item__inner_action ${id !== 'personal' && editorMode ? 'NavItem-Button_editing' : ''} ${isSelected && !editorMode ? 'toolbar-item__inner_active' : ''}`.trimEnd()}
        // TODO: screen reader announcements (when sections are implemented)
        onClick={!editorMode ? selectSection : null}
        role="tab"
        aria-label={`${capitalize(id)}`}
        aria-controls={`${id}-tabpanel`}
        aria-selected={isSelected}
        // To indicate that the tabbing functionality is disabled
        aria-disabled={editorMode}
        {...dragProps}
        onKeyUp={(e) => {
          if (
            e.key === 'ArrowDown' &&
            activeSectionIDs.length > 1 &&
            !isDragging
          ) {
            const i = activeSectionIDs.indexOf(id);
            if (i < activeSectionIDs.length - 1) {
              document.getElementById(activeSectionIDs[i + 1]).focus();
            } else {
              document.getElementById(activeSectionIDs[0]).focus();
            }
          } else if (
            e.key === 'ArrowUp' &&
            activeSectionIDs.length > 1 &&
            !isDragging
          ) {
            const i = activeSectionIDs.indexOf(id);
            if (i > 0) {
              document.getElementById(activeSectionIDs[i - 1]).focus();
            } else {
              document.getElementById(activeSectionIDs.at(-1)).focus();
            }
          }
        }}
      >
        <img
          src={iconSrc}
          alt={alt}
          width="25px"
          height="25px"
          className="toolbar-item__icon"
        />
      </button>

      {id !== 'personal' && (
        <button
          type="button"
          className={`NavItem-ControlBtn NavItem-ControlBtn_delete ${editorMode ? '' : 'NavItem-ControlBtn_disabled'}`.trimEnd()}
          onClick={() => {
            deleteSection();

            const i = activeSectionIDs.indexOf(id);

            // If there's only "Personal" left.
            if (activeSectionIDs.length === 2) {
              document.getElementById('edit-sections').focus();

              // If the deleted item wasn't the last in the array
            } else if (i < activeSectionIDs.length - 1) {
              document
                .getElementById(`delete-${activeSectionIDs[i + 1]}`)
                .focus();
            } else {
              document
                .getElementById(`delete-${activeSectionIDs[i - 1]}`)
                .focus();
            }
          }}
          id={`delete-${id}`}
          aria-label={`Delete ${id}`}
        >
          <img
            src={deleteSrc}
            alt="Delete"
            width="12px"
            height="12px"
            className="NavItem-ControlBtnIcon"
          />
        </button>
      )}
    </li>
  );
}
