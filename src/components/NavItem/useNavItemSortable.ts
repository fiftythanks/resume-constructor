// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { SectionId } from '@/types/resumeData';

type DragProps =
  | Record<string, never>
  | {
      'aria-describedby': string;
      'aria-roledescription': string;
      ref: (element: HTMLElement | null) => void;
    };

interface UseDragAndDropReturn {
  dragProps: DragProps;
  isDragging: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  style: {
    transform: string | undefined;
    transition: string | undefined;
  };
}

export default function useDragAndDrop(
  editorMode: boolean,
  id: SectionId,
): UseDragAndDropReturn {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  let dragProps;

  if (id === 'personal' || !editorMode) {
    dragProps = {};
  } else {
    dragProps = {
      'aria-roledescription': 'draggable',
      'aria-describedby': attributes['aria-describedby'],
      ref: setActivatorNodeRef,
      ...listeners,
    };
  }

  return {
    dragProps,
    isDragging,
    setNodeRef,
    style,
  };
}
