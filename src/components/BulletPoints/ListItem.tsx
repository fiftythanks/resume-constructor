import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';

import Button from '../Button';

import deleteSrc from '@/assets/icons/delete.svg';
import dragSrc from '@/assets/icons/drag.svg';

import type { ReadonlyDeep } from 'type-fest';

import './BulletPoints.scss';

export interface ListItemProps {
  deleteItem: ReadonlyDeep<() => void>;
  edit: ReadonlyDeep<(e: ChangeEvent<HTMLInputElement>) => void>;
  handleFocusOnFirstElement?: ReadonlyDeep<
    (e: FocusEvent<HTMLButtonElement>) => void
  >;
  handleKeyDownOnFirstElement?: ReadonlyDeep<(e: KeyboardEvent) => void>;
  id: string;
  index: number;
  name: string;
  placeholder?: string;
  value: string;
}

/**
 * A list item (`<li>`) used in `BulletPoints`. Consists of a drag handle, an
 * input field and a delete button.
 */
export default function ListItem({
  deleteItem,
  edit,
  id,
  index,
  name,
  handleFocusOnFirstElement,
  handleKeyDownOnFirstElement,
  placeholder,
  value,
}: ListItemProps) {
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

  const dragHandle = {
    handleFocus: (e: FocusEvent<HTMLButtonElement, Element>) => {
      if (handleFocusOnFirstElement === undefined) return;

      handleFocusOnFirstElement(e);
    },
    listeners: {
      ...listeners,
      onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
        if (handleKeyDownOnFirstElement !== undefined) {
          handleKeyDownOnFirstElement(e);
        }

        listeners?.onKeyDown?.(e);
      },
    },
  };

  return (
    <li className={listItemClassName} ref={setNodeRef} style={style}>
      <Button
        aria-label={`Drag bullet point ${index + 1}`}
        ref={setActivatorNodeRef}
        onFocus={dragHandle.handleFocus}
        {...attributes}
        {...dragHandle.listeners}
        modifiers={[
          'Button_shape_square',
          'Button_size_smallest',
          'Button_background_none',
        ]}
      >
        <img alt="Drag" height="25px" src={dragSrc} width="25px" />
      </Button>
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
      <Button
        aria-label={`Delete bullet point ${index + 1}`}
        className="BulletPoints-Button BulletPoints-Button_delete"
        id={`delete-${name}`}
        onClick={deleteItem}
        modifiers={[
          'Button_shape_square',
          'Button_size_smallest',
          'Button_background_none',
        ]}
      >
        <img alt="Delete" height="25px" src={deleteSrc} width="25px" />
      </Button>
    </li>
  );
}
