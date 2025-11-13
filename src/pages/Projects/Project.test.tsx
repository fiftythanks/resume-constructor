/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */
import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Project from './Project';

import type { ProjectProps } from './Project';
import type { ProjectKeysNoBulletPointsAndId } from './Projects';
import type {
  ItemWithId,
  Project as ProjectInterface,
} from '@/types/resumeData';

function getProps(overrides?: Partial<ProjectProps>): ProjectProps {
  return {
    data: {
      bulletPoints: [
        {
          id: crypto.randomUUID(),
          value: '',
        },
      ],

      code: {
        link: '',
        text: '',
      },

      demo: {
        link: '',
        text: '',
      },

      id: crypto.randomUUID(),
      projectName: '',
      stack: '',
    },

    functions: {
      addBulletPoint() {},
      deleteBulletPoint(_itemIndex: number) {},

      edit<K extends ProjectKeysNoBulletPointsAndId>(
        _field: K,
        _value: ProjectInterface[K],
      ) {},

      editBulletPoint(_itemIndex: number, _value: string) {},
      updateBulletPoints(_value: ItemWithId[]) {},
    },

    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Project', () => {
  describe('Project Name', () => {
    it('should render a text input for Project Name', () => {
      render(<Project {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Project Name' });

      expect(input).toBeInTheDocument();
    });

    it('should call `edit` on Project Name change', async () => {
      const editMock = jest.fn(
        <K extends ProjectKeysNoBulletPointsAndId>(
          _name: K,
          _value: ProjectInterface[K],
        ) => {},
      );

      render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, edit: editMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Project Name' });

      await user.type(input, 's');

      expect(editMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tech Stack', () => {
    it('should render a text input for Tech Stack', () => {
      render(<Project {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Tech Stack' });

      expect(input).toBeInTheDocument();
    });

    it('should call `edit` on Tech Stack change', async () => {
      const editMock = jest.fn(
        <K extends ProjectKeysNoBulletPointsAndId>(
          _name: K,
          _value: ProjectInterface[K],
        ) => {},
      );

      render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, edit: editMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Tech Stack' });

      await user.type(input, 's');

      expect(editMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Code (text)', () => {
    it('should render a text input for Code (text)', () => {
      render(<Project {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Code (text)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `edit` on Code (text) change', async () => {
      const editMock = jest.fn(
        <K extends ProjectKeysNoBulletPointsAndId>(
          _name: K,
          _value: ProjectInterface[K],
        ) => {},
      );

      render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, edit: editMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Code (text)' });

      await user.type(input, 's');

      expect(editMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Code (link)', () => {
    it('should render a text input for Code (link)', () => {
      render(<Project {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Code (link)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `edit` on Code (link) change', async () => {
      const editMock = jest.fn(
        <K extends ProjectKeysNoBulletPointsAndId>(
          _name: K,
          _value: ProjectInterface[K],
        ) => {},
      );

      render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, edit: editMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Code (link)' });

      await user.type(input, 's');

      expect(editMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Demo (text)', () => {
    it('should render a text input for Demo (text)', () => {
      render(<Project {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Demo (text)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `edit` on Demo (text) change', async () => {
      const editMock = jest.fn(
        <K extends ProjectKeysNoBulletPointsAndId>(
          _name: K,
          _value: ProjectInterface[K],
        ) => {},
      );

      render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, edit: editMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Demo (text)' });

      await user.type(input, 's');

      expect(editMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Demo (link)', () => {
    it('should render a text input for Demo (link)', () => {
      render(<Project {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Demo (link)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `edit` on Demo (link) change', async () => {
      const editMock = jest.fn(
        <K extends ProjectKeysNoBulletPointsAndId>(
          _name: K,
          _value: ProjectInterface[K],
        ) => {},
      );

      render(
        <Project
          {...getProps({
            functions: { ...getProps().functions, edit: editMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Demo (link)' });

      await user.type(input, 's');

      expect(editMock).toHaveBeenCalledTimes(1);
    });
  });
});
