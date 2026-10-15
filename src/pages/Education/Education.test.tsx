/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

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
    ref: { current: null },
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Education', () => {
  beforeEach(async () => {
    // `Education` gets its accessible name from this element.
    await render(<div aria-label="Education" id="education" />);
  });

  it('should render as a tabpanel with an accessible name derived from an element with an ID "education"', async () => {
    await render(<Education {...getProps()} />);

    const education = page.getByRole('tabpanel', { name: 'Education' });

    await expect.element(education).toBeInTheDocument();
  });

  it('should render a heading "Degree [index + 1]"', async () => {
    await render(<Education {...getProps()} />);

    const heading = page.getByRole('heading', { name: 'Degree 1' });

    await expect.element(heading).toBeInTheDocument();
  });

  describe('"Show Previous / Next Degree" buttons', () => {
    describe('"Show Previous Degree" button', () => {
      it('should not render the button if the shown degree is the first one', async () => {
        await render(<Education {...getProps()} />);

        const btn = page.getByRole('button', {
          name: 'Show Previous Degree',
        });

        await expect.element(btn).not.toBeInTheDocument();
      });

      it("should render the button if the shown degree isn't the first one", async () => {
        const data = structuredClone({ ...DATA, shownDegreeIndex: 1 });
        await render(<Education {...getProps({ data })} />);

        const btn = page.getByRole('button', {
          name: 'Show Previous Degree',
        });

        await expect.element(btn).toBeInTheDocument();
      });

      it('should call `showDegree(shownDegreeIndex - 1)` when the button is clicked', async () => {
        // Arrange
        const data = structuredClone({ ...DATA, shownDegreeIndex: 1 });
        const mockFn = vi.fn((_index: number) => {});
        const functions = cloneDeep({ ...FUNCTIONS, showDegree: mockFn });

        await render(<Education {...getProps({ data, functions })} />);
        const user = userEvent.setup();

        const btn = page.getByRole('button', {
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
      it("should render the button if the shown degree isn't the last one", async () => {
        await render(<Education {...getProps()} />);

        const btn = page.getByRole('button', { name: 'Show Next Degree' });

        await expect.element(btn).toBeInTheDocument();
      });

      it('should not render the button if the shown degree is the last one', async () => {
        const shownDegreeIndex = DATA.degrees.length - 1;
        const data = structuredClone({ ...DATA, shownDegreeIndex });
        await render(<Education {...getProps({ data })} />);

        const btn = page.getByRole('button', { name: 'Show Next Degree' });

        await expect.element(btn).not.toBeInTheDocument();
      });

      it('should call `showDegree(shownDegreeIndex + 1)` when the button is clicked', async () => {
        // Arrange
        const mockFn = vi.fn((_index: number) => {});
        const functions = cloneDeep({ ...FUNCTIONS, showDegree: mockFn });
        const props = getProps({ functions });

        await render(<Education {...props} />);
        const user = userEvent.setup();
        const btn = page.getByRole('button', { name: 'Show Next Degree' });

        // Act
        await user.click(btn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('"Add Degree" button', () => {
    it('should render a button "Add Degree [number of degrees + 1]', async () => {
      await render(<Education {...getProps()} />);

      const btn = page.getByRole('button', {
        name: `Add Degree ${DATA.degrees.length + 1}`,
      });

      await expect.element(btn).toBeInTheDocument();
    });

    it('should call `addDegree` when the button is clicked', async () => {
      // Arrange
      const mockFn = vi.fn();
      const functions = cloneDeep({ ...FUNCTIONS, addDegree: mockFn });

      await render(<Education {...getProps({ functions })} />);
      const user = userEvent.setup();

      const btn = page.getByRole('button', {
        name: `Add Degree ${DATA.degrees.length + 1}`,
      });

      // Act
      await user.click(btn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('"Delete Degree" button', () => {
    it('should render a "Delete Degree [shown degree index + 1]" button if there is more than one degree', async () => {
      await render(<Education {...getProps()} />);

      const btn = page.getByRole('button', {
        name: `Delete Degree ${DATA.shownDegreeIndex + 1}`,
      });

      await expect.element(btn).toBeInTheDocument();
    });

    it("should not render the button if there's just one degree", async () => {
      const data = structuredClone({ ...DATA, degrees: [DATA.degrees[0]] });
      await render(<Education {...getProps({ data })} />);

      const btn = page.getByRole('button', { name: 'Delete Degree 1' });

      await expect.element(btn).not.toBeInTheDocument();
    });

    it('should call `deleteDegree(shownDegreeIndex)` when the button is called', async () => {
      // Arrange
      const mockFn = vi.fn((_index: number) => {});
      const functions = cloneDeep({ ...FUNCTIONS, deleteDegree: mockFn });

      await render(<Education {...getProps({ functions })} />);
      const user = userEvent.setup();

      const btn = page.getByRole('button', {
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

      beforeEach(async () => {
        await render(<Education {...getProps()} />);
      });

      it('should have the correct university name', async () => {
        const input = page.getByRole('textbox', {
          name: 'University Name',
        });

        await expect.element(input).toHaveValue(uni);
      });

      it('should have the correct degree', async () => {
        const input = page.getByRole('textbox', {
          name: 'Degree',
        });

        await expect.element(input).toHaveValue(degree);
      });

      it('should have the correct graduation', async () => {
        const input = page.getByRole('textbox', {
          name: 'Graduation',
        });

        await expect.element(input).toHaveValue(graduation);
      });

      it('should have the correct address', async () => {
        const input = page.getByRole('textbox', {
          name: 'Address',
        });

        await expect.element(input).toHaveValue(address);
      });

      describe('bullet points', () => {
        const { bulletPoints } = DATA.degrees[degreeIndex];

        describe('bullet point 1', () => {
          it('should have the correct value', async () => {
            const input = page.getByRole('textbox', {
              name: 'Bullet point 1',
            });

            await expect.element(input).toHaveValue(bulletPoints[0].value);
          });

          it('should have the correct ID', async () => {
            const input = page.getByRole('textbox', {
              name: 'Bullet point 1',
            });

            await expect
              .element(input)
              .toHaveAttribute('id', bulletPoints[0].id);
          });
        });

        describe('bullet point 2', () => {
          it('should have the correct value', async () => {
            const input = page.getByRole('textbox', {
              name: 'Bullet point 2',
            });

            await expect.element(input).toHaveValue(bulletPoints[1].value);
          });

          it('should have the correct ID', async () => {
            const input = page.getByRole('textbox', {
              name: 'Bullet point 2',
            });

            await expect
              .element(input)
              .toHaveAttribute('id', bulletPoints[1].id);
          });
        });

        describe('bullet point 3', () => {
          it('should have the correct value', async () => {
            const input = page.getByRole('textbox', {
              name: 'Bullet point 3',
            });

            await expect.element(input).toHaveValue(bulletPoints[2].value);
          });

          it('should have the correct ID', async () => {
            const input = page.getByRole('textbox', {
              name: 'Bullet point 3',
            });

            await expect
              .element(input)
              .toHaveAttribute('id', bulletPoints[2].id);
          });
        });
      });
    });

    describe('Functions', () => {
      it('should call `addBulletPoint(degreeIndex)` when a bullet point is added via the corresponding control', async () => {
        // Arrange
        const mockFn = vi.fn((_bulletIndex: number) => {});
        const functions = cloneDeep({ ...FUNCTIONS, addBulletPoint: mockFn });

        await render(<Education {...getProps({ functions })} />);
        const user = userEvent.setup();

        const addBulletPointBtn = page.getByRole('button', {
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
        const mockFn = vi.fn(implementation);
        const functions = cloneDeep(FUNCTIONS);
        functions.deleteBulletPoint = mockFn;

        await render(<Education {...getProps({ functions })} />);
        const user = userEvent.setup();

        const deleteBulletPointBtn = page.getByRole('button', {
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
        const mockFn = vi.fn(
          (_degreeIndex: number, _itemIndex: number, _value: string) => {},
        );

        const functions = cloneDeep({
          ...FUNCTIONS,
          editBulletPoint: mockFn,
        });

        await render(<Education {...getProps({ functions })} />);
        const user = userEvent.setup();

        const input = page.getByRole('textbox', { name: 'Bullet point 1' });
        input.element().focus();

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
        const mockFn = vi.fn(
          (_degreeIndex: number, _field: Field, _value: string) => {},
        );

        const functions = cloneDeep({
          ...FUNCTIONS,
          editDegree: mockFn,
        });

        await render(<Education {...getProps({ functions })} />);
        const user = userEvent.setup();

        const input = page.getByRole('textbox', { name: 'Degree' });
        input.element().focus();

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

      /**
       * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
       * the test's name should be changed.
       */
      it('should call `updateScreenReaderAnnouncement` when an important change is made to a degree via its controls or text inputs (not DnD-related)', async () => {
        // Arrange
        const mockFn = vi.fn((_announcement: string) => {});
        const props = getProps({ updateScreenReaderAnnouncement: mockFn });

        await render(<Education {...props} />);
        const user = userEvent.setup();

        const deleteBtn = page.getByRole('button', {
          name: 'Delete bullet point 1',
        });

        // Act
        await user.click(deleteBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('should pass the section element to `ref.current`', async () => {
    const ref = { current: null };
    await render(<Education {...getProps({ ref })} />);

    const education = page.getByRole('tabpanel');

    expect(ref.current).toBe(education.element());
  });
});
