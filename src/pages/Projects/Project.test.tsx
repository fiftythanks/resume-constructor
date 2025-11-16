/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */
import React from 'react';

import { getByRole, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Project from './Project';

import type { ProjectProps } from './Project';
import type { ItemWithId } from '@/types/resumeData';

function getProps(overrides?: Partial<ProjectProps>): ProjectProps {
  return {
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

    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Project', () => {
  describe('Project Name', () => {
    it('should render a text input for Project Name', () => {
      render(<Project {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Project Name' });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "TravelPlanner" for Project Name', () => {
      render(<Project {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Project Name',
      });

      expect(input.placeholder).toBe('TravelPlanner');
    });

    it('should have the correct value from `data` for Project Name', () => {
      const props = getProps();
      render(<Project {...props} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Project Name',
      });

      expect(input.value).toBe(props.data.projectName);
    });

    it('should call `editText` on Project Name change via the corresponding text input', async () => {
      const editTextMock = jest.fn(
        (_field: 'projectName' | 'stack', _value: string) => {},
      );

      render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, editText: editTextMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Project Name' });

      await user.type(input, 's');

      expect(editTextMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tech Stack', () => {
    it('should render a text input for Tech Stack', () => {
      render(<Project {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Tech Stack' });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "HTML, CSS, React, TypeScript, Redux, Bootstrap, Express.js, PostgreSQL" for Tech Stack', () => {
      render(<Project {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Tech Stack',
      });

      expect(input.placeholder).toBe(
        'HTML, CSS, React, TypeScript, Redux, Bootstrap, Express.js, PostgreSQL',
      );
    });

    it('should have the correct value from `data` for Tech Stack', () => {
      const props = getProps();
      render(<Project {...props} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Tech Stack',
      });

      expect(input.value).toBe(props.data.stack);
    });

    it('should call `editText` on Tech Stack change via the corresponding text input', async () => {
      const editTextMock = jest.fn(
        (_field: 'projectName' | 'stack', _value: string) => {},
      );

      render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, editText: editTextMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Tech Stack' });

      await user.type(input, 's');

      expect(editTextMock).toHaveBeenCalledTimes(1);
    });
  });

  // TODO: find a way to test `updateBulletPoints` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.
  describe('Bullet points', () => {
    it('should render bullet points with an accessible name "Bullet Points"', () => {
      render(<Project {...getProps()} />);

      const bulletPoints = screen.getByRole('group', { name: 'Bullet Points' });

      expect(bulletPoints).toBeInTheDocument();
    });

    it('should pass the correct data from `data` to the bullet points', () => {
      const props = getProps();
      render(<Project {...props} />);
      const bulletPoints = screen.getByRole('group', { name: 'Bullet Points' });

      props.data.bulletPoints.forEach((bulletPoint, i) => {
        const { id, value } = bulletPoint;

        const input: HTMLInputElement = getByRole(bulletPoints, 'textbox', {
          name: `Bullet point ${i + 1}`,
        });

        expect(input.id).toBe(id);
        expect(input.value).toBe(value);
      });
    });

    it('should have placeholders "Developed a user-friendly web application for travel planning, allowing users to create and manage their itineraries.", "Utilized Redux for state management, enabling efficient data flow and improved application performance.", "Designed RESTful APIs using Node.js and Express.js, facilitating data retrieval and storage from the PostgreSQL database." for the first 3 bullet points', () => {
      render(<Project {...getProps()} />);
      const bulletPoints = screen.getByRole('group', { name: 'Bullet Points' });
      const bulletNodes: Array<HTMLInputElement> = [];

      for (let i = 0; i < 3; i++) {
        bulletNodes[i] = getByRole(bulletPoints, 'textbox', {
          name: `Bullet point ${i + 1}`,
        });
      }

      const placeholders = [
        'Developed a user-friendly web application for travel planning, allowing users to create and manage their itineraries.',
        'Utilized Redux for state management, enabling efficient data flow and improved application performance.',
        'Designed RESTful APIs using Node.js and Express.js, facilitating data retrieval and storage from the PostgreSQL database.',
      ];

      bulletNodes.forEach((node, i) => {
        expect(node.placeholder).toBe(placeholders[i]);
      });
    });

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to the bullet points via the corresponding controls (not DnD related)', async () => {
      const updateScreenReaderAnnouncementMock = jest.fn(
        (_announcement: string) => {},
      );

      const props = getProps({
        updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
      });

      render(<Project {...props} />);
      const user = userEvent.setup();
      const bulletPoints = screen.getByRole('group', { name: 'Bullet Points' });

      const deleteBtn = getByRole(bulletPoints, 'button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Code', () => {
    describe('Text', () => {
      it("should render a text input for Code link's text", () => {
        render(<Project {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'Code (text)' });

        expect(input).toBeInTheDocument();
      });

      it("should have a placeholder 'GitHub Repo' for Code link's text", () => {
        render(<Project {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Code (text)',
        });

        expect(input.placeholder).toBe('GitHub Repo');
      });

      it("should have the correct value from `data` for Code link's text", () => {
        const props = getProps();
        render(<Project {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Code (text)',
        });

        expect(input.value).toBe(props.data.code.text);
      });

      it("should call `editLink` on Code link's text change via the corresponding text input", async () => {
        const editLinkMock = jest.fn(
          (
            _field: 'code' | 'demo',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Project
            {...getProps({
              functions: { ...getProps().functions, editLink: editLinkMock },
            })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'Code (text)' });

        await user.type(input, 's');

        expect(editLinkMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for Code link's URL", () => {
        render(<Project {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'Code (link)' });

        expect(input).toBeInTheDocument();
      });

      it("should have a placeholder 'https://www.github.com/johndoe/TravelPlanner/' for Code link's URL", () => {
        render(<Project {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Code (link)',
        });

        expect(input.placeholder).toBe(
          'https://www.github.com/johndoe/TravelPlanner/',
        );
      });

      it("should have the correct value from `data` for Code link's URL", () => {
        const props = getProps();
        render(<Project {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Code (link)',
        });

        expect(input.value).toBe(props.data.code.link);
      });

      it("should call `editLink` on Code link's URL change via the corresponding text input", async () => {
        const editLinkMock = jest.fn(
          (
            _field: 'code' | 'demo',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Project
            {...getProps({
              functions: { ...getProps().functions, editLink: editLinkMock },
            })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'Code (link)' });

        await user.type(input, 's');

        expect(editLinkMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Demo', () => {
    describe('Text', () => {
      it("should render a text input for Demo link's text", () => {
        render(<Project {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'Demo (text)' });

        expect(input).toBeInTheDocument();
      });

      it("should have a placeholder 'Live Preview' for Demo link's text", () => {
        render(<Project {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Demo (text)',
        });

        expect(input.placeholder).toBe('Live Preview');
      });

      it("should have the correct value from `data` for Demo link's text", () => {
        const props = getProps();
        render(<Project {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Demo (text)',
        });

        expect(input.value).toBe(props.data.demo.text);
      });

      it("should call `editLink` on Demo link's text change via the corresponding text input", async () => {
        const editLinkMock = jest.fn(
          (
            _field: 'code' | 'demo',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Project
            {...getProps({
              functions: { ...getProps().functions, editLink: editLinkMock },
            })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'Demo (text)' });

        await user.type(input, 's');

        expect(editLinkMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for Demo link's URL", () => {
        render(<Project {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'Demo (link)' });

        expect(input).toBeInTheDocument();
      });

      it("should have a placeholder 'https://john-doe-travel-planner.herokuapp.com/' for Demo link's URL", () => {
        render(<Project {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Demo (link)',
        });

        expect(input.placeholder).toBe(
          'https://john-doe-travel-planner.herokuapp.com/',
        );
      });

      it("should have the correct value from `data` for Demo link's URL", () => {
        const props = getProps();
        render(<Project {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Demo (link)',
        });

        expect(input.value).toBe(props.data.demo.link);
      });

      it("should call `editLink` on Demo link's URL change via the corresponding text input", async () => {
        const editLinkMock = jest.fn(
          (
            _field: 'code' | 'demo',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Project
            {...getProps({
              functions: { ...getProps().functions, editLink: editLinkMock },
            })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'Demo (link)' });

        await user.type(input, 's');

        expect(editLinkMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
