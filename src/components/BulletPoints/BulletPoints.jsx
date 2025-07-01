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
  className,
  data,
  deleteItem,
  editItem,
  name,
  legend,
  updateData,
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
  return (
    <fieldset className={`${className} BulletPoints`.trimStart()}>
      <legend className="BulletPoints-Legend">{legend}</legend>
      <DndContext
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
              const del = () => deleteItem(index);
              const edit = (e) =>
                editItem(index, { ...data[index], value: e.target.value });
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
                  name={name}
                  value={value}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      <Button
        className="BulletPoints-Add"
        label={`Add ${capitalize(name)}`}
        modifiers={['Button_bulletPoints']}
        onClick={addItem}
      >
        Add
      </Button>
    </fieldset>
  );
}
