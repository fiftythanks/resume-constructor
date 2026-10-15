/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */
import type { RefObject } from 'react';

import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Degree from './Degree';

import type { DegreeProps } from './Degree';
import type { DegreeFunctions } from './Education';
import type { Degree as DegreeType, ItemWithId } from '@/types/resumeData';

const DATA: DegreeType = {
  address: 'some address',
  degree: 'some degree',
  graduation: 'whenever',
  id: crypto.randomUUID(),
  uni: 'some university name',
  //! Must be no less than 3 for this test suite.
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
};

type Field = 'address' | 'degree' | 'graduation' | 'uni';

const FUNCTIONS: DegreeFunctions = {
  addBulletPoint() {},
  deleteBulletPoint(_itemIndex: number) {},
  edit(_field: Field, _value: string) {},
  editBulletPoint(_itemIndex: number, _value: string) {},
  updateBulletPoints(_value: ItemWithId[]) {},
};

function getProps(overrides?: Partial<DegreeProps>): DegreeProps {
  return {
    data: structuredClone(DATA),
    firstFormFieldRef: { current: null },
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

function getInput(name: string) {
  return page.getByRole('textbox', { name });
}

describe('Degree', () => {
  it('should assign the University Name input field to `firstFormFieldRef.current`', async () => {
    const firstFormFieldRef: RefObject<HTMLInputElement | null> = {
      current: null,
    };
    await render(<Degree {...getProps({ firstFormFieldRef })} />);

    const universityNameField = page.getByRole('textbox', {
      name: 'University Name',
    });

    expect(firstFormFieldRef.current).toBe(universityNameField.element());
  });

  describe('Fields', () => {
    describe('University Name', () => {
      it('should render a text input for University Name', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('University Name');

        await expect.element(input).toBeInTheDocument();
      });

      it('should have a placeholder "e.g. University of California, Berkeley" for University Name', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('University Name');

        await expect
          .element(input)
          .toHaveAttribute(
            'placeholder',
            'e.g. University of California, Berkeley',
          );
      });

      it('should have the correct value from `data` for University Name', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('University Name');

        await expect.element(input).toHaveValue(DATA.uni);
      });
    });

    describe('Degree', () => {
      it('should render a text input for Degree', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('Degree');

        await expect.element(input).toBeInTheDocument();
      });

      it('should have a placeholder "e.g. B.S. in Computer Science" for Degree', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('Degree');

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'e.g. B.S. in Computer Science');
      });

      it('should have the correct value from `data` for Degree', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('Degree');

        await expect.element(input).toHaveValue(DATA.degree);
      });
    });

    describe('Graduation', () => {
      it('should render a text input for Graduation', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('Graduation');

        await expect.element(input).toBeInTheDocument();
      });

      it('should have a placeholder "e.g. May 2021" for Graduation', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('Graduation');

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'e.g. May 2021');
      });

      it('should have the correct value from `data` for Graduation', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('Graduation');

        await expect.element(input).toHaveValue(DATA.graduation);
      });
    });

    describe('Address', () => {
      it('should render a text input for Address', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('Address');

        await expect.element(input).toBeInTheDocument();
      });

      it('should have a placeholder "e.g. Berkeley, CA, USA" for Address', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('Address');

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'e.g. Berkeley, CA, USA');
      });

      it('should have the correct value from `data` for Address', async () => {
        await render(<Degree {...getProps()} />);

        const input = getInput('Address');

        await expect.element(input).toHaveValue(DATA.address);
      });
    });
  });

  it('should call `edit(field, value)` when fields are changed via the corresponding text inputs', async () => {
    // Arrange
    type Field = 'address' | 'degree' | 'graduation' | 'uni';
    const mockFn = vi.fn((_field: Field, _value: string) => {});
    const functions = cloneDeep({ ...FUNCTIONS, edit: mockFn });

    await render(<Degree {...getProps({ functions })} />);
    const user = userEvent.setup();

    /**
     * Tabbing via `UserEvent.tab()` behaves kind of unpredictable in this
     * case. Simply `HTMLInputElement.focus()`-ing text boxes is more reliable.
     */
    const uniInput = getInput('University Name');
    const degreeInput = getInput('Degree');
    const graduationInput = getInput('Graduation');
    const addressInput = getInput('Address');

    // Act
    uniInput.element().focus();
    await user.keyboard('s');
    degreeInput.element().focus();
    await user.keyboard('s');
    graduationInput.element().focus();
    await user.keyboard('s');
    addressInput.element().focus();
    await user.keyboard('s');

    // Assert
    expect(mockFn).toHaveBeenCalledTimes(4);
    expect(mockFn).toHaveBeenCalledWith('uni', `${DATA.uni}s`);
    expect(mockFn).toHaveBeenCalledWith('degree', `${DATA.degree}s`);
    expect(mockFn).toHaveBeenCalledWith('graduation', `${DATA.graduation}s`);
    expect(mockFn).toHaveBeenCalledWith('address', `${DATA.address}s`);
  });

  describe('Bullet points', () => {
    it('should render bullet points with an accessible name "Bullet Points"', async () => {
      await render(<Degree {...getProps()} />);

      const bullets = page.getByRole('group', { name: 'Bullet Points' });

      await expect.element(bullets).toBeInTheDocument();
    });

    function getBulletInputGetter() {
      const bullets = page.getByRole('group', { name: 'Bullet Points' });

      function getBulletInput(name: string) {
        return bullets.getByRole('textbox', { name });
      }

      return getBulletInput;
    }

    it('should have the correct data from `data`', async () => {
      await render(<Degree {...getProps()} />);
      const getBulletInput = getBulletInputGetter();

      const input1 = getBulletInput('Bullet point 1');
      const input2 = getBulletInput('Bullet point 2');
      const input3 = getBulletInput('Bullet point 3');

      await expect.element(input1).toHaveValue(DATA.bulletPoints[0].value);
      await expect
        .element(input1)
        .toHaveAttribute('id', DATA.bulletPoints[0].id);
      await expect.element(input2).toHaveValue(DATA.bulletPoints[1].value);
      await expect
        .element(input2)
        .toHaveAttribute('id', DATA.bulletPoints[1].id);
      await expect.element(input3).toHaveValue(DATA.bulletPoints[2].value);
      await expect
        .element(input3)
        .toHaveAttribute('id', DATA.bulletPoints[2].id);
    });

    it('should have placeholders "Relevant coursework: Data Structures, Algorithms, Web Development", "Graduated with Honors, GPA: 3.8/4.0", "Led a team project to build a React-based student portal" for the first 3 bullet points', async () => {
      // Arrange
      await render(<Degree {...getProps()} />);
      const getBulletInput = getBulletInputGetter();

      const placeholders = [
        'Relevant coursework: Data Structures, Algorithms, Web Development',
        'Graduated with Honors, GPA: 3.8/4.0',
        'Led a team project to build a React-based student portal',
      ];

      // Act
      const input1 = getBulletInput('Bullet point 1');
      const input2 = getBulletInput('Bullet point 2');
      const input3 = getBulletInput('Bullet point 3');

      // Assert
      await expect
        .element(input1)
        .toHaveAttribute('placeholder', placeholders[0]);
      await expect
        .element(input2)
        .toHaveAttribute('placeholder', placeholders[1]);
      await expect
        .element(input3)
        .toHaveAttribute('placeholder', placeholders[2]);
    });

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to the bullet points via the corresponding controls (not DnD related)', async () => {
      // Arrange
      const mockFn = vi.fn((_announcement: string) => {});
      const props = getProps({ updateScreenReaderAnnouncement: mockFn });

      await render(<Degree {...props} />);
      const user = userEvent.setup();

      const deleteBtn = page.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      // Act
      await user.click(deleteBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `addBulletPoint` when a bullet point is added', async () => {
      // Arrange
      const mockFn = vi.fn();
      const functions = cloneDeep({ ...FUNCTIONS, addBulletPoint: mockFn });

      await render(<Degree {...getProps({ functions })} />);
      const user = userEvent.setup();
      const addBtn = page.getByRole('button', { name: 'Add bullet point' });

      // Act
      await user.click(addBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteBulletPoint` when a bullet point is deleted', async () => {
      // Arrange
      const mockFn = vi.fn((_index: number) => {});
      const functions = cloneDeep({ ...FUNCTIONS, deleteBulletPoint: mockFn });

      await render(<Degree {...getProps({ functions })} />);
      const user = userEvent.setup();

      const deleteBtn = page.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      // Act
      await user.click(deleteBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(0);
    });

    it("should call `editBulletPoint` when a bullet point is edited via it's corresponding text input", async () => {
      // Arrange
      const mockFn = vi.fn((_index: number, _value: string) => {});
      const functions = cloneDeep({ ...FUNCTIONS, editBulletPoint: mockFn });

      await render(<Degree {...getProps({ functions })} />);
      const user = userEvent.setup();

      const input = page.getByRole('textbox', { name: 'Bullet point 1' });
      input.element().focus();

      // Act
      await user.keyboard('s');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(0, `${DATA.bulletPoints[0].value}s`);
    });

    // TODO: find a way to test `updateBulletPoints` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.
  });
});
