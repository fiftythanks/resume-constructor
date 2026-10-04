import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Education from './Education';

import type { EducationProps } from './Education';
import type {
  Education as EducationType,
  ItemWithId,
} from '@/types/resumeData';

const DATA: EducationType = {
  shownDegreeIndex: 0,
  degrees: [
    {
      address: 'some address 1',
      degree: 'some degree 1',
      graduation: 'whenever 1',
      id: '00000000-0000-0000-0000-000000000001',
      uni: 'some university name 1',
      bulletPoints: [
        {
          id: '00000000-0000-0000-0000-000000000002',
          value: 'bullet 1',
        },
        {
          id: '00000000-0000-0000-0000-000000000003',
          value: 'bullet 2',
        },
        {
          id: '00000000-0000-0000-0000-000000000004',
          value: 'bullet 3',
        },
      ],
    },
    {
      address: 'some address 2',
      degree: 'some degree 2',
      graduation: 'whenever 2',
      id: '00000000-0000-0000-0000-000000000005',
      uni: 'some university name 2',
      bulletPoints: [
        {
          id: '00000000-0000-0000-0000-000000000006',
          value: 'bullet 1',
        },
        {
          id: '00000000-0000-0000-0000-000000000007',
          value: 'bullet 2',
        },
        {
          id: '00000000-0000-0000-0000-000000000008',
          value: 'bullet 3',
        },
      ],
    },
    {
      address: 'some address 3',
      degree: 'some degree 3',
      graduation: 'whenever 3',
      id: '00000000-0000-0000-0000-000000000009',
      uni: 'some university name 3',
      bulletPoints: [
        {
          id: '00000000-0000-0000-0000-000000000010',
          value: 'bullet 1',
        },
        {
          id: '00000000-0000-0000-0000-000000000011',
          value: 'bullet 2',
        },
        {
          id: '00000000-0000-0000-0000-000000000012',
          value: 'bullet 3',
        },
      ],
    },
  ],
};

type Field = 'address' | 'degree' | 'graduation' | 'uni';

const FUNCTIONS: EducationProps['functions'] = {
  addBulletPoint(_degreeIndex: number) {},
  addDegree() {},
  deleteBulletPoint(_degreeIndex: number, _bulletIndex: number) {},
  deleteDegree(_index: number) {},
  editBulletPoint(_degreeIndex: number, _itemIndex: number, _value: string) {},
  editDegree(_index: number, _field: Field, _value: string) {},
  showDegree(_newShownJobIndex: number) {},
  updateBulletPoints(_degreeIndex: number, _value: ItemWithId[]) {},
};

function getProps(overrides?: Partial<EducationProps>): EducationProps {
  return {
    data: structuredClone(DATA),
    ref: { current: null },
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Education', () => {
  beforeEach(() => {
    const labelledElement = document.createElement('div');
    labelledElement.id = 'education';
    labelledElement.setAttribute('aria-label', 'Education');
    document.body.appendChild(labelledElement);
  });

  afterEach(() => {
    document.getElementById('education')?.remove();
  });

  it('should render as a tabpanel with an accessible name derived from an element with an ID "education"', () => {
    render(<Education {...getProps()} />);

    const education = screen.getByRole('tabpanel', { name: 'Education' });

    expect(education).toBeInTheDocument();
  });

  it('should render a heading "Degree [index + 1]"', () => {
    render(<Education {...getProps()} />);

    const heading = screen.getByRole('heading', { name: 'Degree 1' });

    expect(heading).toBeInTheDocument();
  });

  describe('"Show Previous / Next Degree" buttons', () => {
    describe('"Show Previous Degree" button', () => {
      it('should not render the button if the shown degree is the first one', () => {
        render(<Education {...getProps()} />);

        const btn = screen.queryByRole('button', {
          name: 'Show Previous Degree',
        });

        expect(btn).not.toBeInTheDocument();
      });

      it("should render the button if the shown degree isn't the first one", () => {
        const data = structuredClone({ ...DATA, shownDegreeIndex: 1 });
        render(<Education {...getProps({ data })} />);

        const btn = screen.getByRole('button', {
          name: 'Show Previous Degree',
        });

        expect(btn).toBeInTheDocument();
      });

      it('should call `showDegree(shownDegreeIndex - 1)` when the button is clicked', async () => {
        // Arrange
        const data = structuredClone({ ...DATA, shownDegreeIndex: 1 });
        const mockFn = jest.fn<void, [number]>();
        const functions = cloneDeep({ ...FUNCTIONS, showDegree: mockFn });

        render(<Education {...getProps({ data, functions })} />);
        const user = userEvent.setup();

        const btn = screen.getByRole('button', {
          name: 'Show Previous Degree',
        });

        // Act
        await user.click(btn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(0);
      });
    });

    describe('"Show Next Degree" button', () => {
      it("should render the button if the shown degree isn't the last one", () => {
        render(<Education {...getProps()} />);

        const btn = screen.getByRole('button', { name: 'Show Next Degree' });

        expect(btn).toBeInTheDocument();
      });

      it('should not render the button if the shown degree is the last one', () => {
        const shownDegreeIndex = DATA.degrees.length - 1;
        const data = structuredClone({ ...DATA, shownDegreeIndex });
        render(<Education {...getProps({ data })} />);

        const btn = screen.queryByRole('button', { name: 'Show Next Degree' });

        expect(btn).not.toBeInTheDocument();
      });

      it('should call `showDegree(shownDegreeIndex + 1)` when the button is clicked', async () => {
        // Arrange
        const mockFn = jest.fn<void, [number]>();
        const functions = cloneDeep({ ...FUNCTIONS, showDegree: mockFn });
        const props = getProps({ functions });

        render(<Education {...props} />);
        const user = userEvent.setup();
        const btn = screen.getByRole('button', { name: 'Show Next Degree' });

        // Act
        await user.click(btn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('"Add Degree" button', () => {
    it('should render a button "Add Degree [number of degrees + 1]', () => {
      render(<Education {...getProps()} />);

      const btn = screen.getByRole('button', {
        name: `Add Degree ${DATA.degrees.length + 1}`,
      });

      expect(btn).toBeInTheDocument();
    });

    it('should call `addDegree` when the button is clicked', async () => {
      // Arrange
      const mockFn = jest.fn();
      const functions = cloneDeep({ ...FUNCTIONS, addDegree: mockFn });

      render(<Education {...getProps({ functions })} />);
      const user = userEvent.setup();

      const btn = screen.getByRole('button', {
        name: `Add Degree ${DATA.degrees.length + 1}`,
      });

      // Act
      await user.click(btn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('"Delete Degree" button', () => {
    it('should render a "Delete Degree [shown degree index + 1]" button if there is more than one degree', () => {
      render(<Education {...getProps()} />);

      const btn = screen.getByRole('button', {
        name: `Delete Degree ${DATA.shownDegreeIndex + 1}`,
      });

      expect(btn).toBeInTheDocument();
    });

    it("should not render the button if there's just one degree", () => {
      const data = structuredClone({ ...DATA, degrees: [DATA.degrees[0]] });
      render(<Education {...getProps({ data })} />);

      const btn = screen.queryByRole('button', { name: 'Delete Degree 1' });

      expect(btn).not.toBeInTheDocument();
    });

    it('should call `deleteDegree(shownDegreeIndex)` when the button is clicked', async () => {
      // Arrange
      const mockFn = jest.fn<void, [number]>();
      const functions = cloneDeep({ ...FUNCTIONS, deleteDegree: mockFn });

      render(<Education {...getProps({ functions })} />);
      const user = userEvent.setup();

      const btn = screen.getByRole('button', {
        name: `Delete Degree ${DATA.shownDegreeIndex + 1}`,
      });

      // Act
      await user.click(btn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(DATA.shownDegreeIndex);
    });
  });

  describe('Shown degree', () => {
    describe('Data', () => {
      const degreeIndex = DATA.shownDegreeIndex;
      const { address, degree, graduation, uni } = DATA.degrees[degreeIndex];
      const { bulletPoints } = DATA.degrees[degreeIndex];

      it.each([
        ['University Name', uni],
        ['Degree', degree],
        ['Graduation', graduation],
        ['Address', address],
      ] as const)('should have the correct %s', (fieldName, expectedValue) => {
        render(<Education {...getProps()} />);
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
          render(<Education {...getProps()} />);
          const input = screen.getByRole('textbox', {
            name: `Bullet point ${index}`,
          });

          expect(input).toHaveValue(expected.value);
          expect(input).toHaveAttribute('id', expected.id);
        },
      );
    });

    describe('Functions', () => {
      it('should call `addBulletPoint(degreeIndex)` when a bullet point is added via the corresponding control', async () => {
        // Arrange
        const mockFn = jest.fn<void, [number]>();
        const functions = cloneDeep({ ...FUNCTIONS, addBulletPoint: mockFn });

        render(<Education {...getProps({ functions })} />);
        const user = userEvent.setup();

        const addBulletPointBtn = screen.getByRole('button', {
          name: 'Add bullet point',
        });

        // Act
        await user.click(addBulletPointBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(DATA.shownDegreeIndex);
      });

      it('should call `deleteBulletPoint(degreeIndex, itemIndex)` when a bullet point is deleted via the corresponding control', async () => {
        // Arrange
        const mockFn = jest.fn<void, [number, number]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          deleteBulletPoint: mockFn,
        });

        render(<Education {...getProps({ functions })} />);
        const user = userEvent.setup();

        const deleteBulletPointBtn = screen.getByRole('button', {
          name: 'Delete bullet point 1',
        });

        // Act
        await user.click(deleteBulletPointBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(DATA.shownDegreeIndex, 0);
      });

      it('should call `editBulletPoint(degreeIndex, itemIndex, value)` when a bullet point is edited via the corresponding text input', async () => {
        // Arrange
        const mockFn = jest.fn<void, [number, number, string]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          editBulletPoint: mockFn,
        });

        render(<Education {...getProps({ functions })} />);
        const user = userEvent.setup();

        const input = screen.getByRole('textbox', { name: 'Bullet point 1' });
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(
          DATA.shownDegreeIndex,
          0,
          `${DATA.degrees[DATA.shownDegreeIndex].bulletPoints[0].value}s`,
        );
      });

      it('should call `editDegree(degreeIndex, field, value)` when a text field of a degree is changed via the corresponding text input', async () => {
        // Arrange
        const mockFn = jest.fn<void, [number, Field, string]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          editDegree: mockFn,
        });

        render(<Education {...getProps({ functions })} />);
        const user = userEvent.setup();

        const input = screen.getByRole('textbox', { name: 'Degree' });
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(
          DATA.shownDegreeIndex,
          'degree',
          `${DATA.degrees[DATA.shownDegreeIndex].degree}s`,
        );
      });

      it('should call `updateScreenReaderAnnouncement` when an important change is made to a degree via its controls or text inputs', async () => {
        // Arrange
        const mockFn = jest.fn<void, [string]>();
        const props = getProps({ updateScreenReaderAnnouncement: mockFn });

        render(<Education {...props} />);
        const user = userEvent.setup();

        const deleteBtn = screen.getByRole('button', {
          name: 'Delete bullet point 1',
        });

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
    render(<Education {...getProps({ ref })} />);
    const education = screen.getByRole('tabpanel');

    // Assert
    expect(ref.current).toBe(education);
  });
});
