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
  id: '00000000-0000-0000-0000-000000000001',
  uni: 'some university name',
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
    it.each([
      ['University Name', 'e.g. University of California, Berkeley', DATA.uni],
      ['Degree', 'e.g. B.S. in Computer Science', DATA.degree],
      ['Graduation', 'e.g. May 2021', DATA.graduation],
      ['Address', 'e.g. Berkeley, CA, USA', DATA.address],
    ] as const)(
      'should render %s text input with placeholder and value',
      (fieldName, placeholder, expectedValue) => {
        // Arrange & Act
        render(<Degree {...getProps()} />);
        const input = getInput(fieldName);

        // Assert
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', placeholder);
        expect(input).toHaveValue(expectedValue);
      },
    );

    it.each([
      ['University Name', 'uni', `${DATA.uni}s`],
      ['Degree', 'degree', `${DATA.degree}s`],
      ['Graduation', 'graduation', `${DATA.graduation}s`],
      ['Address', 'address', `${DATA.address}s`],
    ] as const)(
      'should call `edit(field, value)` when %s input is edited',
      async (fieldName, fieldKey, expectedValue) => {
        // Arrange
        const mockFn = jest.fn<void, [Field, string]>();
        const functions = cloneDeep({ ...FUNCTIONS, edit: mockFn });
        render(<Degree {...getProps({ functions })} />);
        const user = userEvent.setup();
        const input = getInput(fieldName);
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(fieldKey, expectedValue);
      },
    );
  });

  describe('Bullet points', () => {
    it('should render bullet points with an accessible name "Bullet Points"', () => {
      // Arrange & Act
      render(<Degree {...getProps()} />);
      const bullets = screen.getByRole('group', { name: 'Bullet Points' });

      // Assert
      expect(bullets).toBeInTheDocument();
    });

    function getBulletInputGetter() {
      const bullets = screen.getByRole('group', { name: 'Bullet Points' });

      return (name: string): HTMLInputElement =>
        getByRole(bullets, 'textbox', { name });
    }

    it('should have the correct data from `data`', () => {
      // Arrange & Act
      render(<Degree {...getProps()} />);
      const getBulletInput = getBulletInputGetter();

      const input1 = getBulletInput('Bullet point 1');
      const input2 = getBulletInput('Bullet point 2');
      const input3 = getBulletInput('Bullet point 3');

      // Assert
      expect(input1).toHaveValue(DATA.bulletPoints[0].value);
      expect(input1).toHaveAttribute('id', DATA.bulletPoints[0].id);
      expect(input2).toHaveValue(DATA.bulletPoints[1].value);
      expect(input2).toHaveAttribute('id', DATA.bulletPoints[1].id);
      expect(input3).toHaveValue(DATA.bulletPoints[2].value);
      expect(input3).toHaveAttribute('id', DATA.bulletPoints[2].id);
    });

    it('should have placeholders for the first 3 bullet points', () => {
      // Arrange & Act
      render(<Degree {...getProps()} />);
      const getBulletInput = getBulletInputGetter();

      const input1 = getBulletInput('Bullet point 1');
      const input2 = getBulletInput('Bullet point 2');
      const input3 = getBulletInput('Bullet point 3');

      // Assert
      expect(input1).toHaveAttribute(
        'placeholder',
        'Relevant coursework: Data Structures, Algorithms, Web Development',
      );
      expect(input2).toHaveAttribute(
        'placeholder',
        'Graduated with Honors, GPA: 3.8/4.0',
      );
      expect(input3).toHaveAttribute(
        'placeholder',
        'Led a team project to build a React-based student portal',
      );
    });

    it('should call `updateScreenReaderAnnouncement` when an important change is made to the bullet points via the corresponding controls', async () => {
      // Arrange
      const mockFn = jest.fn<void, [string]>();
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
      const mockFn = jest.fn<void, [number]>();
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

    it('should call `editBulletPoint` when a bullet point is edited via its corresponding text input', async () => {
      // Arrange
      const mockFn = jest.fn<void, [number, string]>();
      const functions = cloneDeep({ ...FUNCTIONS, editBulletPoint: mockFn });

      render(<Degree {...getProps({ functions })} />);
      const user = userEvent.setup();

      const input = screen.getByRole('textbox', { name: 'Bullet point 1' });
      input.focus();

      // Act
      await user.keyboard('s');

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(0, `${DATA.bulletPoints[0].value}s`);
    });
  });
});
