/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import '@blocks/toolbar-item.scss';

export default function NavItem({
  iconSrc,
  alt,
  isOpened,
  openSection,
  id,
  className,
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
      className={`${className} toolbar-item`}
      ref={setNodeRef}
      // To display the dragged item on top of other items
      style={{
        zIndex: isDragging ? 1 : 0,
      }}
    >
      <button
        type="button"
        className={`toolbar-item__inner toolbar-item__inner_action ${isOpened ? 'toolbar-item__inner_active' : ''}`.trim()}
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
          className="toolbar-item__icon"
        />
      </button>
    </li>
  );
}
