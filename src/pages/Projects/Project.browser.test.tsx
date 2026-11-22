/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Project from './Project';

import type { ProjectProps } from './Project';
import type { ItemWithId } from '@/types/resumeData';

function getProps(overrides?: Partial<ProjectProps>): ProjectProps {
  return {
    firstFormFieldRef: { current: null },
    updateScreenReaderAnnouncement(_announcement: string) {},
    data: {
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
      code: {
        link: 'Code link URL',
        text: 'Code link text',
      },
      demo: {
        link: 'Demo link URL',
        text: 'Demo link text',
      },
      id: crypto.randomUUID(),
      projectName: 'Project Name',
      stack: 'The best stack',
    },
    functions: {
      addBulletPoint() {},
      deleteBulletPoint(_itemIndex: number) {},
      editBulletPoint(_itemIndex: number, _value: string) {},

      editLink(
        _field: 'code' | 'demo',
        _type: 'link' | 'text',
        _value: string,
      ) {},

      editText(_field: 'projectName' | 'stack', _value: string) {},
      updateBulletPoints(_value: ItemWithId[]) {},
    },
    ...overrides,
  };
}

describe('Project', () => {
  describe('Bullet points', () => {
    it('should call `updateBulletPoints` with the reordered bullet points when a bullet point is dragged and dropped onto another bullet point', async () => {
      // ARRANGE
      const updateBulletPointsMock = vi.fn((_value: ItemWithId[]) => {});
      const props = getProps();

      await render(
        <Project
          {...props}
          functions={{
            ...props.functions,
            updateBulletPoints: updateBulletPointsMock,
          }}
        />,
      );

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
      expect(updateBulletPointsMock).toHaveBeenCalledTimes(1);
      expect(updateBulletPointsMock).toHaveBeenCalledWith([
        props.data.bulletPoints[1],
        props.data.bulletPoints[2],
        props.data.bulletPoints[0],
      ]);
    });
  });
});
