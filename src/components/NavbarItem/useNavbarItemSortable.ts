// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { SectionId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

interface DndAttributes {
  'aria-describedby': string;
  'aria-roledescription': string;
  ref: (element: HTMLElement | null) => void;
}

interface UseNavbarItemSortableParams {
  isDraggable: boolean;
  isEditorMode: boolean;
  sectionId: SectionId;
}

interface UseNavbarItemSortableReturn {
  dndAttributes: DndAttributes | Record<string, never>;
  isDragging: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  style: {
    transform: string | undefined;
    transition: string | undefined;
  };
}

/**
 * A custom hook for the `NavbarItem` component. It's function is providing the
 * component with drag-and-drop–enabling values.
 *
 * Enables drag-and-drop only when
 * `isDraggable === true && isEditorMode === true`.
 */
export default function useNavbarItemSortable({
  isDraggable,
  isEditorMode,
  sectionId,
}: ReadonlyDeep<UseNavbarItemSortableParams>): UseNavbarItemSortableReturn {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sectionId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dndAttributes =
    isDraggable && isEditorMode
      ? {
          'aria-roledescription': 'draggable',
          'aria-describedby': attributes['aria-describedby'],
          ref: setActivatorNodeRef,
          ...listeners,
        }
      : {};

  return {
    dndAttributes,
    isDragging,
    setNodeRef,
    style,
  };
}
