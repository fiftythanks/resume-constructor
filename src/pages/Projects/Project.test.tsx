/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import type { RefObject } from 'react';

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
  it('should assign the Project Name input field to `firstFormFieldRef.current`', async () => {
    const firstFormFieldRef: RefObject<HTMLInputElement | null> = {
      current: null,
    };
    await render(<Project {...getProps({ firstFormFieldRef })} />);

    const projectNameField = page.getByRole('textbox', {
      name: 'Project Name',
    });

    expect(firstFormFieldRef.current).toBe(projectNameField.element());
  });

  describe('Project Name', () => {
    it('should render a text input for Project Name', async () => {
      await render(<Project {...getProps()} />);

      const input = page.getByRole('textbox', { name: 'Project Name' });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "TravelPlanner" for Project Name', async () => {
      await render(<Project {...getProps()} />);

      const input = page.getByRole('textbox', {
        name: 'Project Name',
      });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', 'TravelPlanner');
    });

    it('should have the correct value from `data` for Project Name', async () => {
      const props = getProps();
      await render(<Project {...props} />);

      const input = page.getByRole('textbox', {
        name: 'Project Name',
      });

      await expect.element(input).toHaveValue(props.data.projectName);
    });

    it('should call `editText` on Project Name change via the corresponding text input', async () => {
      const editTextMock = vi.fn(
        (_field: 'projectName' | 'stack', _value: string) => {},
      );

      await render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, editText: editTextMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = page.getByRole('textbox', { name: 'Project Name' });

      await user.type(input, 's');

      expect(editTextMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tech Stack', () => {
    it('should render a text input for Tech Stack', async () => {
      await render(<Project {...getProps()} />);

      const input = page.getByRole('textbox', { name: 'Tech Stack' });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "HTML, CSS, React, TypeScript, Redux, Bootstrap, Express.js, PostgreSQL" for Tech Stack', async () => {
      await render(<Project {...getProps()} />);

      const input = page.getByRole('textbox', {
        name: 'Tech Stack',
      });

      await expect
        .element(input)
        .toHaveAttribute(
          'placeholder',
          'HTML, CSS, React, TypeScript, Redux, Bootstrap, Express.js, PostgreSQL',
        );
    });

    it('should have the correct value from `data` for Tech Stack', async () => {
      const props = getProps();
      await render(<Project {...props} />);

      const input = page.getByRole('textbox', {
        name: 'Tech Stack',
      });

      await expect.element(input).toHaveValue(props.data.stack);
    });

    it('should call `editText` on Tech Stack change via the corresponding text input', async () => {
      const editTextMock = vi.fn(
        (_field: 'projectName' | 'stack', _value: string) => {},
      );

      await render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, editText: editTextMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = page.getByRole('textbox', { name: 'Tech Stack' });

      await user.type(input, 's');

      expect(editTextMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Bullet points', () => {
    it('should render bullet points with an accessible name "Bullet Points"', async () => {
      await render(<Project {...getProps()} />);

      const bulletPoints = page.getByRole('group', { name: 'Bullet Points' });

      await expect.element(bulletPoints).toBeInTheDocument();
    });

    it('should pass the correct data from `data` to the bullet points', async () => {
      const props = getProps();
      await render(<Project {...props} />);
      const bulletPoints = page.getByRole('group', { name: 'Bullet Points' });

      for (let i = 0; i < props.data.bulletPoints.length; i++) {
        const { id, value } = props.data.bulletPoints[i];

        const input = bulletPoints.getByRole('textbox', {
          name: `Bullet point ${i + 1}`,
        });

        await expect.element(input).toHaveAttribute('id', id);
        await expect.element(input).toHaveValue(value);
      }
    });

    it('should have placeholders "Developed a user-friendly web application for travel planning, allowing users to create and manage their itineraries.", "Utilized Redux for state management, enabling efficient data flow and improved application performance.", "Designed RESTful APIs using Node.js and Express.js, facilitating data retrieval and storage from the PostgreSQL database." for the first 3 bullet points', async () => {
      await render(<Project {...getProps()} />);
      const bulletPoints = page.getByRole('group', { name: 'Bullet Points' });

      const placeholders = [
        'Developed a user-friendly web application for travel planning, allowing users to create and manage their itineraries.',
        'Utilized Redux for state management, enabling efficient data flow and improved application performance.',
        'Designed RESTful APIs using Node.js and Express.js, facilitating data retrieval and storage from the PostgreSQL database.',
      ];

      for (let i = 0; i < 3; i++) {
        const node = bulletPoints.getByRole('textbox', {
          name: `Bullet point ${i + 1}`,
        });
        await expect
          .element(node)
          .toHaveAttribute('placeholder', placeholders[i]);
      }
    });

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

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to the bullet points via the corresponding controls (not DnD related)', async () => {
      const updateScreenReaderAnnouncementMock = vi.fn(
        (_announcement: string) => {},
      );

      const props = getProps({
        updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
      });

      await render(<Project {...props} />);
      const user = userEvent.setup();
      const bulletPoints = page.getByRole('group', { name: 'Bullet Points' });

      const deleteBtn = bulletPoints.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Code', () => {
    describe('Text', () => {
      it("should render a text input for Code link's text", async () => {
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'Code (text)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have a placeholder 'GitHub Repo' for Code link's text", async () => {
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Code (text)',
        });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'GitHub Repo');
      });

      it("should have the correct value from `data` for Code link's text", async () => {
        const props = getProps();
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Code (text)',
        });

        await expect.element(input).toHaveValue(props.data.code.text);
      });

      it("should call `editLink` on Code link's text change via the corresponding text input", async () => {
        const editLinkMock = vi.fn(
          (
            _field: 'code' | 'demo',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Project
            {...getProps({
              functions: { ...getProps().functions, editLink: editLinkMock },
            })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'Code (text)' });

        await user.type(input, 's');

        expect(editLinkMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for Code link's URL", async () => {
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'Code (link)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have a placeholder 'https://www.github.com/johndoe/TravelPlanner/' for Code link's URL", async () => {
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Code (link)',
        });

        await expect
          .element(input)
          .toHaveAttribute(
            'placeholder',
            'https://www.github.com/johndoe/TravelPlanner/',
          );
      });

      it("should have the correct value from `data` for Code link's URL", async () => {
        const props = getProps();
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Code (link)',
        });

        await expect.element(input).toHaveValue(props.data.code.link);
      });

      it("should call `editLink` on Code link's URL change via the corresponding text input", async () => {
        const editLinkMock = vi.fn(
          (
            _field: 'code' | 'demo',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Project
            {...getProps({
              functions: { ...getProps().functions, editLink: editLinkMock },
            })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'Code (link)' });

        await user.type(input, 's');

        expect(editLinkMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Demo', () => {
    describe('Text', () => {
      it("should render a text input for Demo link's text", async () => {
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'Demo (text)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have a placeholder 'Live Preview' for Demo link's text", async () => {
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Demo (text)',
        });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'Live Preview');
      });

      it("should have the correct value from `data` for Demo link's text", async () => {
        const props = getProps();
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Demo (text)',
        });

        await expect.element(input).toHaveValue(props.data.demo.text);
      });

      it("should call `editLink` on Demo link's text change via the corresponding text input", async () => {
        const editLinkMock = vi.fn(
          (
            _field: 'code' | 'demo',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Project
            {...getProps({
              functions: { ...getProps().functions, editLink: editLinkMock },
            })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'Demo (text)' });

        await user.type(input, 's');

        expect(editLinkMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for Demo link's URL", async () => {
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'Demo (link)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have a placeholder 'https://john-doe-travel-planner.herokuapp.com/' for Demo link's URL", async () => {
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Demo (link)',
        });

        await expect
          .element(input)
          .toHaveAttribute(
            'placeholder',
            'https://john-doe-travel-planner.herokuapp.com/',
          );
      });

      it("should have the correct value from `data` for Demo link's URL", async () => {
        const props = getProps();
        await render(<Project {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Demo (link)',
        });

        await expect.element(input).toHaveValue(props.data.demo.link);
      });

      it("should call `editLink` on Demo link's URL change via the corresponding text input", async () => {
        const editLinkMock = vi.fn(
          (
            _field: 'code' | 'demo',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Project
            {...getProps({
              functions: { ...getProps().functions, editLink: editLinkMock },
            })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'Demo (link)' });

        await user.type(input, 's');

        expect(editLinkMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
