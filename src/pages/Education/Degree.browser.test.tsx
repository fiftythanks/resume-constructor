/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Degree from './Degree';

import type { DegreeProps } from './Degree';
import type { DegreeFunctions } from './Education';
import type { Degree as DegreeType, ItemWithId } from '@/types/resumeData';

const DATA: DegreeType = {
  address: 'some address',
  degree: 'some degree',
  graduation: 'whenever',
  id: crypto.randomUUID(),
  uni: 'some university name',
  //! Must be no less than 3 for this test suite.
  bulletPoints: [
    {
      id: crypto.randomUUID(),
      value: 'bullet 1',
    },
    {
      id: crypto.randomUUID(),
      value: 'bullet 2',
    },
    {
      id: crypto.randomUUID(),
      value: 'bullet 3',
    },
  ],
};

type Field = 'address' | 'degree' | 'graduation' | 'uni';

const FUNCTIONS: DegreeFunctions = {
  addBulletPoint() {},
  deleteBulletPoint(_itemIndex: number) {},
  edit(_field: Field, _value: string) {},
  editBulletPoint(_itemIndex: number, _value: string) {},
  updateBulletPoints(_value: ItemWithId[]) {},
};

function getProps(overrides?: Partial<DegreeProps>): DegreeProps {
  return {
    data: structuredClone(DATA),
    firstFormFieldRef: { current: null },
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Degree', () => {
  describe('Bullet points', () => {
    it('should call `updateBulletPoints` with the reordered bullet points when a bullet point is dragged and dropped onto another bullet point', async () => {
      // ARRANGE
      const mockFn = vi.fn((_value: ItemWithId[]) => {});
      const functions = cloneDeep({ ...FUNCTIONS, updateBulletPoints: mockFn });

      await render(<Degree {...getProps({ functions })} />);
      const user = userEvent.setup();

      const firstDragHandle = page.getByRole('button', {
        name: 'Drag bullet point 1',
      });
      const thirdDragHandle = page.getByRole('button', {
        name: 'Drag bullet point 3',
      });

      // ACT
      await user.dragAndDrop(firstDragHandle, thirdDragHandle, { steps: 5 });

      // ASSERT
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith([
        DATA.bulletPoints[1],
        DATA.bulletPoints[2],
        DATA.bulletPoints[0],
      ]);
    });
  });
});
