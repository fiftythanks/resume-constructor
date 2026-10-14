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
          value: 'framework',
        },
      ],
      languages: [
        {
          id: crypto.randomUUID(),
          value: 'language',
        },
      ],
      tools: [
        {
          id: crypto.randomUUID(),
          value: 'tool',
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

// correct data passed

/**
 * tools legend
 * addTool
 * deleteTool
 * editTool
 * updateScreenReaderAnnouncement for tools
 */

// TODO: find a way to test `updateSkills` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.

describe('Skills', () => {
  it('should render as a tabpanel with an accessible name derived from an element with an ID "skills"', async () => {
    await render(<div aria-label="Skills" id="skills" />);
    await render(<Skills {...getProps()} />);

    const skills = page.getByRole('tabpanel', { name: 'Skills' });

    await expect.element(skills).toBeInTheDocument();
  });

  describe('Languages', () => {
    it('should render Languages bullet points', async () => {
      await render(<div aria-label="Skills" id="skills" />);
      await render(<Skills {...getProps()} />);

      const languages = page.getByRole('group', { name: 'Languages' });

      await expect.element(languages).toBeInTheDocument();
    });

    it('should have the correct data from `data.languages` for Languages', async () => {
      const props = getProps();
      await render(<div aria-label="Skills" id="skills" />);
      await render(<Skills {...props} />);
      const languages = page.getByRole('group', { name: 'Languages' });

      for (let i = 0; i < props.data.languages.length; i++) {
        const { id, value } = props.data.languages[i];

        const input = languages.getByRole('textbox', {
          name: `Bullet point ${i + 1}`,
        });

        await expect.element(input).toHaveAttribute('id', id);
        await expect.element(input).toHaveValue(value);
      }
    });

    it('should call `addLanguage` when a language is added via the add-button', async () => {
      await render(<div aria-label="Skills" id="skills" />);
      const addLanguageMock = vi.fn();
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addLanguage: addLanguageMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();

      const addBtn = page.getByRole('button', {
        name: 'Add language',
      });

      await user.click(addBtn);

      expect(addLanguageMock).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteLanguage` with the correct index when a language is deleted via the corresponding delete button', async () => {
      await render(<div aria-label="Skills" id="skills" />);
      const deleteLanguageMock = vi.fn((_languageIndex: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, deleteLanguage: deleteLanguageMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();

      const languages = page.getByRole('group', { name: 'Languages' });

      const deleteBtn = languages.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(deleteLanguageMock).toHaveBeenCalledTimes(1);
      expect(deleteLanguageMock).toHaveBeenCalledWith(0);
    });

    it('should call `editLanguage` with the correct index when a language is edited via the corresponding text input', async () => {
      await render(<div aria-label="Skills" id="skills" />);

      const editLanguageMock = vi.fn(
        (_languageIndex: number, _value: string) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editLanguage: editLanguageMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();
      const languages = page.getByRole('group', { name: 'Languages' });
      const input = languages.getByRole('textbox', { name: 'Bullet point 1' });
      input.element().focus();

      await user.keyboard('s');

      expect(editLanguageMock).toHaveBeenCalledTimes(1);

      expect(editLanguageMock).toHaveBeenCalledWith(
        0,
        `${props.data.languages[0].value}s`,
      );
    });

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to Languages via the corresponding controls (not DnD related)', async () => {
      await render(<div aria-label="Skills" id="skills" />);

      const updateScreenReaderAnnouncementMock = vi.fn(
        (_announcement: string) => {},
      );

      const props = getProps({
        updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
      });

      await render(<Skills {...props} />);
      const user = userEvent.setup();
      const languages = page.getByRole('group', { name: 'Languages' });

      const deleteBtn = languages.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should pass the section element to `ref.current`', async () => {
    const ref = { current: null };
    await render(<Skills {...getProps({ ref })} />);

    const skills = page.getByRole('tabpanel');

    expect(ref.current).toBe(skills.element());
  });

  describe('Frameworks', () => {
    it('should render Frameworks bullet points', async () => {
      await render(<div aria-label="Skills" id="skills" />);
      await render(<Skills {...getProps()} />);

      const frameworks = page.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      await expect.element(frameworks).toBeInTheDocument();
    });

    it('should have the correct data from `data.frameworks` for Frameworks', async () => {
      const props = getProps();
      await render(<div aria-label="Skills" id="skills" />);
      await render(<Skills {...props} />);

      const frameworks = page.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      for (let i = 0; i < props.data.frameworks.length; i++) {
        const { id, value } = props.data.frameworks[i];

        const input = frameworks.getByRole('textbox', {
          name: `Bullet point ${i + 1}`,
        });

        await expect.element(input).toHaveAttribute('id', id);
        await expect.element(input).toHaveValue(value);
      }
    });

    it('should call `addFramework` when a framework is added via the add-button', async () => {
      await render(<div aria-label="Skills" id="skills" />);
      const addFrameworkMock = vi.fn();
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addFramework: addFrameworkMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();

      const addBtn = page.getByRole('button', {
        name: 'Add framework',
      });

      await user.click(addBtn);

      expect(addFrameworkMock).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteFramework` with the correct index when a framework is deleted via the corresponding delete button', async () => {
      await render(<div aria-label="Skills" id="skills" />);
      const deleteFrameworkMock = vi.fn((_frameworkIndex: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, deleteFramework: deleteFrameworkMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();

      const frameworks = page.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      const deleteBtn = frameworks.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(deleteFrameworkMock).toHaveBeenCalledTimes(1);
      expect(deleteFrameworkMock).toHaveBeenCalledWith(0);
    });

    it('should call `editFramework` with the correct index when a framework is edited via the corresponding text input', async () => {
      await render(<div aria-label="Skills" id="skills" />);

      const editFrameworkMock = vi.fn(
        (_frameworkIndex: number, _value: string) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editFramework: editFrameworkMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();
      const frameworks = page.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      const input = frameworks.getByRole('textbox', {
        name: 'Bullet point 1',
      });

      input.element().focus();

      await user.keyboard('s');

      expect(editFrameworkMock).toHaveBeenCalledTimes(1);

      expect(editFrameworkMock).toHaveBeenCalledWith(
        0,
        `${props.data.frameworks[0].value}s`,
      );
    });

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to Frameworks via the corresponding controls (not DnD related)', async () => {
      await render(<div aria-label="Skills" id="skills" />);

      const updateScreenReaderAnnouncementMock = vi.fn(
        (_announcement: string) => {},
      );

      const props = getProps({
        updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
      });

      await render(<Skills {...props} />);
      const user = userEvent.setup();
      const frameworks = page.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      const deleteBtn = frameworks.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tools', () => {
    it('should render Tools bullet points', async () => {
      await render(<div aria-label="Skills" id="skills" />);
      await render(<Skills {...getProps()} />);

      const tools = page.getByRole('group', {
        name: 'Tools & Other Technologies',
      });

      await expect.element(tools).toBeInTheDocument();
    });

    it('should have the correct data from `data.tools` for Tools', async () => {
      const props = getProps();
      await render(<div aria-label="Skills" id="skills" />);
      await render(<Skills {...props} />);

      const tools = page.getByRole('group', {
        name: 'Tools & Other Technologies',
      });

      for (let i = 0; i < props.data.tools.length; i++) {
        const { id, value } = props.data.tools[i];

        const toolInput = tools.getByRole('textbox', {
          name: `Bullet point ${i + 1}`,
        });

        await expect.element(toolInput).toHaveAttribute('id', id);
        await expect.element(toolInput).toHaveValue(value);
      }
    });

    it('should call `addTool` when a tool is added via the add-button', async () => {
      await render(<div aria-label="Skills" id="skills" />);
      const addToolMock = vi.fn();
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addTool: addToolMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();

      const addBtn = page.getByRole('button', {
        name: 'Add tool',
      });

      await user.click(addBtn);

      expect(addToolMock).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteTool` with the correct index when a tool is deleted via the corresponding delete button', async () => {
      await render(<div aria-label="Skills" id="skills" />);
      const deleteToolMock = vi.fn((_toolIndex: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, deleteTool: deleteToolMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();

      const tools = page.getByRole('group', {
        name: 'Tools & Other Technologies',
      });

      const deleteBtn = tools.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(deleteToolMock).toHaveBeenCalledTimes(1);
      expect(deleteToolMock).toHaveBeenCalledWith(0);
    });

    it('should call `editTool` with the correct index when a tool is edited via the corresponding text input', async () => {
      await render(<div aria-label="Skills" id="skills" />);

      const editToolMock = vi.fn((_toolIndex: number, _value: string) => {});

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editTool: editToolMock },
      };

      await render(<Skills {...props} />);
      const user = userEvent.setup();
      const tools = page.getByRole('group', {
        name: 'Tools & Other Technologies',
      });
      const input = tools.getByRole('textbox', { name: 'Bullet point 1' });
      input.element().focus();

      await user.keyboard('s');

      expect(editToolMock).toHaveBeenCalledTimes(1);

      expect(editToolMock).toHaveBeenCalledWith(
        0,
        `${props.data.tools[0].value}s`,
      );
    });

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to Tools via the corresponding controls (not DnD related)', async () => {
      await render(<div aria-label="Skills" id="skills" />);

      const updateScreenReaderAnnouncementMock = vi.fn(
        (_announcement: string) => {},
      );

      const props = getProps({
        updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
      });

      await render(<Skills {...props} />);
      const user = userEvent.setup();
      const tools = page.getByRole('group', {
        name: 'Tools & Other Technologies',
      });

      const deleteBtn = tools.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });
});
