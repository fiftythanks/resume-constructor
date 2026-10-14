/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import { RefObject } from 'react';

import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

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
    // TODO: data and functions should be clones of DATA and FUNCITONS, not literally them... I guess `Project.test` has the same problem. Refactor.
    data: DATA,
    firstFormFieldRef: { current: null },
    functions: FUNCTIONS,
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Job', () => {
  it('should assign the Company Name input field to `firstFormFieldRef.current`', async () => {
    const firstFormFieldRef: RefObject<HTMLInputElement | null> = {
      current: null,
    };
    await render(<Job {...getProps({ firstFormFieldRef })} />);

    const companyNameField = page.getByRole('textbox', {
      name: 'Company Name',
    });

    expect(firstFormFieldRef.current).toBe(companyNameField.element());
  });

  describe('Company Name', () => {
    const name = 'Company Name';

    it('should render a text input for Company Name', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "Google" for Company Name', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect.element(input).toHaveAttribute('placeholder', 'Google');
    });

    it('should have the correct value from `data` for Company Name', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect.element(input).toHaveValue(DATA.companyName);
    });
  });

  describe('Job Title', () => {
    const name = 'Job Title';

    it('should render a text input for Job Title', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "Senior Frontend Engineer" for Job Title', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', 'Senior Frontend Engineer');
    });

    it('should have the correct value from `data` for Job Title', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect.element(input).toHaveValue(DATA.jobTitle);
    });
  });

  describe('Duration', () => {
    const name = 'Duration';

    it('should render a text input for Duration', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "Feb 2021 – Present" for Duration', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', 'Feb 2021 – Present');
    });

    it('should have the correct value from `data` for Duration', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect.element(input).toHaveValue(DATA.duration);
    });
  });

  describe('Address', () => {
    const name = 'Address';

    it('should render a text input for Address', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "Mountain View, CA" for Address', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', 'Mountain View, CA');
    });

    it('should have the correct value from `data` for Address', async () => {
      await render(<Job {...getProps()} />);

      const input = page.getByRole('textbox', { name });

      await expect.element(input).toHaveValue(DATA.address);
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
    const { rerender } = await render(<Job {...getProps()} />);

    for (const { fieldName, name } of fields) {
      const editMock = vi.fn(editMockImplementation);
      const functions = cloneDeep(FUNCTIONS);
      functions.edit = editMock;
      const props = getProps({ functions });
      await rerender(<Job {...props} />);
      const user = userEvent.setup();
      const input = page.getByRole('textbox', { name });
      input.element().focus();

      await user.keyboard('s');

      expect(editMock).toHaveBeenCalledTimes(1);
      expect(editMock).toHaveBeenCalledWith(fieldName, `${DATA[fieldName]}s`);
    }
  });

  describe('Bullet points', () => {
    it('should render bullet points with an accessible name "Bullet Points"', async () => {
      await render(<Job {...getProps()} />);

      const bullets = page.getByRole('group', { name: 'Bullet Points' });

      await expect.element(bullets).toBeInTheDocument();
    });

    it('should have the correct data from `data`', async () => {
      await render(<Job {...getProps()} />);
      const bullets = page.getByRole('group', { name: 'Bullet Points' });

      for (let i = 0; i < DATA.bulletPoints.length; i++) {
        const { id, value } = DATA.bulletPoints[i];
        const name = `Bullet point ${i + 1}`;
        const input = bullets.getByRole('textbox', { name });

        await expect.element(input).toHaveAttribute('id', id);
        await expect.element(input).toHaveValue(value);
      }
    });

    it('should have placeholders "Led a team of 10 developers in the successful design, development, and delivery of a scalable and high-performance SaaS platform, resulting in a 30% increase in user engagement and a 20% reduction in response time.", "Architected and implemented a microservices-based architecture using Node.js and Docker, resulting in a more flexible and maintainable system and enabling seamless integration with third-party services.", "Core responsibility #3. Pretend this is where they stop reading. First 3 things should be the most impressive" for the first 3 bullet points', async () => {
      await render(<Job {...getProps()} />);

      const placeholders = [
        'Led a team of 10 developers in the successful design, development, and delivery of a scalable and high-performance SaaS platform, resulting in a 30% increase in user engagement and a 20% reduction in response time.',
        'Architected and implemented a microservices-based architecture using Node.js and Docker, resulting in a more flexible and maintainable system and enabling seamless integration with third-party services.',
        'Core responsibility #3. Pretend this is where they stop reading. First 3 things should be the most impressive',
      ];

      for (let i = 0; i < 3; i++) {
        const name = `Bullet point ${i + 1}`;
        const input = page.getByRole('textbox', { name });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', placeholders[i]);
      }
    });

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to the bullet points via the corresponding controls (not DnD related)', async () => {
      const implementation = (_announcement: string) => {};
      const mockFn = vi.fn(implementation);
      const props = getProps({ updateScreenReaderAnnouncement: mockFn });
      await render(<Job {...props} />);
      const user = userEvent.setup();
      const name = 'Delete bullet point 1';
      const deleteBtn = page.getByRole('button', { name });

      await user.click(deleteBtn);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `addBulletPoint` when a bullet point is added', async () => {
      const mockFn = vi.fn();
      const functions = cloneDeep(FUNCTIONS);
      functions.addBulletPoint = mockFn;
      const props = getProps({ functions });
      await render(<Job {...props} />);
      const user = userEvent.setup();
      const name = 'Add bullet point';
      const addBtn = page.getByRole('button', { name });

      await user.click(addBtn);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteBulletPoint` when a bullet point is deleted', async () => {
      const mockFn = vi.fn((_index: number) => {});
      const functions = cloneDeep(FUNCTIONS);
      functions.deleteBulletPoint = mockFn;
      const props = getProps({ functions });
      await render(<Job {...props} />);
      const user = userEvent.setup();
      const name = 'Delete bullet point 1';
      const deleteBtn = page.getByRole('button', { name });

      await user.click(deleteBtn);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(0);
    });

    it("should call `editBulletPoint` when a bullet point is edited via it's corresponding text input", async () => {
      const mockFn = vi.fn((_index: number, _value: string) => {});
      const functions = cloneDeep(FUNCTIONS);
      functions.editBulletPoint = mockFn;
      const props = getProps({ functions });
      await render(<Job {...props} />);
      const user = userEvent.setup();
      const name = 'Bullet point 1';
      const input = page.getByRole('textbox', { name });
      input.element().focus();

      await user.keyboard('s');

      expect(mockFn).toHaveBeenCalledTimes(1);
      const { value: initialValue } = DATA.bulletPoints[0];
      expect(mockFn).toHaveBeenCalledWith(0, `${initialValue}s`);
    });

    // TODO: find a way to test `updateBulletPoints` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.
  });
});
