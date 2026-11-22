// It disallowed using `crypto`, which is well supported.
/* eslint-disable n/no-unsupported-features/node-builtins */

import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import BulletPoints from './BulletPoints';

import type { BulletPointsProps } from './BulletPoints';
import type { ItemWithId } from '@/types/resumeData';

const ITEMS: ItemWithId[] = [
  {
    id: crypto.randomUUID(),
    value: 'value 1',
  },
  {
    id: crypto.randomUUID(),
    value: 'value 2',
  },
  {
    id: crypto.randomUUID(),
    value: 'value 3',
  },
];

function getProps(overrides?: Partial<BulletPointsProps>): BulletPointsProps {
  return {
    addItem: () => {},
    data: structuredClone(ITEMS),
    deleteItem(_itemIndex: number) {},
    editItem(_itemIndex: number, _value: string) {},
    legend: 'Some Legend',
    name: 'some-name',
    placeholder1: 'Placeholder 1',
    placeholder2: 'Placeholder 2',
    placeholder3: 'Placeholder 3',
    updateData(_newData: ItemWithId[]) {},
    updateScreenReaderAnnouncement(_announcement: string) {},

    ...overrides,
  };
}

describe('BulletPoints', () => {
  it('should call `updateData` with the reordered bullet points when a bullet point is dragged and dropped onto another bullet point', async () => {
    // Arrange
    const updateDataMock = vi.fn((_newData: ItemWithId[]) => {});
    await render(
      <BulletPoints {...getProps({ updateData: updateDataMock })} />,
    );
    const user = userEvent.setup();

    const firstDragHandle = page.getByRole('button', {
      name: 'Drag bullet point 1',
    });
    const thirdDragHandle = page.getByRole('button', {
      name: 'Drag bullet point 3',
    });

    // Act
    await user.dragAndDrop(firstDragHandle, thirdDragHandle);

    // Assert
    expect(updateDataMock).toHaveBeenCalledTimes(1);
    expect(updateDataMock).toHaveBeenCalledWith([ITEMS[1], ITEMS[2], ITEMS[0]]);
  });
});
