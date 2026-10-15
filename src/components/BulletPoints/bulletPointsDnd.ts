import { arrayMove } from '@dnd-kit/sortable';

import type { ItemWithId } from '@/types/resumeData';
import type { Announcements, UniqueIdentifier } from '@dnd-kit/core';
import type { ReadonlyDeep } from 'type-fest';

export interface DragOriginState {
  current: boolean;
}

/**
 * Computes the reordered bullet points array when a drag operation finishes
 * over a different target item, or returns `null` when no reordering should
 * occur.
 */
export function reorderBulletPoints(
  data: ReadonlyDeep<ItemWithId[]>,
  activeId: UniqueIdentifier,
  overId: null | undefined | UniqueIdentifier,
): ItemWithId[] | null {
  if (overId === null || overId === undefined || activeId === overId) {
    return null;
  }

  const oldIndex = data.findIndex((item) => item.id === activeId);
  const newIndex = data.findIndex((item) => item.id === overId);

  if (oldIndex === -1 || newIndex === -1) {
    return null;
  }

  return arrayMove([...data], oldIndex, newIndex);
}

/**
 * Builds the `@dnd-kit/core` screen reader `announcements` configuration for a
 * list of bullet points.
 */
export function createBulletPointAnnouncements(
  data: ReadonlyDeep<ItemWithId[]>,
  wasDraggedAwayFromItsInitialPosition: DragOriginState = { current: false },
): Announcements {
  return {
    onDragCancel({ active }) {
      return `Dragging was cancelled. Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was put to its initial position.`;
    },

    onDragEnd({ active, over }) {
      if (over === null) {
        return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was dropped.`;
      }

      return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was dropped over droppable area ${data.findIndex((item) => item.id === over.id) + 1}`;
    },

    onDragOver({ active, over }) {
      if (over === null) {
        return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} is no longer over a droppable area.`;
      }

      if (
        active.id !== over.id ||
        wasDraggedAwayFromItsInitialPosition.current
      ) {
        /**
         * In case the draggable item is dragged over the area where it came
         * from, announce it only if the draggable item was dragged over some
         * other draggable area.
         *
         * This is necessary to make sure `onDragOver` doesn't lead to
         * announcing something like "Draggable item 1 was dragged over
         * area 1" right after the draggable item has just been picked up.
         */
        wasDraggedAwayFromItsInitialPosition.current = true;

        return `Draggable item ${data.findIndex((item) => item.id === active.id) + 1} was moved over droppable area ${data.findIndex((item) => item.id === over.id) + 1}.`;
      }
    },

    onDragStart({ active }) {
      wasDraggedAwayFromItsInitialPosition.current = false;

      return `Picked up draggable item ${data.findIndex((item) => item.id === active.id) + 1}.`;
    },
  };
}
