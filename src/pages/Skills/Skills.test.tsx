/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */
import React from 'react';

import { render, screen } from '@testing-library/react';
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
          value: '',
        },
      ],

      languages: [
        {
          id: crypto.randomUUID(),
          value: '',
        },
      ],

      tools: [
        {
          id: crypto.randomUUID(),
          value: '',
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

describe('Skills', () => {
  it('should render as a tabpanel with an accessible name derived from an element with an ID "skills"', () => {
    render(<div aria-label="Skills" id="skills" />);
    render(<Skills {...getProps()} />);

    const skills = screen.getByRole('tabpanel', { name: 'Skills' });

    expect(skills).toBeInTheDocument();
  });
});
