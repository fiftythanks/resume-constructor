import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Experience from './Experience';

import type { ExperienceProps } from './Experience';
import type {
  Experience as ExperienceType,
  ItemWithId,
} from '@/types/resumeData';

const DATA: ExperienceType = {
  shownJobIndex: 0,
  jobs: [
    {
      address: 'some address 1',
      companyName: 'some name 1',
      duration: 'some duration 1',
      id: '00000000-0000-0000-0000-000000000001',
      jobTitle: 'some title 1',
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
    },
    {
      address: 'some address 2',
      companyName: 'some name 2',
      duration: 'some duration 2',
      id: '00000000-0000-0000-0000-000000000005',
      jobTitle: 'some title 2',
      bulletPoints: [
        {
          id: '00000000-0000-0000-0000-000000000006',
          value: 'Bullet point 1',
        },
        {
          id: '00000000-0000-0000-0000-000000000007',
          value: 'Bullet point 2',
        },
        {
          id: '00000000-0000-0000-0000-000000000008',
          value: 'Bullet point 3',
        },
      ],
    },
    {
      address: 'some address 3',
      companyName: 'some name 3',
      duration: 'some duration 3',
      id: '00000000-0000-0000-0000-000000000009',
      jobTitle: 'some title 3',
      bulletPoints: [
        {
          id: '00000000-0000-0000-0000-000000000010',
          value: 'Bullet point 1',
        },
        {
          id: '00000000-0000-0000-0000-000000000011',
          value: 'Bullet point 2',
        },
        {
          id: '00000000-0000-0000-0000-000000000012',
          value: 'Bullet point 3',
        },
      ],
    },
  ],
};

type Field = 'address' | 'companyName' | 'duration' | 'jobTitle';

const FUNCTIONS: ExperienceProps['functions'] = {
  addBulletPoint(_jobIndex: number) {},
  addJob() {},
  deleteBulletPoint(_jobIndex: number, _itemIndex: number) {},
  deleteJob(_index: number) {},
  editBulletPoint(_jobIndex: number, _itemIndex: number, _value: string) {},
  editJob(_index: number, _field: Field, _value: string) {},
  showJob(_newShownJobIndex: number) {},
  updateBulletPoints(_jobIndex: number, _value: ItemWithId[]) {},
};

function getProps(overrides?: Partial<ExperienceProps>): ExperienceProps {
  return {
    data: structuredClone(DATA),
    ref: { current: null },
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Experience', () => {
  beforeEach(() => {
    const labelledElement = document.createElement('div');
    labelledElement.id = 'experience';
    labelledElement.setAttribute('aria-label', 'Experience');
    document.body.appendChild(labelledElement);
  });

  afterEach(() => {
    document.getElementById('experience')?.remove();
  });

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
        const mockFn = jest.fn<void, [number]>();
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
        const mockFn = jest.fn<void, [number]>();
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

    it('should call `deleteJob(shownJobIndex)` when the button is clicked', async () => {
      // Arrange
      const mockFn = jest.fn<void, [number]>();
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
    describe('Data', () => {
      const job = DATA.jobs[DATA.shownJobIndex];
      const { address, companyName, duration, jobTitle } = job;
      const { bulletPoints } = job;

      it.each([
        ['Address', address],
        ['Company Name', companyName],
        ['Duration', duration],
        ['Job Title', jobTitle],
      ] as const)('should have the correct %s', (fieldName, expectedValue) => {
        render(<Experience {...getProps()} />);
        const input = screen.getByRole('textbox', { name: fieldName });

        expect(input).toHaveValue(expectedValue);
      });

      it.each([
        [1, bulletPoints[0]],
        [2, bulletPoints[1]],
        [3, bulletPoints[2]],
      ] as const)(
        'should have the correct value and ID for bullet point %i',
        (index, expected) => {
          render(<Experience {...getProps()} />);
          const input = screen.getByRole('textbox', {
            name: `Bullet point ${index}`,
          });

          expect(input).toHaveValue(expected.value);
          expect(input).toHaveAttribute('id', expected.id);
        },
      );
    });

    describe('Functions', () => {
      it('should call `addBulletPoint(jobIndex)` when a bullet point is added via the corresponding control', async () => {
        // Arrange
        const mockFn = jest.fn<void, [number]>();
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
        const mockFn = jest.fn<void, [number, number]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          deleteBulletPoint: mockFn,
        });

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
        const mockFn = jest.fn<void, [number, number, string]>();
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
        const mockFn = jest.fn<void, [number, Field, string]>();
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

      it('should call `updateScreenReaderAnnouncement` when an important change is made to the job via its controls or text inputs', async () => {
        // Arrange
        const mockFn = jest.fn<void, [string]>();
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

  it('should pass the section element to `ref.current`', () => {
    // Arrange
    const ref = { current: null };

    // Act
    render(<Experience {...getProps({ ref })} />);
    const experience = screen.getByRole('tabpanel');

    // Assert
    expect(ref.current).toBe(experience);
  });
});
