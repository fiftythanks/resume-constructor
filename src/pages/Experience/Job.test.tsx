/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */
import React from 'react';

import { getByRole, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Job from './Job';

import type { JobFunctions } from './Experience';
import type { JobProps } from './Job';
import type { ItemWithId, Job as JobData } from '@/types/resumeData';

// all functions

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
    functions: FUNCTIONS,
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Job', () => {
  describe('Company Name', () => {
    const name = 'Company Name';

    it('should render a text input for Company Name', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "Google" for Company Name', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input.placeholder).toBe('Google');
    });

    it('should have the correct value from `data` for Company Name', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input.value).toBe(DATA.companyName);
    });
  });

  describe('Job Title', () => {
    const name = 'Job Title';

    it('should render a text input for Job Title', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "Senior Frontend Engineer" for Job Title', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input.placeholder).toBe('Senior Frontend Engineer');
    });

    it('should have the correct value from `data` for Job Title', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input.value).toBe(DATA.jobTitle);
    });
  });

  describe('Duration', () => {
    const name = 'Duration';

    it('should render a text input for Duration', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "Feb 2021 – Present" for Duration', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input.placeholder).toBe('Feb 2021 – Present');
    });

    it('should have the correct value from `data` for Duration', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input.value).toBe(DATA.duration);
    });
  });

  describe('Address', () => {
    const name = 'Address';

    it('should render a text input for Address', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "Mountain View, CA" for Address', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input.placeholder).toBe('Mountain View, CA');
    });

    it('should have the correct value from `data` for Address', () => {
      render(<Job {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', { name });

      expect(input.value).toBe(DATA.address);
    });
  });

  it('should call `edit(field, value)` when fields are changed via the corresponding text inputs', async () => {
    type Fields = [
      { fieldName: 'companyName'; name: 'Company Name' },
      { fieldName: 'jobTitle'; name: 'Job Title' },
      { fieldName: 'duration'; name: 'Duration' },
      { fieldName: 'address'; name: 'Address' },
    ];

    const fields: Fields = [
      { fieldName: 'companyName', name: 'Company Name' },
      { fieldName: 'jobTitle', name: 'Job Title' },
      { fieldName: 'duration', name: 'Duration' },
      { fieldName: 'address', name: 'Address' },
    ];

    type Field = 'address' | 'companyName' | 'duration' | 'jobTitle';
    const editMockImplementation = (_field: Field, _value: string) => {};
    const { rerender } = render(<Job {...getProps()} />);

    for (const { fieldName, name } of fields) {
      const editMock = jest.fn(editMockImplementation);
      const functions = cloneDeep(FUNCTIONS);
      functions.edit = editMock;
      const props = getProps({ functions });
      rerender(<Job {...props} />);
      const user = userEvent.setup();
      const input: HTMLInputElement = screen.getByRole('textbox', { name });
      input.focus();

      await user.keyboard('s');

      expect(editMock).toHaveBeenCalledTimes(1);
      expect(editMock).toHaveBeenCalledWith(fieldName, `${DATA[fieldName]}s`);
    }
  });

  describe('Bullet points', () => {
    it('should render bullet points with an accessible name "Bullet Points"', () => {
      render(<Job {...getProps()} />);

      const bullets = screen.getByRole('group', { name: 'Bullet Points' });

      expect(bullets).toBeInTheDocument();
    });

    it('should have the correct data from `data`', () => {
      render(<Job {...getProps()} />);
      const bullets = screen.getByRole('group', { name: 'Bullet Points' });

      DATA.bulletPoints.forEach((bullet, i) => {
        const { id, value } = bullet;
        const name = `Bullet point ${i + 1}`;
        const input: HTMLInputElement = getByRole(bullets, 'textbox', { name });

        expect(input.id).toBe(id);
        expect(input.value).toBe(value);
      });
    });

    it('should have placeholders "Led a team of 10 developers in the successful design, development, and delivery of a scalable and high-performance SaaS platform, resulting in a 30% increase in user engagement and a 20% reduction in response time.", "Architected and implemented a microservices-based architecture using Node.js and Docker, resulting in a more flexible and maintainable system and enabling seamless integration with third-party services.", "Core responsibility #3. Pretend this is where they stop reading. First 3 things should be the most impressive" for the first 3 bullet points', () => {
      render(<Job {...getProps()} />);

      const placeholders = [
        'Led a team of 10 developers in the successful design, development, and delivery of a scalable and high-performance SaaS platform, resulting in a 30% increase in user engagement and a 20% reduction in response time.',
        'Architected and implemented a microservices-based architecture using Node.js and Docker, resulting in a more flexible and maintainable system and enabling seamless integration with third-party services.',
        'Core responsibility #3. Pretend this is where they stop reading. First 3 things should be the most impressive',
      ];

      for (let i = 0; i < 3; i++) {
        const name = `Bullet point ${i + 1}`;
        const input: HTMLInputElement = screen.getByRole('textbox', { name });

        expect(input.placeholder).toBe(placeholders[i]);
      }
    });

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to the bullet points via the corresponding controls (not DnD related)', async () => {
      const implementation = (_announcement: string) => {};
      const mockFn = jest.fn(implementation);
      const props = getProps({ updateScreenReaderAnnouncement: mockFn });
      render(<Job {...props} />);
      const user = userEvent.setup();
      const name = 'Delete bullet point 1';
      const deleteBtn = screen.getByRole('button', { name });

      await user.click(deleteBtn);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `addBulletPoint` when a bullet point is added', async () => {
      const mockFn = jest.fn();
      const functions = cloneDeep(FUNCTIONS);
      functions.addBulletPoint = mockFn;
      const props = getProps({ functions });
      render(<Job {...props} />);
      const user = userEvent.setup();
      const name = 'Add bullet point';
      const addBtn = screen.getByRole('button', { name });

      await user.click(addBtn);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteBulletPoint` when a bullet point is deleted', async () => {
      const mockFn = jest.fn((_index: number) => {});
      const functions = cloneDeep(FUNCTIONS);
      functions.deleteBulletPoint = mockFn;
      const props = getProps({ functions });
      render(<Job {...props} />);
      const user = userEvent.setup();
      const name = 'Delete bullet point 1';
      const deleteBtn = screen.getByRole('button', { name });

      await user.click(deleteBtn);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(0);
    });

    it("should call `editBulletPoint` when a bullet point is edited via it's corresponding text input", async () => {
      const mockFn = jest.fn((_index: number, _value: string) => {});
      const functions = cloneDeep(FUNCTIONS);
      functions.editBulletPoint = mockFn;
      const props = getProps({ functions });
      render(<Job {...props} />);
      const user = userEvent.setup();
      const name = 'Bullet point 1';
      const input = screen.getByRole('textbox', { name });
      input.focus();

      await user.keyboard('s');

      expect(mockFn).toHaveBeenCalledTimes(1);
      const { value: initialValue } = DATA.bulletPoints[0];
      expect(mockFn).toHaveBeenCalledWith(0, `${initialValue}s`);
    });

    // TODO: find a way to test `updateBulletPoints` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.
  });
});
