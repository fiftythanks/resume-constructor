/* eslint-disable perfectionist/sort-imports */
import React, { useState } from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import Button from '@/components/Button';
import ListItem from './ListItem';

import capitalize from '@/utils/capitalize';

import './BulletPoints.scss';

export default function BulletPoints({
  addItem,
  className = '',
  data,
  deleteItem,
  editItem,
  name,
  legend,
  legendCentralized = false,
  placeholder1 = null,
  placeholder2 = null,
  placeholder3 = null,
  updateData,
  updateScreenReaderAnnouncement,
}) {
  // eslint-disable-next-line no-unused-vars
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart() {
    setIsDragging(true);
  }

  function handleDragEnd(e) {
    const { active, over } = e;

    if (active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);
      const newData = arrayMove(data, oldIndex, newIndex);
      updateData(newData);
    }

    setIsDragging(false);
  }

  // Screen reader announcements.
  const announcements = {
    onDragStart({ active }) {
      return `Picked up draggable item ${data.findIndex((item) => item.id === active.id) + 1}.`;
    },
    onDragOver({ active, over }) {
      if (over) {
        return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was moved over droppable area ${data.findIndex((item) => item.id === over.id) + 1}.`;
      }

      return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} is no longer over a droppable area.`;
    },
    onDragEnd({ active, over }) {
      if (over) {
        return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was dropped over droppable area ${data.findIndex((item) => item.id === over.id) + 1}`;
      }

      return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was dropped.`;
    },
    onDragCancel({ active }) {
      return `Dragging was cancelled. Draggable item $${data.findIndex((item) => item.id === active.id) + 1} was dropped.`;
    },
  };
  return (
    <fieldset
      className={`${className} BulletPoints ${data.length === 0 ? 'BulletPoints_empty' : ''}`.trim()}
    >
      <legend
        className={`BulletPoints-Legend${legendCentralized ? ' BulletPoints-Legend_centralized' : ''}`}
      >
        {legend}
      </legend>
      <DndContext
        accessibility={{ announcements }}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext
          items={data.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="BulletPoints-List">
            {data.map((item, index) => {
              const { id, value } = item;
              const del = () => {
                deleteItem(index);
                updateScreenReaderAnnouncement(
                  `Bullet Point ${index + 1} was deleted.`,
                );

                if (index < data.length - 1) {
                  document
                    .getElementById(`delete-${name}-${index + 1}`)
                    .focus();
                } else if (index === 0) {
                  document.getElementById(`add-${name}`).focus();
                } else {
                  document
                    .getElementById(`delete-${name}-${index - 1}`)
                    .focus();
                }
              };
              const edit = (e) =>
                editItem(index, { ...data[index], value: e.target.value });

              let placeholder = null;

              if (index >= 0 && index <= 2) {
                switch (index) {
                  case 0:
                    placeholder = placeholder1;
                    break;
                  case 1:
                    placeholder = placeholder2;
                    break;
                  case 2:
                    placeholder = placeholder3;
                    break;
                  default:
                  // do nothing
                }
              }
              return (
                /**
                 * It's separated into its own component because this
                 * way works better with `dnd-kit`.
                 */
                <ListItem
                  del={del}
                  edit={edit}
                  id={id}
                  index={index}
                  key={id}
                  name={`${name}-${index}`}
                  placeholder={placeholder}
                  value={value}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      <Button
        aria-label={`Add ${capitalize(name)}`}
        className="BulletPoints-Add"
        id={`add-${name}`}
        modifiers={['Button_paddingInline_large']}
        onClick={addItem}
      >
        Add
      </Button>
    </fieldset>
  );
}
