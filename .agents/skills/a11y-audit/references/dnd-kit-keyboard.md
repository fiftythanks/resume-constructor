# Accessible Keyboard Drag & Drop with `@dnd-kit`

This reference documents the implementation of accessible keyboard navigation, sensors and screen reader live announcements for `@dnd-kit` sortable containers.

---

## 1. Sensor Configuration

To support keyboard reordering alongside pointer interactions, configure both `PointerSensor` and `KeyboardSensor` with `sortableKeyboardCoordinates`:

```tsx
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export const MySortableList = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid triggering drag on small clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext sensors={sensors} /* ... */>{/* Sortable items */}</DndContext>
  );
};
```

---

## 2. Keyboard Control Contracts

Every sortable item or drag handle must provide full keyboard operability:

| Key                        | Action                                                            |
| :------------------------- | :---------------------------------------------------------------- |
| `Space` or `Enter`         | Pick up item / drop item at current position                      |
| `ArrowUp` / `ArrowLeft`    | Move item up or left by one position                              |
| `ArrowDown` / `ArrowRight` | Move item down or right by one position                           |
| `Escape`                   | Cancel active drag operation and return item to original position |

---

## 3. Screen Reader Live Announcements

Assistive technology users must be informed of every phase of the drag operation. Dynamic announcements are piped through an `aria-live="polite"` region:

```tsx
const defaultAnnouncements = {
  onDragStart({ active }: DragStartEvent) {
    return `Picked up item "${active.data.current?.title}". Current position: ${active.data.current?.sortable.index + 1}. Press arrow keys to move, space or enter to drop, escape to cancel.`;
  },
  onDragOver({ active, over }: DragOverEvent) {
    if (!over) return '';
    return `Item "${active.data.current?.title}" moved to position ${over.data.current?.sortable.index + 1}.`;
  },
  onDragEnd({ active, over }: DragEndEvent) {
    if (!over) return `Dragging cancelled.`;
    return `Dropped item "${active.data.current?.title}" into position ${over.data.current?.sortable.index + 1}.`;
  },
  onDragCancel({ active }: DragCancelEvent) {
    return `Movement cancelled. Item "${active.data.current?.title}" returned to starting position.`;
  },
};
```

> [!IMPORTANT]
> Ensure all announcement strings adhere strictly to zero Oxford commas (zero instances of `, and` or `, or`).

---

## 4. Sortable Item DOM Attributes

Each draggable element must expose descriptive ARIA roles and attributes:

```tsx
import { useSortable } from '@dnd-kit/sortable';

export const SortableItem = ({ id, title }: ItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      className={`SortableItem ${isDragging ? 'SortableItem_is_dragging' : ''}`}
      aria-roledescription="sortable item"
      {...attributes}
      {...listeners}
    >
      <span className="SortableItem-Title">{title}</span>
    </li>
  );
};
```
