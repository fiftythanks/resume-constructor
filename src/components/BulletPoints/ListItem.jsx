/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import deleteSrc from '@/assets/icons/delete.svg';
import dragSrc from '@/assets/icons/drag.svg';

import './BulletPoints.scss';

export default function ListItem({
  del,
  edit,
  id,
  index,
  name,
  placeholder = null,
  value,
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      className={`BulletPoints-ListItem${isDragging ? ' BulletPoints-ListItem_dragged' : ''}`}
      ref={setNodeRef}
      style={style}
    >
      <button
        className="BulletPoints-Button BulletPoints-Button_dragHandle"
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
      >
        <img alt="Drag" height="25px" src={dragSrc} width="25px" />
      </button>
      <input
        aria-label={`Bullet point ${index + 1}`}
        className="BulletPoints-Field"
        name={name}
        placeholder={placeholder || `Bullet point ${index + 1}`}
        type="text"
        value={value}
        onChange={edit}
      />
      <button
        aria-label={`Delete Bullet Point ${index + 1}`}
        className="BulletPoints-Button BulletPoints-Button_delete"
        id={`delete-${name}`}
        type="button"
        onClick={del}
      >
        <img alt="Delete" height="25px" src={deleteSrc} width="25px" />
      </button>
    </li>
  );
}
