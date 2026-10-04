import { getByRole, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Skills from './Skills';

import type { SkillsProps } from './Skills';
import type { ResumeData } from '@/types/resumeData';

const DATA: SkillsProps['data'] = {
  frameworks: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      value: 'framework',
    },
  ],
  languages: [
    {
      id: '00000000-0000-0000-0000-000000000002',
      value: 'language',
    },
  ],
  tools: [
    {
      id: '00000000-0000-0000-0000-000000000003',
      value: 'tool',
    },
  ],
};

const FUNCTIONS: SkillsProps['functions'] = {
  addFramework() {},
  addLanguage() {},
  addTool() {},
  deleteFramework(_index: number) {},
  deleteLanguage(_index: number) {},
  deleteTool(_index: number) {},
  editFramework(_index: number, _value: string) {},
  editLanguage(_index: number, _value: string) {},
  editTool(_index: number, _value: string) {},
  updateSkills<T extends 'frameworks' | 'languages' | 'tools'>(
    _field: T,
    _value: ResumeData['skills'][T],
  ) {},
};

function getProps(overrides?: Partial<SkillsProps>): SkillsProps {
  return {
    data: structuredClone(DATA),
    functions: cloneDeep(FUNCTIONS),
    ref: { current: null },
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Skills', () => {
  beforeEach(() => {
    const labelledElement = document.createElement('div');
    labelledElement.id = 'skills';
    labelledElement.setAttribute('aria-label', 'Skills');
    document.body.appendChild(labelledElement);
  });

  afterEach(() => {
    document.getElementById('skills')?.remove();
  });

  it('should render as a tabpanel with an accessible name derived from an element with an ID "skills"', () => {
    render(<Skills {...getProps()} />);

    const skills = screen.getByRole('tabpanel', { name: 'Skills' });

    expect(skills).toBeInTheDocument();
  });

  it('should pass the section element to `ref.current`', () => {
    // Arrange
    const ref = { current: null };

    // Act
    render(<Skills {...getProps({ ref })} />);
    const skills = screen.getByRole('tabpanel');

    // Assert
    expect(ref.current).toBe(skills);
  });

  describe.each([
    {
      addBtnName: 'Add language',
      addFnName: 'addLanguage' as const,
      categoryKey: 'languages' as const,
      deleteFnName: 'deleteLanguage' as const,
      editFnName: 'editLanguage' as const,
      groupName: 'Languages',
    },
    {
      addBtnName: 'Add framework',
      addFnName: 'addFramework' as const,
      categoryKey: 'frameworks' as const,
      deleteFnName: 'deleteFramework' as const,
      editFnName: 'editFramework' as const,
      groupName: 'Frameworks, Libraries & Databases',
    },
    {
      addBtnName: 'Add tool',
      addFnName: 'addTool' as const,
      categoryKey: 'tools' as const,
      deleteFnName: 'deleteTool' as const,
      editFnName: 'editTool' as const,
      groupName: 'Tools & Other Technologies',
    },
  ])(
    '$groupName',
    ({
      addBtnName,
      addFnName,
      categoryKey,
      deleteFnName,
      editFnName,
      groupName,
    }) => {
      it(`should render ${groupName} bullet points with correct initial data`, () => {
        // Arrange & Act
        render(<Skills {...getProps()} />);
        const group = screen.getByRole('group', { name: groupName });

        // Assert
        expect(group).toBeInTheDocument();
        DATA[categoryKey].forEach((item, index) => {
          const input = getByRole(group, 'textbox', {
            name: `Bullet point ${index + 1}`,
          });

          expect(input).toHaveAttribute('id', item.id);
          expect(input).toHaveValue(item.value);
        });
      });

      it(`should call \`${addFnName}\` when an item is added via the add button`, async () => {
        // Arrange
        const mockFn = jest.fn();
        const functions = cloneDeep({
          ...FUNCTIONS,
          [addFnName]: mockFn,
        });
        render(<Skills {...getProps({ functions })} />);
        const user = userEvent.setup();
        const addBtn = screen.getByRole('button', { name: addBtnName });

        // Act
        await user.click(addBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it(`should call \`${deleteFnName}\` when an item is deleted via the delete button`, async () => {
        // Arrange
        const mockFn = jest.fn<void, [number]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          [deleteFnName]: mockFn,
        });
        render(<Skills {...getProps({ functions })} />);
        const user = userEvent.setup();
        const group = screen.getByRole('group', { name: groupName });
        const deleteBtn = getByRole(group, 'button', {
          name: 'Delete bullet point 1',
        });

        // Act
        await user.click(deleteBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(0);
      });

      it(`should call \`${editFnName}\` when an item is edited via the text input`, async () => {
        // Arrange
        const mockFn = jest.fn<void, [number, string]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          [editFnName]: mockFn,
        });
        render(<Skills {...getProps({ functions })} />);
        const user = userEvent.setup();
        const group = screen.getByRole('group', { name: groupName });
        const input = getByRole(group, 'textbox', {
          name: 'Bullet point 1',
        });
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(
          0,
          `${DATA[categoryKey][0].value}s`,
        );
      });

      it('should call `updateScreenReaderAnnouncement` when an important change is made via controls', async () => {
        // Arrange
        const updateScreenReaderAnnouncementMock = jest.fn<void, [string]>();
        const props = getProps({
          updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
        });
        render(<Skills {...props} />);
        const user = userEvent.setup();
        const group = screen.getByRole('group', { name: groupName });
        const deleteBtn = getByRole(group, 'button', {
          name: 'Delete bullet point 1',
        });

        // Act
        await user.click(deleteBtn);

        // Assert
        expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
      });
    },
  );
});
