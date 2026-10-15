/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Projects from './Projects';

import type { ProjectsProps } from './Projects';
import type { ItemWithId } from '@/types/resumeData';

function getProps(overrides?: Partial<ProjectsProps>): ProjectsProps {
  return {
    updateScreenReaderAnnouncement(_announcement: string) {},
    data: {
      shownProjectIndex: 0,
      projects: [
        {
          id: crypto.randomUUID(),
          projectName: 'Project 1 Name',
          stack: 'The best stack 1',
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
            link: 'Code 1 link URL',
            text: 'Code 1 link text',
          },
          demo: {
            link: 'Demo 1 link URL',
            text: 'Demo 1 link text',
          },
        },
        {
          id: crypto.randomUUID(),
          projectName: 'Project 2 Name',
          stack: 'The best stack 2',
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
            link: 'Code 2 link URL',
            text: 'Code 2 link text',
          },
          demo: {
            link: 'Demo 2 link URL',
            text: 'Demo 2 link text',
          },
        },
        {
          id: crypto.randomUUID(),
          projectName: 'Project 3 Name',
          stack: 'The best stack 3',
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
            link: 'Code 3 link URL',
            text: 'Code 3 link text',
          },
          demo: {
            link: 'Demo 3 link URL',
            text: 'Demo 3 link text',
          },
        },
      ],
    },
    ref: { current: null },
    functions: {
      addBulletPoint(_projectIndex: number) {},
      addProject() {},
      deleteProject(_index: number) {},
      deleteBulletPoint(_projectIndex: number, _itemIndex: number) {},
      showProject(_newShownProjectIndex: number) {},
      updateBulletPoints(_projectIndex: number, _value: ItemWithId[]) {},
      editBulletPoint(
        _projectIndex: number,
        _itemIndex: number,
        _value: string,
      ) {},
      editProjectLink(
        _index: number,
        _field: 'code' | 'demo',
        _type: 'link' | 'text',
        _value: string,
      ) {},
      editProjectText(
        _index: number,
        _field: 'projectName' | 'stack',
        _value: string,
      ) {},
    },
    ...overrides,
  };
}

describe('Projects', () => {
  describe('Shown project', () => {
    it('should call `updateBulletPoints` with the reordered bullet points when a bullet point of the project is dragged and dropped onto another bullet point', async () => {
      // ARRANGE
      await render(<div aria-label="Projects" id="projects" />);
      const updateBulletPointsMock = vi.fn(
        (_projectIndex: number, _value: ItemWithId[]) => {},
      );
      let props = getProps();

      props = {
        ...props,
        functions: {
          ...props.functions,
          updateBulletPoints: updateBulletPointsMock,
        },
      };

      await render(<Projects {...props} />);
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
      const { shownProjectIndex } = props.data;
      const { bulletPoints } = props.data.projects[shownProjectIndex];

      expect(updateBulletPointsMock).toHaveBeenCalledTimes(1);
      expect(updateBulletPointsMock).toHaveBeenCalledWith(shownProjectIndex, [
        bulletPoints[1],
        bulletPoints[2],
        bulletPoints[0],
      ]);
    });
  });
});
