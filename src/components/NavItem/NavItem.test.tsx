import React from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';

import NavItem, { NavItemProps } from './NavItem';

// TODO: now, ask AI if the test is good.

describe('NavItem', () => {
  function getProps(overrides: Partial<NavItemProps> = {}): NavItemProps {
    return {
      alt: 'Alternative text',
      iconSrc: 'path/to/icon.svg',
      isDraggable: true,
      isEditorMode: false,
      isSelected: false,
      sectionId: 'certifications',
      sectionTitle: 'Certifications',
      tabIndex: 0,
      onDeleteSection: jest.fn(),
      onSelectSection: jest.fn(),
      ...overrides,
    };
  }

  describe('tab', () => {
    it('should render with an accessible name from the `sectionTitle` prop', () => {
      const props = getProps();
      render(<NavItem {...props} />);

      const tab = screen.getByRole('tab', { name: props.sectionTitle });

      expect(tab).toBeInTheDocument();
    });

    it('should call `onSelectSection` on click when `isEditorMode === false', async () => {
      const user = userEvent.setup();
      const props = getProps();
      render(<NavItem {...props} />);

      const tab = screen.getByRole('tab', { name: props.sectionTitle });
      await user.click(tab);

      expect(props.onSelectSection).toHaveBeenCalledTimes(1);
    });

    it('should not call `onSelectSection` on click when `isEditorMode === true', async () => {
      const user = userEvent.setup();
      const props = getProps({ isEditorMode: true });
      render(<NavItem {...props} />);

      const tab = screen.getByRole('tab', { name: props.sectionTitle });
      await user.click(tab);

      expect(props.onSelectSection).not.toHaveBeenCalled();
    });
  });

  describe('icon', () => {
    it('should render with an accessible name from the `alt` prop', () => {
      const props = getProps();
      render(<NavItem {...props} />);

      const icon = screen.getByRole('img', { name: props.alt });

      expect(icon).toBeInTheDocument();
    });

    it('should be a correct icon specified with the `iconSrc` prop', () => {
      const props = getProps();
      render(<NavItem {...props} />);
      const icon = screen.getByRole('img', { name: props.alt });

      const src = icon.getAttribute('src');

      expect(src).toBe(props.iconSrc);
    });
  });

  describe('delete button', () => {
    describe('render conditions', () => {
      it('should render when `isEditorMode === true && isDraggable === true`', () => {
        const props = getProps({ isEditorMode: true });
        render(<NavItem {...props} />);

        const button = screen.getByRole('button', {
          name: `Delete ${props.sectionTitle}`,
        });

        expect(button).toBeInTheDocument();
      });

      it('should not render when `isEditorMode === false && isDraggable === true`', () => {
        const props = getProps();
        render(<NavItem {...props} />);

        const btn = screen.queryByRole('button', {
          name: `Delete ${props.sectionTitle}`,
        });

        expect(btn).not.toBeInTheDocument();
      });

      it('should not render when `isEditorMode === true && isDraggable === false`', () => {
        const props = getProps({ isEditorMode: true, isDraggable: false });
        render(<NavItem {...props} />);

        const btn = screen.queryByRole('button', {
          name: `Delete ${props.sectionTitle}`,
        });

        expect(btn).not.toBeInTheDocument();
      });

      it('should not render when `isEditorMode === false && isDraggable === false`', () => {
        const props = getProps({ isDraggable: false });
        render(<NavItem {...props} />);

        const btn = screen.queryByRole('button', {
          name: `Delete ${props.sectionTitle}`,
        });

        expect(btn).not.toBeInTheDocument();
      });
    });

    it('should call `onDeleteSection` on click', async () => {
      const user = userEvent.setup();
      const props = getProps({ isEditorMode: true });
      render(<NavItem {...props} />);

      const deleteBtn = screen.getByRole('button', {
        name: `Delete ${props.sectionTitle}`,
      });

      await user.click(deleteBtn);

      expect(props.onDeleteSection).toHaveBeenCalledTimes(1);
    });
  });
});
