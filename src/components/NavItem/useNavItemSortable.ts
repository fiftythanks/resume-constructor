// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { SectionId } from '@/types/resumeData';

interface DndAttributes {
  'aria-describedby': string;
  'aria-roledescription': string;
  ref: (element: HTMLElement | null) => void;
}

interface UseNavItemSortableParams {
  isDraggable: boolean;
  isEditorMode: boolean;
  sectionId: SectionId;
}

interface UseNavItemSortableReturn {
  dndAttributes: DndAttributes | Record<string, never>;
  isDragging: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  style: {
    transform: string | undefined;
    transition: string | undefined;
  };
}

// TODO: add JSDoc.
export default function useNavItemSortable({
  isDraggable,
  isEditorMode,
  sectionId,
}: UseNavItemSortableParams): UseNavItemSortableReturn {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sectionId, disabled: isDraggable && isEditorMode });

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
