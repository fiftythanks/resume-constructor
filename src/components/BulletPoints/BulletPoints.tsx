import React, { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

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
import { clsx } from 'clsx';

import Button from '@/components/Button';

import capitalize from '@/utils/capitalize';

import ListItem from './ListItem';

import './BulletPoints.scss';

import type { ItemWithId } from '@/types/resumeData';
import type { Active, DragEndEvent, Over } from '@dnd-kit/core';
import type { ReadonlyDeep } from 'type-fest';

// FIXME: the `name` prop is used in several incompatible ways: it's used as a kind of ID and it's also used as an ARIA label. I'm struggling to understand the purpose of using `name` here at all. This issue needs a serious reconsideration and refactor.

export interface BulletPointsProps {
  addItem: () => void;
  className?: string;
  data: ItemWithId[];
  deleteItem: (itemIndex: number) => void;
  editItem: (itemIndex: number, value: string) => void;
  legend: string;
  legendCentralized?: boolean;
  name: string;
  placeholder1?: string;
  placeholder2?: string;
  placeholder3?: string;
  updateData: (newData: ItemWithId[]) => void;
  updateScreenReaderAnnouncement: (announcement: string) => void;
}

// TODO: explain the purpose of `legend` and `legendCentralized`. Why is it called a legend, anyway?
/**
 * Renders draggable-and-droppable bullet points for sections where bullet
 * points are used, e.g. "Education" or "Experience".
 */
export default function BulletPoints({
  addItem,
  className,
  data,
  deleteItem,
  editItem,
  legend,
  legendCentralized = false,
  name,
  placeholder1,
  placeholder2,
  placeholder3,
  updateData,
  updateScreenReaderAnnouncement,
}: ReadonlyDeep<BulletPointsProps>) {
  const [_, setIsDragging] = useState(false);
  const wasDraggedAwayFromItsInitialPositionRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart() {
    setIsDragging(true);
  }

  function handleDragEnd(e: ReadonlyDeep<DragEndEvent>) {
    const { active, over } = e;

    if (over !== null && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);
      const newData = arrayMove([...data], oldIndex, newIndex);
      updateData(newData);
    }

    setIsDragging(false);
  }

  // Screen reader announcements.
  interface Arguments {
    active: Active;
    over: null | Over;
  }

  const announcements = {
    onDragStart({ active }: ReadonlyDeep<Pick<Arguments, 'active'>>) {
      wasDraggedAwayFromItsInitialPositionRef.current = false;

      return `Picked up draggable item ${data.findIndex((item) => item.id === active.id) + 1}.`;
    },

    onDragOver({ active, over }: ReadonlyDeep<Arguments>) {
      if (over !== null) {
        /**
         * In case the draggable item is dragged over the area where it came
         * from, announce it only if the draggable item was dragged over some
         * other draggable area.
         *
         * This is necessary to make sure `onDragOver` doesn't lead to
         * announcing something like "Draggable item 1 was dragged over
         * area 1" right after the draggable item has just been picked up.
         */
        if (
          active.id !== over.id ||
          wasDraggedAwayFromItsInitialPositionRef.current
        ) {
          wasDraggedAwayFromItsInitialPositionRef.current = true;

          return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was moved over droppable area ${data.findIndex((item) => item.id === over.id) + 1}.`;
        }
      } else {
        return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} is no longer over a droppable area.`;
      }
    },

    onDragEnd({ active, over }: ReadonlyDeep<Arguments>) {
      if (over !== null) {
        return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was dropped over droppable area ${data.findIndex((item) => item.id === over.id) + 1}`;
      }

      return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was dropped.`;
    },

    onDragCancel({ active }: ReadonlyDeep<Pick<Arguments, 'active'>>) {
      return `Dragging was cancelled. Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was put to its initial position.`;
    },
  };

  const bulletPointsClassName = clsx([
    className,
    'BulletPoints',
    data.length === 0 && 'BulletPoints_empty',
  ]);

  const legendClassName = clsx([
    'BulletPoints-Legend',
    legendCentralized && 'BulletPoints-Legend_centralized',
  ]);

  // TODO: add the possibility of creating sub-bullet points.
  // TODO: add the possibility of making text bold (italic? underlined?).
  // ? Should I add text styling features to all fields in the app? Would be great to let users decide where they need bold text, where italic and where underlined. Also, interesting experience with adding text styling features in form fields.
  return (
    <fieldset className={bulletPointsClassName}>
      <legend className={legendClassName}>{legend}</legend>
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
          <ul className="BulletPoints-List" data-testid="bullet-points">
            {data.map((item, index) => {
              const { id, value } = item;

              const del = () => {
                deleteItem(index);

                updateScreenReaderAnnouncement(
                  `Bullet point ${index + 1} was deleted.`,
                );

                if (index < data.length - 1) {
                  document
                    .getElementById(`delete-${name}-${index + 1}`)!
                    .focus();
                } else if (index === 0) {
                  document.getElementById(`add-${name}`)!.focus();
                } else {
                  document
                    .getElementById(`delete-${name}-${index - 1}`)!
                    .focus();
                }
              };

              const edit = (e: ChangeEvent<HTMLInputElement>) =>
                // FIXME: index, itemIndex or i? Decide already!
                editItem(index, e.target.value);

              let placeholder: string | undefined;

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
                 * way it works better with `dnd-kit`.
                 */
                <ListItem
                  deleteItem={del}
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
        // TODO: add a screen reader announcement "A new bullet point was added".
        onClick={addItem}
      >
        Add
      </Button>
    </fieldset>
  );
}
