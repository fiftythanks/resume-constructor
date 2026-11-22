/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import useResumeData from '@/hooks/useResumeData';

import Experience from './Experience';

import type { ExperienceProps } from './Experience';
import type {
  Experience as ExperienceType,
  ItemWithId,
} from '@/types/resumeData';

const DATA: ExperienceType = {
  shownJobIndex: 0,

  //! Must be no less than 3 for this test suite.
  jobs: [
    {
      address: 'some address 1',
      companyName: 'some name 1',
      duration: 'some duration 1',
      id: crypto.randomUUID(),
      jobTitle: 'some title 1',
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
    },
    {
      address: 'some address 2',
      companyName: 'some name 2',
      duration: 'some duration 2',
      id: crypto.randomUUID(),
      jobTitle: 'some title 2',
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
    },
    {
      address: 'some address 3',
      companyName: 'some name 3',
      duration: 'some duration 3',
      id: crypto.randomUUID(),
      jobTitle: 'some title 3',
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
    },
  ],
};

type Field = 'address' | 'companyName' | 'duration' | 'jobTitle';

const FUNCTIONS: ReturnType<typeof useResumeData>['experienceFunctions'] = {
  addJob() {},
  deleteJob(_index: number) {},
  showJob(_newShownJobIndex: number) {},
  editJob(_index: number, _field: Field, _value: string) {},
  addBulletPoint(_jobIndex: number) {},
  editBulletPoint(_jobIndex: number, _itemIndex: number, _value: string) {},
  deleteBulletPoint(_jobIndex: number, _itemIndex: number) {},
  updateBulletPoints(_jobIndex: number, _value: ItemWithId[]) {},
};

function getProps(overrides?: Partial<ExperienceProps>): ExperienceProps {
  return {
    data: structuredClone(DATA),
    ref: { current: null },
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement) {},
    ...overrides,
  };
}

describe('Experience', () => {
  beforeEach(async () => {
    // `Experience` gets its accessible name from this element.
    await render(<div aria-label="Experience" id="experience" />);
  });

  describe('Shown job', () => {
    describe('Functions', () => {
      it('should call `updateBulletPoints` with the reordered bullet points when a bullet point of the job is dragged and dropped onto another bullet point', async () => {
        // ARRANGE
        const mockFn = vi.fn((_jobIndex: number, _value: ItemWithId[]) => {});

        const functions = cloneDeep({
          ...FUNCTIONS,
          updateBulletPoints: mockFn,
        });

        await render(<Experience {...getProps({ functions })} />);
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
        const { bulletPoints } = DATA.jobs[DATA.shownJobIndex];

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(DATA.shownJobIndex, [
          bulletPoints[1],
          bulletPoints[2],
          bulletPoints[0],
        ]);
      });
    });
  });
});
