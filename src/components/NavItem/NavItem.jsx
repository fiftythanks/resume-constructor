/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import capitalize from '@utils/capitalize';

import dragSrc from '@icons/drag.svg';
import deleteSrc from '@icons/delete.svg';

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

  return (
    <li
      className={`NavItem toolbar-item ${className} ${isDragging ? 'NavItem_dragged' : ''}`.trimEnd()}
      ref={id === 'personal' ? null : setNodeRef}
      style={id === 'personal' ? null : style}
    >
      {id === 'personal' ? null : (
        <button
          type="button"
          className={`NavItem-ControlBtn NavItem-ControlBtn_drag ${editorMode ? '' : 'NavItem-ControlBtn_disabled'}`.trimEnd()}
          // Drag and drop props
          aria-roledescription="draggable"
          aria-describedby={attributes['aria-describedby']}
          {...listeners}
          ref={setActivatorNodeRef}
        >
          <img
            src={dragSrc}
            alt="Drag"
            width="21px"
            height="25px"
            className="NavItem-ControlBtnIcon"
          />
        </button>
      )}

      <button
        type="button"
        className={`NavItem-Button toolbar-item__inner ${editorMode ? '' : 'toolbar-item__inner_action '}${isSelected ? 'toolbar-item__inner_active' : ''}`.trimEnd()}
        onClick={editorMode ? null : selectSection}
        role="tab"
        aria-label={`${capitalize(id)}`}
        aria-controls={`${id}-tabpanel`}
        aria-selected={isSelected}
      >
        <img
          src={iconSrc}
          alt={alt}
          width="25px"
          height="25px"
          className="toolbar-item__icon"
        />
      </button>

      {id === 'personal' ? null : (
        <button
          type="button"
          className={`NavItem-ControlBtn NavItem-ControlBtn_delete ${editorMode ? '' : 'NavItem-ControlBtn_disabled'}`.trimEnd()}
          onClick={deleteSection}
        >
          <img
            src={deleteSrc}
            alt="Delete"
            width="25px"
            height="25px"
            className="NavItem-ControlBtnIcon"
          />
        </button>
      )}
    </li>
  );
}
