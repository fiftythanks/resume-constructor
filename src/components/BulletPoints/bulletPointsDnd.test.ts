import {
  createBulletPointAnnouncements,
  reorderBulletPoints,
} from './bulletPointsDnd';

import type { ItemWithId } from '@/types/resumeData';
import type { Active, Over } from '@dnd-kit/core';

const ITEM_1_ID = '00000000-0000-0000-0000-000000000001';
const ITEM_2_ID = '00000000-0000-0000-0000-000000000002';
const ITEM_3_ID = '00000000-0000-0000-0000-000000000003';

const ITEMS: readonly ItemWithId[] = [
  { id: ITEM_1_ID, value: 'First bullet' },
  { id: ITEM_2_ID, value: 'Second bullet' },
  { id: ITEM_3_ID, value: 'Third bullet' },
];

function createActive(id: string): Active {
  return {
    data: { current: undefined },
    id,
    rect: { current: { initial: null, translated: null } },
  };
}

function createOver(id: string): Over {
  return {
    data: { current: undefined },
    disabled: false,
    id,
    rect: {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
    },
  };
}

describe('reorderBulletPoints', () => {
  it('should return `null` when `overId` is `null`', () => {
    const result = reorderBulletPoints(ITEMS, ITEM_1_ID, null);

    expect(result).toBeNull();
  });

  it('should return `null` when `activeId` and `overId` are identical', () => {
    const result = reorderBulletPoints(ITEMS, ITEM_1_ID, ITEM_1_ID);

    expect(result).toBeNull();
  });

  it('should return `null` when `activeId` or `overId` is not found in `data`', () => {
    const result = reorderBulletPoints(ITEMS, ITEM_1_ID, 'unknown-id');

    expect(result).toBeNull();
  });

  it('should return the reordered items when dragged to a different valid position', () => {
    const result = reorderBulletPoints(ITEMS, ITEM_1_ID, ITEM_3_ID);

    expect(result).toEqual([ITEMS[1], ITEMS[2], ITEMS[0]]);
  });
});

describe('createBulletPointAnnouncements', () => {
  it('should announce "Picked up draggable item [index + 1]." on drag start', () => {
    const announcements = createBulletPointAnnouncements(ITEMS);

    const message = announcements.onDragStart({
      active: createActive(ITEM_1_ID),
    });

    expect(message).toBe('Picked up draggable item 1.');
  });

  it('should return `undefined` on initial drag over the origin droppable area before moving away', () => {
    const announcements = createBulletPointAnnouncements(ITEMS);
    announcements.onDragStart({ active: createActive(ITEM_1_ID) });

    const message = announcements.onDragOver({
      active: createActive(ITEM_1_ID),
      over: createOver(ITEM_1_ID),
    });

    expect(message).toBeUndefined();
  });

  it('should announce "Draggable item [index + 1] was moved over droppable area [droppableIndex + 1]." when moved over another droppable area', () => {
    const announcements = createBulletPointAnnouncements(ITEMS);
    announcements.onDragStart({ active: createActive(ITEM_1_ID) });

    const message = announcements.onDragOver({
      active: createActive(ITEM_1_ID),
      over: createOver(ITEM_2_ID),
    });

    expect(message).toBe('Draggable item 1 was moved over droppable area 2.');
  });

  it('should announce "Draggable item [index + 1] was moved over droppable area [index + 1]." when moved back to its initial droppable area after moving away', () => {
    const announcements = createBulletPointAnnouncements(ITEMS);
    announcements.onDragStart({ active: createActive(ITEM_1_ID) });
    announcements.onDragOver({
      active: createActive(ITEM_1_ID),
      over: createOver(ITEM_2_ID),
    });

    const message = announcements.onDragOver({
      active: createActive(ITEM_1_ID),
      over: createOver(ITEM_1_ID),
    });

    expect(message).toBe('Draggable item 1 was moved over droppable area 1.');
  });

  it('should announce when the dragged item is no longer over any droppable area', () => {
    const announcements = createBulletPointAnnouncements(ITEMS);

    const message = announcements.onDragOver({
      active: createActive(ITEM_1_ID),
      over: null,
    });

    expect(message).toBe(
      'Draggable item 1 is no longer over a droppable area.',
    );
  });

  it('should announce "Draggable item [index + 1] was dropped over droppable area [droppableIndex + 1]" on drag end over a droppable area', () => {
    const announcements = createBulletPointAnnouncements(ITEMS);

    const message = announcements.onDragEnd({
      active: createActive(ITEM_1_ID),
      over: createOver(ITEM_1_ID),
    });

    expect(message).toBe('Draggable item 1 was dropped over droppable area 1');
  });

  it('should announce "Draggable item [index + 1] was dropped." when dropped outside any droppable area', () => {
    const announcements = createBulletPointAnnouncements(ITEMS);

    const message = announcements.onDragEnd({
      active: createActive(ITEM_1_ID),
      over: null,
    });

    expect(message).toBe('Draggable item 1 was dropped.');
  });

  it('should announce "Dragging was cancelled. Draggable item [index + 1] was put to its initial position." on drag cancel', () => {
    const announcements = createBulletPointAnnouncements(ITEMS);

    const message = announcements.onDragCancel({
      active: createActive(ITEM_1_ID),
      over: null,
    });

    expect(message).toBe(
      'Dragging was cancelled. Draggable item 1 was put to its initial position.',
    );
  });
});
