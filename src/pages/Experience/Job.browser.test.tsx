/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Job from './Job';

import type { JobFunctions } from './Experience';
import type { JobProps } from './Job';
import type { ItemWithId, Job as JobData } from '@/types/resumeData';

const DATA: JobData = {
  address: 'some address',
  companyName: 'some name',
  duration: 'some duration',
  id: crypto.randomUUID(),
  jobTitle: 'some title',

  //! Must be no less than 3 for this test suite.
  bulletPoints: [
    {
      id: crypto.randomUUID(),
      value: 'Bullet point 1',
    },
    {
      id: crypto.randomUUID(),
      value: 'Bullet point 2',
    },
    {
      id: crypto.randomUUID(),
      value: 'Bullet point 3',
    },
  ],
};

const FUNCTIONS: JobFunctions = {
  addBulletPoint() {},
  deleteBulletPoint(_itemIndex: number) {},
  editBulletPoint(_itemIndex: number, _value: string) {},
  updateBulletPoints(_value: ItemWithId[]) {},

  edit(
    _field: 'address' | 'companyName' | 'duration' | 'jobTitle',
    _value: string,
  ) {},
};

function getProps(overrides?: Partial<JobProps>): JobProps {
  return {
    data: DATA,
    firstFormFieldRef: { current: null },
    functions: FUNCTIONS,
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Job', () => {
  describe('Bullet points', () => {
    it('should call `updateBulletPoints` with the reordered bullet points when a bullet point is dragged and dropped onto another bullet point', async () => {
      const mockFn = vi.fn((_value: ItemWithId[]) => {});
      const functions = cloneDeep(FUNCTIONS);
      functions.updateBulletPoints = mockFn;
      const props = getProps({ functions });
      await render(<Job {...props} />);
      const user = userEvent.setup();
      const firstDragHandle = page.getByRole('button', {
        name: 'Drag bullet point 1',
      });
      const thirdDragHandle = page.getByRole('button', {
        name: 'Drag bullet point 3',
      });

      await user.dragAndDrop(firstDragHandle, thirdDragHandle, { steps: 5 });

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith([
        DATA.bulletPoints[1],
        DATA.bulletPoints[2],
        DATA.bulletPoints[0],
      ]);
    });
  });
});
