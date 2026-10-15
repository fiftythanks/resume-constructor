/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Skills from './Skills';

import type { SkillsProps } from './Skills';
import type { ResumeData } from '@/types/resumeData';

function getProps(overrides?: Partial<SkillsProps>): SkillsProps {
  return {
    data: {
      frameworks: [
        {
          id: crypto.randomUUID(),
          value: 'framework 1',
        },
        {
          id: crypto.randomUUID(),
          value: 'framework 2',
        },
        {
          id: crypto.randomUUID(),
          value: 'framework 3',
        },
      ],
      languages: [
        {
          id: crypto.randomUUID(),
          value: 'language 1',
        },
        {
          id: crypto.randomUUID(),
          value: 'language 2',
        },
        {
          id: crypto.randomUUID(),
          value: 'language 3',
        },
      ],
      tools: [
        {
          id: crypto.randomUUID(),
          value: 'tool 1',
        },
        {
          id: crypto.randomUUID(),
          value: 'tool 2',
        },
        {
          id: crypto.randomUUID(),
          value: 'tool 3',
        },
      ],
    },
    functions: {
      updateSkills<T extends 'frameworks' | 'languages' | 'tools'>(
        _field: T,
        _value: ResumeData['skills'][T],
      ) {},
      addLanguage() {},
      deleteLanguage(_index: number) {},
      editLanguage(_index: number, _value: string) {},
      addFramework() {},
      deleteFramework() {},
      editFramework(_index: number, _value: string) {},
      addTool() {},
      deleteTool(_index) {},
      editTool(_index: number, _value: string) {},
    },
    ref: { current: null },
    updateScreenReaderAnnouncement(_announcement) {},
    ...overrides,
  };
}

describe('Skills', () => {
  describe('Languages', () => {
    it('should call `updateSkills` with `"languages"` and the reordered languages when a language is dragged and dropped onto another language', async () => {
      // ARRANGE
      await render(<div aria-label="Skills" id="skills" />);

      const updateSkillsMock = vi.fn(
        <T extends 'frameworks' | 'languages' | 'tools'>(
          _field: T,
          _value: ResumeData['skills'][T],
        ) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, updateSkills: updateSkillsMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();
      const languages = page.getByRole('group', { name: 'Languages' });
      const firstDragHandle = languages.getByRole('button', {
        name: 'Drag bullet point 1',
      });
      const thirdDragHandle = languages.getByRole('button', {
        name: 'Drag bullet point 3',
      });

      // ACT
      await user.dragAndDrop(firstDragHandle, thirdDragHandle, { steps: 5 });

      // ASSERT
      expect(updateSkillsMock).toHaveBeenCalledTimes(1);
      expect(updateSkillsMock).toHaveBeenCalledWith('languages', [
        props.data.languages[1],
        props.data.languages[2],
        props.data.languages[0],
      ]);
    });
  });

  describe('Frameworks', () => {
    it('should call `updateSkills` with `"frameworks"` and the reordered frameworks when a framework is dragged and dropped onto another framework', async () => {
      // ARRANGE
      await render(<div aria-label="Skills" id="skills" />);

      const updateSkillsMock = vi.fn(
        <T extends 'frameworks' | 'languages' | 'tools'>(
          _field: T,
          _value: ResumeData['skills'][T],
        ) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, updateSkills: updateSkillsMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();
      const frameworks = page.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });
      const firstDragHandle = frameworks.getByRole('button', {
        name: 'Drag bullet point 1',
      });
      const thirdDragHandle = frameworks.getByRole('button', {
        name: 'Drag bullet point 3',
      });

      // ACT
      await user.dragAndDrop(firstDragHandle, thirdDragHandle, { steps: 5 });

      // ASSERT
      expect(updateSkillsMock).toHaveBeenCalledTimes(1);
      expect(updateSkillsMock).toHaveBeenCalledWith('frameworks', [
        props.data.frameworks[1],
        props.data.frameworks[2],
        props.data.frameworks[0],
      ]);
    });
  });

  describe('Tools', () => {
    it('should call `updateSkills` with `"tools"` and the reordered tools when a tool is dragged and dropped onto another tool', async () => {
      // ARRANGE
      await render(<div aria-label="Skills" id="skills" />);

      const updateSkillsMock = vi.fn(
        <T extends 'frameworks' | 'languages' | 'tools'>(
          _field: T,
          _value: ResumeData['skills'][T],
        ) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, updateSkills: updateSkillsMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();
      const tools = page.getByRole('group', {
        name: 'Tools & Other Technologies',
      });
      const firstDragHandle = tools.getByRole('button', {
        name: 'Drag bullet point 1',
      });
      const thirdDragHandle = tools.getByRole('button', {
        name: 'Drag bullet point 3',
      });

      // ACT
      await user.dragAndDrop(firstDragHandle, thirdDragHandle, { steps: 5 });

      // ASSERT
      expect(updateSkillsMock).toHaveBeenCalledTimes(1);
      expect(updateSkillsMock).toHaveBeenCalledWith('tools', [
        props.data.tools[1],
        props.data.tools[2],
        props.data.tools[0],
      ]);
    });
  });
});
