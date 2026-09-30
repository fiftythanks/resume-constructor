// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { SectionId } from '@/types/resumeData';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface DndAttributes {
  'aria-describedby': string;
  'aria-roledescription': string;
  listeners: SyntheticListenerMap | undefined;
  setActivatorNodeRef: ReturnType<typeof useSortable>['setActivatorNodeRef'];
}

interface UseNavbarItemSortableParams {
  isDraggable: boolean;
  isEditorMode: boolean;
  sectionId: SectionId;
}

interface UseNavbarItemSortableReturn {
  dndAttributes: DndAttributes | null;
  isDragging: boolean;
  setNodeRef: ReturnType<typeof useSortable>['setNodeRef'];
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
}: UseNavbarItemSortableParams): UseNavbarItemSortableReturn {
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

  const dndAttributes: DndAttributes | null =
    isDraggable && isEditorMode
      ? {
          setActivatorNodeRef,
          'aria-roledescription': 'draggable',
          'aria-describedby': attributes['aria-describedby'],
          listeners,
        }
      : null;

  return {
    dndAttributes,
    isDragging,
    setNodeRef,
    style,
  };
}
