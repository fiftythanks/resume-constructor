// It disallowed using `crypto`, which is well supported.
/* eslint-disable n/no-unsupported-features/node-builtins */
import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

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

const NAME = 'some-name';
const CAPITALIZED_NAME = 'Some-name';

function getProps(overrides?: Partial<BulletPointsProps>): BulletPointsProps {
  return {
    addItem: () => {},
    data: ITEMS,
    legend: 'Some Legend',
    name: NAME,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteItem(itemIndex: number) {},

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editItem(itemIndex: number, value: string) {},

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateData(newData: ItemWithId[]) {},

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateScreenReaderAnnouncement(announcement: string) {},

    ...overrides,
  };
}

describe('BulletPoints', () => {
  it('should render bullet points for each item in `data`', () => {
    render(<BulletPoints {...getProps()} />);

    ITEMS.forEach(({ id }, i) => {
      const inputField = screen.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      expect(inputField).toBeInTheDocument();
      expect(inputField.id).toBe(id);
    });
  });

  it('should have no more bullet points than there are items', () => {
    render(<BulletPoints {...getProps()} />);

    const bulletPoints = screen.getByTestId('bullet-points');

    expect(bulletPoints.children).toHaveLength(ITEMS.length);
  });

  it('should render an add button with an accessible name "Add [capitalized `name`]"', () => {
    render(<BulletPoints {...getProps()} />);

    const addBtn = screen.getByRole('button', {
      name: `Add ${CAPITALIZED_NAME}`,
    });

    expect(addBtn).toBeInTheDocument();
  });
});
