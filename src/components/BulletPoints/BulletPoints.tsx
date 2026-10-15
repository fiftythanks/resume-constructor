import { useRef, useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';

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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { clsx } from 'clsx';

import Button from '@/components/Button';

import {
  createBulletPointAnnouncements,
  reorderBulletPoints,
} from './bulletPointsDnd';
import ListItem from './ListItem';

import type { ItemWithId } from '@/types/resumeData';
import type { DragEndEvent } from '@dnd-kit/core';
import type { ReadonlyDeep } from 'type-fest';

import './BulletPoints.scss';

export interface BulletPointsProps {
  addItem: ReadonlyDeep<() => void>;
  className?: string;
  data: ReadonlyDeep<ItemWithId[]>;
  deleteItem: ReadonlyDeep<(itemIndex: number) => void>;
  editItem: ReadonlyDeep<(itemIndex: number, value: string) => void>;
  handleFocusOnFirstElement?: ReadonlyDeep<
    (e: FocusEvent<HTMLButtonElement>) => void
  >;
  handleKeyDownOnFirstElement?: ReadonlyDeep<(e: KeyboardEvent) => void>;
  itemName?: string;
  legend: string;
  legendCentralized?: boolean;
  name: string;
  placeholder1?: string;
  placeholder2?: string;
  placeholder3?: string;
  updateData: ReadonlyDeep<(newData: ItemWithId[]) => void>;
  updateScreenReaderAnnouncement: ReadonlyDeep<(announcement: string) => void>;
}

// TODO: explain the purpose of `legend` and `legendCentralized`. Why is it called a legend, anyway?
/**
 * Renders draggable-and-droppable bullet points for sections where bullet
 * points are used, e.g. "Education" or "Experience".
 *
 * @param itemName It's used for accessibility. The user will hear or read it.
 * @param name It's used like a form field name and is a part of some IDs.
 * @param updateData It's necessary for DnD functionality.
 */
export default function BulletPoints({
  addItem,
  className,
  data,
  deleteItem,
  editItem,
  itemName = 'bullet point',
  legend,
  legendCentralized = false,
  name,
  placeholder1,
  placeholder2,
  placeholder3,
  updateData,
  updateScreenReaderAnnouncement,
  handleKeyDownOnFirstElement,
  handleFocusOnFirstElement,
}: BulletPointsProps) {
  const [_, setIsDragging] = useState(false);
  const wasDraggedAwayFromItsInitialPosition = useRef(false);

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
    const newData = reorderBulletPoints(data, active.id, over?.id ?? null);

    if (newData !== null) {
      updateData(newData);
    }

    setIsDragging(false);
  }

  const announcements = createBulletPointAnnouncements(
    data,
    wasDraggedAwayFromItsInitialPosition,
  );

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
  // DILEMMA: Should I add text styling features to all fields in the app? Would be great to let users decide where they need bold text, where italic and where underlined. Also, interesting experience with adding text styling features in form fields.
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

                // FIXME: Replace `document.getElementById(...)!.focus()` with React refs and verify `node.isConnected` when deleting bullet points to prevent focus drops on unmounted elements.
                if (index < data.length - 1) {
                  // TODO: use refs!
                  document
                    .getElementById(`delete-${name}-${index + 1}`)!
                    .focus();
                } else if (index === 0) {
                  // TODO: use refs!
                  document.getElementById(`add-${name}`)!.focus();
                } else {
                  // TODO: use refs!
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
                  handleFocusOnFirstElement={(e) => {
                    if (
                      index !== 0 ||
                      handleFocusOnFirstElement === undefined
                    ) {
                      return;
                    }

                    handleFocusOnFirstElement(e);
                  }}
                  handleKeyDownOnFirstElement={(e) => {
                    if (
                      index !== 0 ||
                      handleKeyDownOnFirstElement === undefined
                    ) {
                      return;
                    }

                    handleKeyDownOnFirstElement(e);
                  }}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      <Button
        aria-label={`Add ${itemName}`}
        className="BulletPoints-Add"
        id={`add-${name}`}
        modifiers={['Button_size_smallest', 'Button_width_medium']}
        // TODO: add a screen reader announcement "A new bullet point was added".
        onClick={addItem}
      >
        Add
      </Button>
    </fieldset>
  );
}
