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
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

function getInput(name: string): HTMLInputElement {
  return screen.getByRole('textbox', { name });
}

describe('Degree', () => {
  describe('Fields', () => {
    describe('University Name', () => {
      it('should render a text input for University Name', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('University Name');

        expect(input).toBeInTheDocument();
      });

      it('should have a placeholder "e.g. University of California, Berkeley" for University Name', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('University Name');

        expect(input.placeholder).toBe(
          'e.g. University of California, Berkeley',
        );
      });

      it('should have the correct value from `data` for University Name', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('University Name');

        expect(input.value).toBe(DATA.uni);
      });
    });

    describe('Degree', () => {
      it('should render a text input for Degree', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('Degree');

        expect(input).toBeInTheDocument();
      });

      it('should have a placeholder "e.g. B.S. in Computer Science" for Degree', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('Degree');

        expect(input.placeholder).toBe('e.g. B.S. in Computer Science');
      });

      it('should have the correct value from `data` for Degree', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('Degree');

        expect(input.value).toBe(DATA.degree);
      });
    });

    describe('Graduation', () => {
      it('should render a text input for Graduation', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('Graduation');

        expect(input).toBeInTheDocument();
      });

      it('should have a placeholder "e.g. May 2021" for Graduation', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('Graduation');

        expect(input.placeholder).toBe('e.g. May 2021');
      });

      it('should have the correct value from `data` for Graduation', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('Graduation');

        expect(input.value).toBe(DATA.graduation);
      });
    });

    describe('Address', () => {
      it('should render a text input for Address', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('Address');

        expect(input).toBeInTheDocument();
      });

      it('should have a placeholder "e.g. Berkeley, CA, USA" for Address', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('Address');

        expect(input.placeholder).toBe('e.g. Berkeley, CA, USA');
      });

      it('should have the correct value from `data` for Address', () => {
        render(<Degree {...getProps()} />);

        const input = getInput('Address');

        expect(input.value).toBe(DATA.address);
      });
    });
  });

  it('should call `edit(field, value)` when fields are changed via the corresponding text inputs', async () => {
    // Arrange
    type Field = 'address' | 'degree' | 'graduation' | 'uni';
    const mockFn = jest.fn((_field: Field, _value: string) => {});
    const functions = cloneDeep({ ...FUNCTIONS, edit: mockFn });

    render(<Degree {...getProps({ functions })} />);
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
    uniInput.focus();
    await user.keyboard('s');
    degreeInput.focus();
    await user.keyboard('s');
    graduationInput.focus();
    await user.keyboard('s');
    addressInput.focus();
    await user.keyboard('s');

    // Assert
    expect(mockFn).toHaveBeenCalledTimes(4);
    expect(mockFn).toHaveBeenCalledWith('uni', `${DATA.uni}s`);
    expect(mockFn).toHaveBeenCalledWith('degree', `${DATA.degree}s`);
    expect(mockFn).toHaveBeenCalledWith('graduation', `${DATA.graduation}s`);
    expect(mockFn).toHaveBeenCalledWith('address', `${DATA.address}s`);
  });

  describe('Bullet points', () => {
    it('should render bullet points with an accessible name "Bullet Points"', () => {
      render(<Degree {...getProps()} />);

      const bullets = screen.getByRole('group', { name: 'Bullet Points' });

      expect(bullets).toBeInTheDocument();
    });

    function getBulletInputGetter() {
      const bullets = screen.getByRole('group', { name: 'Bullet Points' });

      function getBulletInput(name: string): HTMLInputElement {
        return getByRole(bullets, 'textbox', { name });
      }

      return getBulletInput;
    }

    it('should have the correct data from `data`', () => {
      render(<Degree {...getProps()} />);
      const getBulletInput = getBulletInputGetter();

      const input1 = getBulletInput('Bullet point 1');
      const input2 = getBulletInput('Bullet point 2');
      const input3 = getBulletInput('Bullet point 3');

      expect(input1.value).toBe(DATA.bulletPoints[0].value);
      expect(input1.id).toBe(DATA.bulletPoints[0].id);
      expect(input2.value).toBe(DATA.bulletPoints[1].value);
      expect(input2.id).toBe(DATA.bulletPoints[1].id);
      expect(input3.value).toBe(DATA.bulletPoints[2].value);
      expect(input3.id).toBe(DATA.bulletPoints[2].id);
    });

    it('should have placeholders "Relevant coursework: Data Structures, Algorithms, Web Development", "Graduated with Honors, GPA: 3.8/4.0", "Led a team project to build a React-based student portal" for the first 3 bullet points', () => {
      // Arrange
      render(<Degree {...getProps()} />);
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
      expect(input1.placeholder).toBe(placeholders[0]);
      expect(input2.placeholder).toBe(placeholders[1]);
      expect(input3.placeholder).toBe(placeholders[2]);
    });

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to the bullet points via the corresponding controls (not DnD related)', async () => {
      // Arrange
      const mockFn = jest.fn((_announcement: string) => {});
      const props = getProps({ updateScreenReaderAnnouncement: mockFn });

      render(<Degree {...props} />);
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

      render(<Degree {...getProps({ functions })} />);
      const user = userEvent.setup();
      const addBtn = screen.getByRole('button', { name: 'Add bullet point' });

      // Act
      await user.click(addBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteBulletPoint` when a bullet point is deleted', async () => {
      // Arrange
      const mockFn = jest.fn((_index: number) => {});
      const functions = cloneDeep({ ...FUNCTIONS, deleteBulletPoint: mockFn });

      render(<Degree {...getProps({ functions })} />);
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

    it("should call `editBulletPoint` when a bullet point is edited via it's corresponding text input", async () => {
      // Arrange
      const mockFn = jest.fn((_index: number, _value: string) => {});
      const functions = cloneDeep({ ...FUNCTIONS, editBulletPoint: mockFn });

      render(<Degree {...getProps({ functions })} />);
      const user = userEvent.setup();

      const input = screen.getByRole('textbox', { name: 'Bullet point 1' });
      input.focus();

      // Act
      await user.keyboard('s');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(0, `${DATA.bulletPoints[0].value}s`);
    });

    // TODO: find a way to test `updateBulletPoints` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.
  });
});
