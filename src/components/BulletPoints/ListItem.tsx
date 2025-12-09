import React from 'react';
import type { ChangeEvent, RefCallback } from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';

import deleteSrc from '@/assets/icons/delete.svg';
import dragSrc from '@/assets/icons/drag.svg';

import './BulletPoints.scss';

import type { ReadonlyDeep } from 'type-fest';

export interface ListItemProps {
  deleteItem: () => void;
  edit: (e: ChangeEvent<HTMLInputElement>) => void;
  id: string;
  index: number;
  name: string;
  placeholder?: string;
  setFirstTabbable?: RefCallback<HTMLButtonElement>;
  value: string;
}

/**
 * A list item (`<li>`) used in `BulletPoints`. Consists of a drag handle, an
 * input field and a delete button.
 */
export default function ListItem({
  deleteItem,
  edit,
  setFirstTabbable,
  id,
  index,
  name,
  placeholder,
  value,
}: ReadonlyDeep<ListItemProps>) {
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

  const listItemClassName = clsx([
    'BulletPoints-ListItem',
    isDragging && 'BulletPoints-ListItem_dragged',
  ]);

  return (
    <li className={listItemClassName} ref={setNodeRef} style={style}>
      <button
        aria-label={`Drag bullet point ${index + 1}`}
        className="BulletPoints-Button BulletPoints-Button_dragHandle"
        type="button"
        ref={(node) => {
          setActivatorNodeRef(node);
          if (setFirstTabbable !== undefined) setFirstTabbable(node);
        }}
        {...attributes}
        {...listeners}
      >
        <img alt="Drag" height="25px" src={dragSrc} width="25px" />
      </button>
      <input
        aria-label={`Bullet point ${index + 1}`}
        className="BulletPoints-Field"
        id={id}
        name={name}
        placeholder={placeholder || `Bullet point ${index + 1}`}
        type="text"
        value={value}
        onChange={edit}
      />
      <button
        aria-label={`Delete bullet point ${index + 1}`}
        className="BulletPoints-Button BulletPoints-Button_delete"
        id={`delete-${name}`}
        type="button"
        onClick={deleteItem}
      >
        <img alt="Delete" height="25px" src={deleteSrc} width="25px" />
      </button>
    </li>
  );
}
