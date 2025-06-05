/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import './NavItem.scss';

export default function NavItem({ iconSrc, alt, isOpened, openSection, id }) {
  const openedModifier = isOpened ? 'NavItem-Btn_opened' : '';

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
      className="NavItem"
      ref={setNodeRef}
      // To display the dragged item on top of other items
      style={{
        zIndex: isDragging ? 1 : 0,
      }}
    >
      <button
        type="button"
        className={`NavItem-Btn ${openedModifier}`.trim()}
        onClick={openSection}
        // Drag and drop props
        style={style}
        aria-roledescription="draggable"
        aria-describedby={attributes['aria-describedby']}
        {...listeners}
        ref={setActivatorNodeRef}
      >
        <img
          src={iconSrc}
          alt={alt}
          width="25px"
          height="25px"
          className="NavItem-Icon"
        />
      </button>
    </li>
  );
}
