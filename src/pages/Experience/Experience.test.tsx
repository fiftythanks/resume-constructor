/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */
import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

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
    firstTabbable: { current: null },
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement) {},
    ...overrides,
  };
}

describe('Experience', () => {
  // `Experience` gets its accessible name from this element.
  render(<div aria-label="Experience" id="experience" />);

  it('should render as a tabpanel with an accessible name derived from an element with an ID "experience"', () => {
    render(<Experience {...getProps()} />);

    const experience = screen.getByRole('tabpanel', { name: 'Experience' });

    expect(experience).toBeInTheDocument();
  });

  it('should render a heading "Job [index + 1]"', () => {
    render(<Experience {...getProps()} />);

    const heading = screen.getByRole('heading', { name: 'Job 1' });

    expect(heading).toBeInTheDocument();
  });

  describe('"Show Previous / Next Job" buttons', () => {
    describe('"Show Previous Job" button', () => {
      it('should not render the button if the shown job is the first one', () => {
        render(<Experience {...getProps()} />);

        const btn = screen.queryByRole('button', { name: 'Show Previous Job' });

        expect(btn).not.toBeInTheDocument();
      });

      it("should render the button if the shown job isn't the first one", () => {
        const data = structuredClone({ ...DATA, shownJobIndex: 1 });
        render(<Experience {...getProps({ data })} />);

        const btn = screen.getByRole('button', { name: 'Show Previous Job' });

        expect(btn).toBeInTheDocument();
      });

      it('should call `showJob(shownJobIndex - 1)` when the button is clicked', async () => {
        // Arrange
        const data = structuredClone({ ...DATA, shownJobIndex: 1 });
        const mockFn = jest.fn((_index: number) => {});
        const functions = cloneDeep({ ...FUNCTIONS, showJob: mockFn });

        render(<Experience {...getProps({ data, functions })} />);
        const user = userEvent.setup();
        const btn = screen.getByRole('button', { name: 'Show Previous Job' });

        // Act
        await user.click(btn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(0);
      });
    });

    describe('"Show Next Job" button', () => {
      it("should render the button if the shown job isn't the last one", () => {
        render(<Experience {...getProps()} />);

        const btn = screen.getByRole('button', { name: 'Show Next Job' });

        expect(btn).toBeInTheDocument();
      });

      it('should not render the button if the shown job is the last one', () => {
        const shownJobIndex = DATA.jobs.length - 1;
        const data = structuredClone({ ...DATA, shownJobIndex });
        render(<Experience {...getProps({ data })} />);

        const btn = screen.queryByRole('button', { name: 'Show Next Job' });

        expect(btn).not.toBeInTheDocument();
      });

      it('should call `showJob(shownJobIndex + 1)` when the button is clicked', async () => {
        // Arrange
        const mockFn = jest.fn((_index: number) => {});
        const functions = cloneDeep({ ...FUNCTIONS, showJob: mockFn });
        const props = getProps({ functions });

        render(<Experience {...props} />);
        const user = userEvent.setup();
        const btn = screen.getByRole('button', { name: 'Show Next Job' });

        // Act
        await user.click(btn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('"Add Job" button', () => {
    it('should render a button "Add Job [number of jobs + 1]', () => {
      render(<Experience {...getProps()} />);

      const btn = screen.getByRole('button', {
        name: `Add Job ${DATA.jobs.length + 1}`,
      });

      expect(btn).toBeInTheDocument();
    });

    it('should call `addJob` when the button is clicked', async () => {
      // Arrange
      const mockFn = jest.fn();
      const functions = cloneDeep({ ...FUNCTIONS, addJob: mockFn });

      render(<Experience {...getProps({ functions })} />);
      const user = userEvent.setup();

      const name = `Add Job ${DATA.jobs.length + 1}`;
      const btn = screen.getByRole('button', { name });

      // Act
      await user.click(btn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('"Delete Job" button', () => {
    it('should render a "Delete Job [shown job index + 1]" button if there is more than one job', () => {
      render(<Experience {...getProps()} />);

      const btn = screen.getByRole('button', {
        name: `Delete Job ${DATA.shownJobIndex + 1}`,
      });

      expect(btn).toBeInTheDocument();
    });

    it("should not render the button if there's just one job", () => {
      const data = structuredClone({ ...DATA, jobs: [DATA.jobs[0]] });
      render(<Experience {...getProps({ data })} />);

      const btn = screen.queryByRole('button', { name: 'Delete Job 1' });

      expect(btn).not.toBeInTheDocument();
    });

    it('should call `deleteJob(shownJobIndex)` when the button is called', async () => {
      // Arrange
      const mockFn = jest.fn((_index: number) => {});
      const functions = cloneDeep({ ...FUNCTIONS, deleteJob: mockFn });

      render(<Experience {...getProps({ functions })} />);
      const user = userEvent.setup();
      const name = `Delete Job ${DATA.shownJobIndex + 1}`;
      const btn = screen.getByRole('button', { name });

      // Act
      await user.click(btn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(DATA.shownJobIndex);
    });
  });

  describe('Shown job', () => {
    // TODO: should render a job. (At the moment, the way `Experience` is structured, it's hard to come up with a proper way to write this test. The component needs a refactor.)

    describe('Data', () => {
      const job = DATA.jobs[DATA.shownJobIndex];
      const { address, companyName, duration, jobTitle } = job;

      beforeEach(() => {
        render(<Experience {...getProps()} />);
      });

      it('should have the correct address', () => {
        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Address',
        });

        expect(input.value).toBe(address);
      });

      it('should have the correct company name', () => {
        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Company Name',
        });

        expect(input.value).toBe(companyName);
      });

      it('should have the correct duration', () => {
        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Duration',
        });

        expect(input.value).toBe(duration);
      });

      it('should have the correct job title', () => {
        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Job Title',
        });

        expect(input.value).toBe(jobTitle);
      });

      describe('bullet points', () => {
        const { bulletPoints } = job;

        function getInput(name: string): HTMLInputElement {
          return screen.getByRole('textbox', { name });
        }

        describe('bullet point 1', () => {
          it('should have the correct value', () => {
            const input = getInput('Bullet point 1');

            expect(input.value).toBe(bulletPoints[0].value);
          });

          it('should have the correct ID', () => {
            const input = getInput('Bullet point 1');

            expect(input.id).toBe(bulletPoints[0].id);
          });
        });

        describe('bullet point 2', () => {
          it('should have the correct value', () => {
            const input = getInput('Bullet point 2');

            expect(input.value).toBe(bulletPoints[1].value);
          });

          it('should have the correct ID', () => {
            const input = getInput('Bullet point 2');

            expect(input.id).toBe(bulletPoints[1].id);
          });
        });

        describe('bullet point 3', () => {
          it('should have the correct value', () => {
            const input = getInput('Bullet point 3');

            expect(input.value).toBe(bulletPoints[2].value);
          });

          it('should have the correct ID', () => {
            const input = getInput('Bullet point 3');

            expect(input.id).toBe(bulletPoints[2].id);
          });
        });
      });
    });

    describe('Functions', () => {
      it('should call `addBulletPoint(jobIndex)` when a bullet point is added via the corresponding control', async () => {
        // Arrange
        const mockFn = jest.fn((_bulletIndex: number) => {});
        const functions = cloneDeep({ ...FUNCTIONS, addBulletPoint: mockFn });

        render(<Experience {...getProps({ functions })} />);
        const user = userEvent.setup();

        const name = 'Add bullet point';
        const addBulletPointBtn = screen.getByRole('button', { name });

        // Act
        await user.click(addBulletPointBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(DATA.shownJobIndex);
      });

      it('should call `deleteBulletPoint(jobIndex, itemIndex)` when a bullet point is deleted via the corresponding control', async () => {
        // Arrange
        const implementation = (_bulletIndex: number, _itemIndex: number) => {};
        const mockFn = jest.fn(implementation);
        const functions = cloneDeep(FUNCTIONS);
        functions.deleteBulletPoint = mockFn;

        render(<Experience {...getProps({ functions })} />);
        const user = userEvent.setup();

        const name = 'Delete bullet point 1';
        const deleteBulletPointBtn = screen.getByRole('button', { name });

        // Act
        await user.click(deleteBulletPointBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(DATA.shownJobIndex, 0);
      });

      it('should call `editBulletPoint(jobIndex, itemIndex, value)` when a bullet point is edited via the corresponding text input', async () => {
        // Arrange
        const mockFn = jest.fn(
          (_jobIndex: number, _itemIndex: number, _value: string) => {},
        );

        const functions = cloneDeep({
          ...FUNCTIONS,
          editBulletPoint: mockFn,
        });

        render(<Experience {...getProps({ functions })} />);
        const user = userEvent.setup();

        const input = screen.getByRole('textbox', { name: 'Bullet point 1' });
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);

        expect(mockFn).toHaveBeenCalledWith(
          DATA.shownJobIndex,
          0,
          `${DATA.jobs[DATA.shownJobIndex].bulletPoints[0].value}s`,
        );
      });

      it('should call `editJob(jobIndex, field, value)` when a text field of a job is changed via the corresponding text input', async () => {
        // Arrange
        const mockFn = jest.fn(
          (_jobIndex: number, _field: Field, _value: string) => {},
        );

        const functions = cloneDeep({
          ...FUNCTIONS,
          editJob: mockFn,
        });

        render(<Experience {...getProps({ functions })} />);
        const user = userEvent.setup();

        const name = 'Job Title';
        const input = screen.getByRole('textbox', { name });
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);

        expect(mockFn).toHaveBeenCalledWith(
          DATA.shownJobIndex,
          'jobTitle',
          `${DATA.jobs[DATA.shownJobIndex].jobTitle}s`,
        );
      });

      // TODO: find a way to test `updateBulletPoints` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.

      /**
       * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
       * the test's name should be changed.
       */
      it('should call `updateScreenReaderAnnouncement` when an important change is made to the job via its controls or text inputs (not DnD-related)', async () => {
        // Arrange
        const mockFn = jest.fn((_announcement: string) => {});
        const props = getProps({ updateScreenReaderAnnouncement: mockFn });

        render(<Experience {...props} />);
        const user = userEvent.setup();

        const name = 'Delete bullet point 1';
        const deleteBtn = screen.getByRole('button', { name });

        // Act
        await user.click(deleteBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('should assign the "Show Previous Job" button to `firstTabbable.current` when the button is present', () => {
    const firstTabbable = { current: null };
    const props = getProps({ firstTabbable });
    props.data.shownJobIndex = 1;
    render(<Experience {...props} />);

    const btn = screen.getByRole('button', { name: 'Show Previous Job' });

    expect(firstTabbable.current).toBe(btn);
  });

  it('should assign the "Show Next Job" button to `firstTabbable.current` when the button is present and the "Show Previous Job" button is not', () => {
    const firstTabbable = { current: null };
    render(<Experience {...getProps({ firstTabbable })} />);

    const btn = screen.getByRole('button', { name: 'Show Next Job' });

    expect(firstTabbable.current).toBe(btn);
  });

  it("should assign the 'Add Job' button to `firstTabbable.current` when there's only one degree", () => {
    const firstTabbable = { current: null };
    const props = getProps({ firstTabbable });
    props.data.jobs.splice(0, 2);
    render(<Experience {...props} />);

    const btn = screen.getByRole('button', { name: 'Add Job 2' });

    expect(firstTabbable.current).toBe(btn);
  });
});
