import { getByRole, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Job from './Job';

import type { JobFunctions } from './Experience';
import type { JobProps } from './Job';
import type { ItemWithId, Job as JobData } from '@/types/resumeData';

const DATA: JobData = {
  address: 'some address',
  companyName: 'some name',
  duration: 'some duration',
  id: '00000000-0000-0000-0000-000000000001',
  jobTitle: 'some title',
  bulletPoints: [
    {
      id: '00000000-0000-0000-0000-000000000002',
      value: 'Bullet point 1',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      value: 'Bullet point 2',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      value: 'Bullet point 3',
    },
  ],
};

type Field = 'address' | 'companyName' | 'duration' | 'jobTitle';

const FUNCTIONS: JobFunctions = {
  addBulletPoint() {},
  deleteBulletPoint(_itemIndex: number) {},
  edit(_field: Field, _value: string) {},
  editBulletPoint(_itemIndex: number, _value: string) {},
  updateBulletPoints(_value: ItemWithId[]) {},
};

function getProps(overrides?: Partial<JobProps>): JobProps {
  return {
    data: structuredClone(DATA),
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Job', () => {
  describe('Fields', () => {
    it.each([
      ['Company Name', 'Google', DATA.companyName],
      ['Job Title', 'Senior Frontend Engineer', DATA.jobTitle],
      ['Duration', 'Feb 2021 – Present', DATA.duration],
      ['Address', 'Mountain View, CA', DATA.address],
    ] as const)(
      'should render %s text input with placeholder and value',
      (name, placeholder, expectedValue) => {
        // Arrange & Act
        render(<Job {...getProps()} />);
        const input = screen.getByRole('textbox', { name });

        // Assert
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', placeholder);
        expect(input).toHaveValue(expectedValue);
      },
    );

    it.each([
      ['Company Name', 'companyName', `${DATA.companyName}s`],
      ['Job Title', 'jobTitle', `${DATA.jobTitle}s`],
      ['Duration', 'duration', `${DATA.duration}s`],
      ['Address', 'address', `${DATA.address}s`],
    ] as const)(
      'should call `edit(field, value)` when %s input is edited',
      async (name, fieldName, expectedValue) => {
        // Arrange
        const editMock = jest.fn<void, [Field, string]>();
        const functions = cloneDeep({ ...FUNCTIONS, edit: editMock });
        render(<Job {...getProps({ functions })} />);
        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name });
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(editMock).toHaveBeenCalledTimes(1);
        expect(editMock).toHaveBeenCalledWith(fieldName, expectedValue);
      },
    );
  });

  describe('Bullet points', () => {
    it('should render bullet points with an accessible name "Bullet Points"', () => {
      // Arrange & Act
      render(<Job {...getProps()} />);
      const bullets = screen.getByRole('group', { name: 'Bullet Points' });

      // Assert
      expect(bullets).toBeInTheDocument();
    });

    it('should have the correct data from `data`', () => {
      // Arrange & Act
      render(<Job {...getProps()} />);
      const bullets = screen.getByRole('group', { name: 'Bullet Points' });

      // Assert
      DATA.bulletPoints.forEach((bullet, i) => {
        const { id, value } = bullet;
        const name = `Bullet point ${i + 1}`;
        const input = getByRole(bullets, 'textbox', { name });

        expect(input).toHaveAttribute('id', id);
        expect(input).toHaveValue(value);
      });
    });

    it('should have placeholders for the first 3 bullet points', () => {
      // Arrange & Act
      render(<Job {...getProps()} />);

      const placeholders = [
        'Led a team of 10 developers in the successful design, development, and delivery of a scalable and high-performance SaaS platform, resulting in a 30% increase in user engagement and a 20% reduction in response time.',
        'Architected and implemented a microservices-based architecture using Node.js and Docker, resulting in a more flexible and maintainable system and enabling seamless integration with third-party services.',
        'Core responsibility #3. Pretend this is where they stop reading. First 3 things should be the most impressive',
      ];

      // Assert
      placeholders.forEach((placeholder, index) => {
        const name = `Bullet point ${index + 1}`;
        const input = screen.getByRole('textbox', { name });

        expect(input).toHaveAttribute('placeholder', placeholder);
      });
    });

    it('should call `updateScreenReaderAnnouncement` when an important change is made to the bullet points via the corresponding controls', async () => {
      // Arrange
      const mockFn = jest.fn<void, [string]>();
      const props = getProps({ updateScreenReaderAnnouncement: mockFn });
      render(<Job {...props} />);
      const user = userEvent.setup();
      const deleteBtn = screen.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      // Act
      await user.click(deleteBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `addBulletPoint` when a bullet point is added', async () => {
      // Arrange
      const mockFn = jest.fn();
      const functions = cloneDeep({ ...FUNCTIONS, addBulletPoint: mockFn });
      render(<Job {...getProps({ functions })} />);
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
      render(<Job {...getProps({ functions })} />);
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
      render(<Job {...getProps({ functions })} />);
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
