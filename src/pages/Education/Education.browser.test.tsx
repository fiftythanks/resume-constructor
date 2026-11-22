/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import useResumeData from '@/hooks/useResumeData';

import Education from './Education';

import type { EducationProps } from './Education';
import type {
  Education as EducationType,
  ItemWithId,
} from '@/types/resumeData';

const DATA: EducationType = {
  shownDegreeIndex: 0,
  //! Must be no less than 3 for this test suite.
  degrees: [
    {
      address: 'some address 1',
      degree: 'some degree 1',
      graduation: 'whenever 1',
      id: crypto.randomUUID(),
      uni: 'some university name 1',
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
    },
    {
      address: 'some address 2',
      degree: 'some degree 2',
      graduation: 'whenever 2',
      id: crypto.randomUUID(),
      uni: 'some university name 2',
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
    },
    {
      address: 'some address 3',
      degree: 'some degree 3',
      graduation: 'whenever 3',
      id: crypto.randomUUID(),
      uni: 'some university name 3',
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
    },
  ],
};

type Field = 'address' | 'degree' | 'graduation' | 'uni';

const FUNCTIONS: ReturnType<typeof useResumeData>['educationFunctions'] = {
  addBulletPoint(_degreeIndex: number) {},
  addDegree() {},
  deleteBulletPoint(_degreeIndex: number, _bulletIndex: number) {},
  deleteDegree(_index: number) {},
  editBulletPoint(_degreeIndex: number, _itemIndex: number, _value: string) {},
  editDegree(_index: number, _field: Field, _value: string) {},
  showDegree(_newShownJobIndex: number) {},
  updateBulletPoints(_degreeIndex: number, _value: ItemWithId[]) {},
};

function getProps(overrides?: Partial<EducationProps>): EducationProps {
  return {
    data: structuredClone(DATA),
    ref: { current: null },
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Education', () => {
  beforeEach(async () => {
    // `Education` gets its accessible name from this element.
    await render(<div aria-label="Education" id="education" />);
  });

  describe('Shown degree', () => {
    describe('Functions', () => {
      it('should call `updateBulletPoints` with the reordered bullet points when a bullet point of the degree is dragged and dropped onto another bullet point', async () => {
        // ARRANGE
        const mockFn = vi.fn(
          (_degreeIndex: number, _value: ItemWithId[]) => {},
        );

        const functions = cloneDeep({
          ...FUNCTIONS,
          updateBulletPoints: mockFn,
        });

        await render(<Education {...getProps({ functions })} />);
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
        const { bulletPoints } = DATA.degrees[DATA.shownDegreeIndex];

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(DATA.shownDegreeIndex, [
          bulletPoints[1],
          bulletPoints[2],
          bulletPoints[0],
        ]);
      });
    });
  });
});
