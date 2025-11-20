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

import Education from './Education';

import type { EducationProps } from './Education';
import type {
  Education as EducationType,
  ItemWithId,
} from '@/types/resumeData';

const DATA: EducationType = {
  shownDegreeIndex: 0,
  //! Must be no less than 3 for this test suite.
  degrees: [
    {
      address: 'some address 1',
      degree: 'some degree 1',
      graduation: 'whenever 1',
      id: crypto.randomUUID(),
      uni: 'some university name 1',
      bulletPoints: [
        {
          id: crypto.randomUUID(),
          value: 'bullet 1',
        },
        {
          id: crypto.randomUUID(),
          value: 'bullet 2',
        },
        {
          id: crypto.randomUUID(),
          value: 'bullet 3',
        },
      ],
    },
    {
      address: 'some address 2',
      degree: 'some degree 2',
      graduation: 'whenever 2',
      id: crypto.randomUUID(),
      uni: 'some university name 2',
      bulletPoints: [
        {
          id: crypto.randomUUID(),
          value: 'bullet 1',
        },
        {
          id: crypto.randomUUID(),
          value: 'bullet 2',
        },
        {
          id: crypto.randomUUID(),
          value: 'bullet 3',
        },
      ],
    },
    {
      address: 'some address 3',
      degree: 'some degree 3',
      graduation: 'whenever 3',
      id: crypto.randomUUID(),
      uni: 'some university name 3',
      bulletPoints: [
        {
          id: crypto.randomUUID(),
          value: 'bullet 1',
        },
        {
          id: crypto.randomUUID(),
          value: 'bullet 2',
        },
        {
          id: crypto.randomUUID(),
          value: 'bullet 3',
        },
      ],
    },
  ],
};

type Field = 'address' | 'degree' | 'graduation' | 'uni';

const FUNCTIONS: ReturnType<typeof useResumeData>['educationFunctions'] = {
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
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Education', () => {
  // `Education` gets its accessible name from this element.
  render(<div aria-label="Education" id="education" />);

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
        const mockFn = jest.fn((_index: number) => {});
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
        const mockFn = jest.fn((_index: number) => {});
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

    it('should call `deleteDegree(shownDegreeIndex)` when the button is called', async () => {
      // Arrange
      const mockFn = jest.fn((_index: number) => {});
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
    // TODO: should render a degree. (At the moment, the way `Education` is structured, it's hard to come up with a proper way to write this test. The component needs a refactor.)

    describe('Data', () => {
      const degreeIndex = DATA.shownDegreeIndex;
      const { address, degree, graduation, uni } = DATA.degrees[degreeIndex];

      beforeEach(() => {
        render(<Education {...getProps()} />);
      });

      it('should have the correct university name', () => {
        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'University Name',
        });

        expect(input.value).toBe(uni);
      });

      it('should have the correct degree', () => {
        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Degree',
        });

        expect(input.value).toBe(degree);
      });

      it('should have the correct graduation', () => {
        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Graduation',
        });

        expect(input.value).toBe(graduation);
      });

      it('should have the correct address', () => {
        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Address',
        });

        expect(input.value).toBe(address);
      });

      describe('bullet points', () => {
        const { bulletPoints } = DATA.degrees[degreeIndex];

        describe('bullet point 1', () => {
          it('should have the correct value', () => {
            const input: HTMLInputElement = screen.getByRole('textbox', {
              name: 'Bullet point 1',
            });

            expect(input.value).toBe(bulletPoints[0].value);
          });

          it('should have the correct ID', () => {
            const input: HTMLInputElement = screen.getByRole('textbox', {
              name: 'Bullet point 1',
            });

            expect(input.id).toBe(bulletPoints[0].id);
          });
        });

        describe('bullet point 2', () => {
          it('should have the correct value', () => {
            const input: HTMLInputElement = screen.getByRole('textbox', {
              name: 'Bullet point 2',
            });

            expect(input.value).toBe(bulletPoints[1].value);
          });

          it('should have the correct ID', () => {
            const input: HTMLInputElement = screen.getByRole('textbox', {
              name: 'Bullet point 2',
            });

            expect(input.id).toBe(bulletPoints[1].id);
          });
        });

        describe('bullet point 3', () => {
          it('should have the correct value', () => {
            const input: HTMLInputElement = screen.getByRole('textbox', {
              name: 'Bullet point 3',
            });

            expect(input.value).toBe(bulletPoints[2].value);
          });

          it('should have the correct ID', () => {
            const input: HTMLInputElement = screen.getByRole('textbox', {
              name: 'Bullet point 3',
            });

            expect(input.id).toBe(bulletPoints[2].id);
          });
        });
      });
    });

    describe('Functions', () => {
      it('should call `addBulletPoint(degreeIndex)` when a bullet point is added via the corresponding control', async () => {
        // Arrange
        const mockFn = jest.fn((_bulletIndex: number) => {});
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
        const implementation = (_bulletIndex: number, _itemIndex: number) => {};
        const mockFn = jest.fn(implementation);
        const functions = cloneDeep(FUNCTIONS);
        functions.deleteBulletPoint = mockFn;

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
        const mockFn = jest.fn(
          (_degreeIndex: number, _itemIndex: number, _value: string) => {},
        );

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
        const mockFn = jest.fn(
          (_degreeIndex: number, _field: Field, _value: string) => {},
        );

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

      // TODO: find a way to test `updateBulletPoints` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.

      /**
       * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
       * the test's name should be changed.
       */
      it('should call `updateScreenReaderAnnouncement` when an important change is made to a degree via its controls or text inputs (not DnD-related)', async () => {
        // Arrange
        const mockFn = jest.fn((_announcement: string) => {});
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
});
