/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */
import React from 'react';

import { getByRole, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

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

    updateScreenReaderAnnouncement(_announcement) {},
    ...overrides,
  };
}

// correct data passed

// tools legend
// addTool
// deleteTool
// editTool
// updateScreenReaderAnnouncement for tools

// TODO: find a way to test `updateSkills` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.

describe('Skills', () => {
  it('should render as a tabpanel with an accessible name derived from an element with an ID "skills"', () => {
    render(<div aria-label="Skills" id="skills" />);
    render(<Skills {...getProps()} />);

    const skills = screen.getByRole('tabpanel', { name: 'Skills' });

    expect(skills).toBeInTheDocument();
  });

  describe('Languages', () => {
    it('should render Languages bullet points', () => {
      render(<div aria-label="Skills" id="skills" />);
      render(<Skills {...getProps()} />);

      const languages = screen.getByRole('group', { name: 'Languages' });

      expect(languages).toBeInTheDocument();
    });

    it('should have the correct data from `data.languages` for Languages', () => {
      const props = getProps();
      render(<div aria-label="Skills" id="skills" />);
      render(<Skills {...props} />);
      const languages = screen.getByRole('group', { name: 'Languages' });

      props.data.languages.forEach((language, i) => {
        const { id, value } = language;

        const input: HTMLInputElement = getByRole(languages, 'textbox', {
          name: `Bullet point ${i + 1}`,
        });

        expect(input.id).toBe(id);
        expect(input.value).toBe(value);
      });
    });

    it('should call `addLanguage` when a language is added via the add-button', async () => {
      render(<div aria-label="Skills" id="skills" />);
      const addLanguageMock = jest.fn();
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addLanguage: addLanguageMock },
      };

      render(<Skills {...props} />);
      const user = userEvent.setup();

      const addBtn = screen.getByRole('button', {
        name: 'Add Language',
      });

      await user.click(addBtn);

      expect(addLanguageMock).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteLanguage` with the correct index when a language is deleted via the corresponding delete button', async () => {
      render(<div aria-label="Skills" id="skills" />);
      const deleteLanguageMock = jest.fn((_languageIndex: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, deleteLanguage: deleteLanguageMock },
      };

      render(<Skills {...props} />);
      const user = userEvent.setup();

      const languages = screen.getByRole('group', { name: 'Languages' });

      const deleteBtn = getByRole(languages, 'button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(deleteLanguageMock).toHaveBeenCalledTimes(1);
      expect(deleteLanguageMock).toHaveBeenCalledWith(0);
    });

    it('should call `editLanguage` with the correct index when a language is edited via the corresponding text input', async () => {
      render(<div aria-label="Skills" id="skills" />);

      const editLanguageMock = jest.fn(
        (_languageIndex: number, _value: string) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editLanguage: editLanguageMock },
      };

      render(<Skills {...props} />);
      const user = userEvent.setup();
      const languages = screen.getByRole('group', { name: 'Languages' });
      const input = getByRole(languages, 'textbox', { name: 'Bullet point 1' });
      input.focus();

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
      render(<div aria-label="Skills" id="skills" />);

      const updateScreenReaderAnnouncementMock = jest.fn(
        (_announcement: string) => {},
      );

      const props = getProps({
        updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
      });

      render(<Skills {...props} />);
      const user = userEvent.setup();
      const languages = screen.getByRole('group', { name: 'Languages' });

      const deleteBtn = getByRole(languages, 'button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Frameworks', () => {
    it('should render Frameworks bullet points', () => {
      render(<div aria-label="Skills" id="skills" />);
      render(<Skills {...getProps()} />);

      const frameworks = screen.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      expect(frameworks).toBeInTheDocument();
    });

    it('should have the correct data from `data.frameworks` for Frameworks', () => {
      const props = getProps();
      render(<div aria-label="Skills" id="skills" />);
      render(<Skills {...props} />);

      const frameworks = screen.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      props.data.frameworks.forEach((framework, i) => {
        const { id, value } = framework;

        const input: HTMLInputElement = getByRole(frameworks, 'textbox', {
          name: `Bullet point ${i + 1}`,
        });

        expect(input.id).toBe(id);
        expect(input.value).toBe(value);
      });
    });

    it('should call `addFramework` when a framework is added via the add-button', async () => {
      render(<div aria-label="Skills" id="skills" />);
      const addFrameworkMock = jest.fn();
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addFramework: addFrameworkMock },
      };

      render(<Skills {...props} />);
      const user = userEvent.setup();

      const addBtn = screen.getByRole('button', {
        name: 'Add Framework',
      });

      await user.click(addBtn);

      expect(addFrameworkMock).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteFramework` with the correct index when a framework is deleted via the corresponding delete button', async () => {
      render(<div aria-label="Skills" id="skills" />);
      const deleteFrameworkMock = jest.fn((_frameworkIndex: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, deleteFramework: deleteFrameworkMock },
      };

      render(<Skills {...props} />);
      const user = userEvent.setup();

      const frameworks = screen.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      const deleteBtn = getByRole(frameworks, 'button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(deleteFrameworkMock).toHaveBeenCalledTimes(1);
      expect(deleteFrameworkMock).toHaveBeenCalledWith(0);
    });

    it('should call `editFramework` with the correct index when a framework is edited via the corresponding text input', async () => {
      render(<div aria-label="Skills" id="skills" />);

      const editFrameworkMock = jest.fn(
        (_frameworkIndex: number, _value: string) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editFramework: editFrameworkMock },
      };

      render(<Skills {...props} />);
      const user = userEvent.setup();
      const frameworks = screen.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      const input = getByRole(frameworks, 'textbox', {
        name: 'Bullet point 1',
      });

      input.focus();

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
      render(<div aria-label="Skills" id="skills" />);

      const updateScreenReaderAnnouncementMock = jest.fn(
        (_announcement: string) => {},
      );

      const props = getProps({
        updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
      });

      render(<Skills {...props} />);
      const user = userEvent.setup();
      const frameworks = screen.getByRole('group', {
        name: 'Frameworks, Libraries & Databases',
      });

      const deleteBtn = getByRole(frameworks, 'button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tools', () => {
    it('should render Tools bullet points', () => {
      render(<div aria-label="Skills" id="skills" />);
      render(<Skills {...getProps()} />);

      const tools = screen.getByRole('group', {
        name: 'Tools & Other Technologies',
      });

      expect(tools).toBeInTheDocument();
    });

    it('should have the correct data from `data.tools` for Tools', () => {
      const props = getProps();
      render(<div aria-label="Skills" id="skills" />);
      render(<Skills {...props} />);

      const tools = screen.getByRole('group', {
        name: 'Tools & Other Technologies',
      });

      props.data.tools.forEach((tool, i) => {
        const { id, value } = tool;

        const toolInput: HTMLInputElement = getByRole(tools, 'textbox', {
          name: `Bullet point ${i + 1}`,
        });

        expect(toolInput.id).toBe(id);
        expect(toolInput.value).toBe(value);
      });
    });

    it('should call `addTool` when a tool is added via the add-button', async () => {
      render(<div aria-label="Skills" id="skills" />);
      const addToolMock = jest.fn();
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addTool: addToolMock },
      };

      render(<Skills {...props} />);
      const user = userEvent.setup();

      const addBtn = screen.getByRole('button', {
        name: 'Add Tool',
      });

      await user.click(addBtn);

      expect(addToolMock).toHaveBeenCalledTimes(1);
    });

    it('should call `deleteTool` with the correct index when a tool is deleted via the corresponding delete button', async () => {
      render(<div aria-label="Skills" id="skills" />);
      const deleteToolMock = jest.fn((_toolIndex: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, deleteTool: deleteToolMock },
      };

      render(<Skills {...props} />);
      const user = userEvent.setup();

      const tools = screen.getByRole('group', {
        name: 'Tools & Other Technologies',
      });

      const deleteBtn = getByRole(tools, 'button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(deleteToolMock).toHaveBeenCalledTimes(1);
      expect(deleteToolMock).toHaveBeenCalledWith(0);
    });

    it('should call `editTool` with the correct index when a tool is edited via the corresponding text input', async () => {
      render(<div aria-label="Skills" id="skills" />);

      const editToolMock = jest.fn((_toolIndex: number, _value: string) => {});

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editTool: editToolMock },
      };

      render(<Skills {...props} />);
      const user = userEvent.setup();
      const tools = screen.getByRole('group', {
        name: 'Tools & Other Technologies',
      });
      const input = getByRole(tools, 'textbox', { name: 'Bullet point 1' });
      input.focus();

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
      render(<div aria-label="Skills" id="skills" />);

      const updateScreenReaderAnnouncementMock = jest.fn(
        (_announcement: string) => {},
      );

      const props = getProps({
        updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
      });

      render(<Skills {...props} />);
      const user = userEvent.setup();
      const tools = screen.getByRole('group', {
        name: 'Tools & Other Technologies',
      });

      const deleteBtn = getByRole(tools, 'button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });
});
