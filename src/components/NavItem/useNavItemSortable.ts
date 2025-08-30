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
  id: SectionId;
  isDraggable: boolean;
  isEditorMode: boolean;
}

type UseNavItemSortableReturn = null | {
  dndAttributes: DndAttributes;
  isDragging: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  style: {
    transform: string | undefined;
    transition: string | undefined;
  };
};

export default function useNavItemSortable({
  id,
  isDraggable,
  isEditorMode,
}: UseNavItemSortableParams): UseNavItemSortableReturn {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  if (!isEditorMode || !isDraggable) {
    return null;
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dndAttributes = {
    'aria-roledescription': 'draggable',
    'aria-describedby': attributes['aria-describedby'],
    ref: setActivatorNodeRef,
    ...listeners,
  };

  return {
    dndAttributes,
    isDragging,
    setNodeRef,
    style,
  };
}
