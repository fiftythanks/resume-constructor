import { getByRole, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Project from './Project';

import type { ProjectProps } from './Project';
import type { ItemWithId, Project as ProjectData } from '@/types/resumeData';

const DATA: ProjectData = {
  bulletPoints: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      value: 'Bullet point 1',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      value: 'Bullet point 2',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
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
  id: '00000000-0000-0000-0000-000000000004',
  projectName: 'Project Name',
  stack: 'The best stack',
};

const FUNCTIONS: ProjectProps['functions'] = {
  addBulletPoint() {},
  deleteBulletPoint(_itemIndex: number) {},
  editBulletPoint(_itemIndex: number, _value: string) {},
  editLink(_field: 'code' | 'demo', _type: 'link' | 'text', _value: string) {},
  editText(_field: 'projectName' | 'stack', _value: string) {},
  updateBulletPoints(_value: ItemWithId[]) {},
};

function getProps(overrides?: Partial<ProjectProps>): ProjectProps {
  return {
    data: structuredClone(DATA),
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Project', () => {
  describe('Text fields', () => {
    it.each([
      ['Project Name', 'TravelPlanner', DATA.projectName],
      [
        'Tech Stack',
        'HTML, CSS, React, TypeScript, Redux, Bootstrap, Express.js, PostgreSQL',
        DATA.stack,
      ],
    ] as const)(
      'should render %s text input with placeholder and value',
      (name, placeholder, expectedValue) => {
        // Arrange & Act
        render(<Project {...getProps()} />);
        const input = screen.getByRole('textbox', { name });

        // Assert
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', placeholder);
        expect(input).toHaveValue(expectedValue);
      },
    );

    it.each([
      ['Project Name', 'projectName', `${DATA.projectName}s`],
      ['Tech Stack', 'stack', `${DATA.stack}s`],
    ] as const)(
      'should call `editText(field, value)` when %s is edited',
      async (name, field, expectedValue) => {
        // Arrange
        const editTextMock = jest.fn<void, ['projectName' | 'stack', string]>();
        const functions = cloneDeep({ ...FUNCTIONS, editText: editTextMock });
        render(<Project {...getProps({ functions })} />);
        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name });

        // Act
        await user.type(input, 's');

        // Assert
        expect(editTextMock).toHaveBeenCalledTimes(1);
        expect(editTextMock).toHaveBeenCalledWith(field, expectedValue);
      },
    );
  });

  describe('Link fields', () => {
    it.each([
      ['Code (text)', 'GitHub Repo', DATA.code.text],
      [
        'Code (link)',
        'https://www.github.com/johndoe/TravelPlanner/',
        DATA.code.link,
      ],
      ['Demo (text)', 'Live Preview', DATA.demo.text],
      [
        'Demo (link)',
        'https://john-doe-travel-planner.herokuapp.com/',
        DATA.demo.link,
      ],
    ] as const)(
      'should render %s text input with placeholder and value',
      (name, placeholder, expectedValue) => {
        // Arrange & Act
        render(<Project {...getProps()} />);
        const input = screen.getByRole('textbox', { name });

        // Assert
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', placeholder);
        expect(input).toHaveValue(expectedValue);
      },
    );

    it.each([
      ['Code (text)', 'code', 'text', `${DATA.code.text}s`],
      ['Code (link)', 'code', 'link', `${DATA.code.link}s`],
      ['Demo (text)', 'demo', 'text', `${DATA.demo.text}s`],
      ['Demo (link)', 'demo', 'link', `${DATA.demo.link}s`],
    ] as const)(
      'should call `editLink(field, type, value)` when %s is edited',
      async (name, field, type, expectedValue) => {
        // Arrange
        const editLinkMock = jest.fn<
          void,
          ['code' | 'demo', 'link' | 'text', string]
        >();
        const functions = cloneDeep({ ...FUNCTIONS, editLink: editLinkMock });
        render(<Project {...getProps({ functions })} />);
        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name });

        // Act
        await user.type(input, 's');

        // Assert
        expect(editLinkMock).toHaveBeenCalledTimes(1);
        expect(editLinkMock).toHaveBeenCalledWith(field, type, expectedValue);
      },
    );
  });

  describe('Bullet points', () => {
    it('should render bullet points with an accessible name "Bullet Points"', () => {
      // Arrange & Act
      render(<Project {...getProps()} />);
      const bulletPoints = screen.getByRole('group', { name: 'Bullet Points' });

      // Assert
      expect(bulletPoints).toBeInTheDocument();
    });

    it('should pass the correct data from `data` to the bullet points', () => {
      // Arrange & Act
      render(<Project {...getProps()} />);
      const bulletPoints = screen.getByRole('group', { name: 'Bullet Points' });

      // Assert
      DATA.bulletPoints.forEach((bulletPoint, i) => {
        const { id, value } = bulletPoint;
        const input = getByRole(bulletPoints, 'textbox', {
          name: `Bullet point ${i + 1}`,
        });

        expect(input).toHaveAttribute('id', id);
        expect(input).toHaveValue(value);
      });
    });

    it('should have placeholders for the first 3 bullet points', () => {
      // Arrange & Act
      render(<Project {...getProps()} />);
      const bulletPoints = screen.getByRole('group', { name: 'Bullet Points' });

      const placeholders = [
        'Developed a user-friendly web application for travel planning, allowing users to create and manage their itineraries.',
        'Utilized Redux for state management, enabling efficient data flow and improved application performance.',
        'Designed RESTful APIs using Node.js and Express.js, facilitating data retrieval and storage from the PostgreSQL database.',
      ];

      // Assert
      placeholders.forEach((placeholder, index) => {
        const input = getByRole(bulletPoints, 'textbox', {
          name: `Bullet point ${index + 1}`,
        });

        expect(input).toHaveAttribute('placeholder', placeholder);
      });
    });

    it('should call `updateScreenReaderAnnouncement` when an important change is made to the bullet points via the corresponding controls', async () => {
      // Arrange
      const updateScreenReaderAnnouncementMock = jest.fn<void, [string]>();
      const props = getProps({
        updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
      });

      render(<Project {...props} />);
      const user = userEvent.setup();
      const bulletPoints = screen.getByRole('group', { name: 'Bullet Points' });
      const deleteBtn = getByRole(bulletPoints, 'button', {
        name: 'Delete bullet point 1',
      });

      // Act
      await user.click(deleteBtn);

      // Assert
      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });

    it('should call `addBulletPoint` when a bullet point is added', async () => {
      // Arrange
      const mockFn = jest.fn();
      const functions = cloneDeep({ ...FUNCTIONS, addBulletPoint: mockFn });
      render(<Project {...getProps({ functions })} />);
      const user = userEvent.setup();
      const addBtn = screen.getByRole('button', { name: 'Add bullet point' });

      // Act
      await user.click(addBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteBulletPoint` when a bullet point is deleted', async () => {
      // Arrange
      const mockFn = jest.fn<void, [number]>();
      const functions = cloneDeep({ ...FUNCTIONS, deleteBulletPoint: mockFn });
      render(<Project {...getProps({ functions })} />);
      const user = userEvent.setup();
      const deleteBtn = screen.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      // Act
      await user.click(deleteBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(0);
    });

    it('should call `editBulletPoint` when a bullet point is edited via its corresponding text input', async () => {
      // Arrange
      const mockFn = jest.fn<void, [number, string]>();
      const functions = cloneDeep({ ...FUNCTIONS, editBulletPoint: mockFn });
      render(<Project {...getProps({ functions })} />);
      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Bullet point 1' });
      input.focus();

      // Act
      await user.keyboard('s');

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      const { value: initialValue } = DATA.bulletPoints[0];
      expect(mockFn).toHaveBeenCalledWith(0, `${initialValue}s`);
    });
  });
});
