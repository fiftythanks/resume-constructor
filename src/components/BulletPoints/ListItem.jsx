/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import deleteSrc from '@/assets/icons/delete.svg';
import dragSrc from '@/assets/icons/drag.svg';

import './BulletPoints.scss';

export default function ListItem({ del, edit, id, index, name, value }) {
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
        className="BulletPoints-Field"
        label="Bullet Point"
        name={`${name}-${index}`}
        placeholder={`Bullet point ${index + 1}`}
        type="text"
        value={value}
        onChange={edit}
      />
      <button
        className="BulletPoints-Button BulletPoints-Button_delete"
        type="button"
        onClick={del}
      >
        <img alt="Delete" height="25px" src={deleteSrc} width="25px" />
      </button>
    </li>
  );
}
