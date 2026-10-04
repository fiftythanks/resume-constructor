import { createRef } from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';

import NavbarItem from './NavbarItem';

import type { NavbarItemProps } from './NavbarItem';

function getProps(overrides?: Partial<NavbarItemProps>): NavbarItemProps {
  return {
    alt: 'Alternative text',
    iconSrc: 'path/to/icon.svg',
    isDraggable: true,
    isEditorMode: false,
    isSelected: false,
    onDeleteSection: jest.fn(),
    onSelectSection: jest.fn(),
    sectionId: 'certifications',
    sectionTitle: 'Certifications',
    tabIndex: 0,
    ...overrides,
  };
}

describe('NavbarItem', () => {
  describe('tab', () => {
    it('should render with accessible name from `sectionTitle` and BEM class', () => {
      const props = getProps();
      render(<NavbarItem {...props} />);

      const tab = screen.getByRole('tab', { name: props.sectionTitle });

      expect(tab).toBeInTheDocument();
      expect(tab).toHaveClass('NavbarItem-Button');
    });

    it('should call `onSelectSection` on click when `isEditorMode === false`', async () => {
      const user = userEvent.setup();
      const onSelectSectionMock = jest.fn();
      render(
        <NavbarItem
          {...getProps({
            isEditorMode: false,
            onSelectSection: onSelectSectionMock,
          })}
        />,
      );

      const tab = screen.getByRole('tab', { name: 'Certifications' });
      await user.click(tab);

      expect(onSelectSectionMock).toHaveBeenCalledTimes(1);
    });

    it('should not call `onSelectSection` on click when `isEditorMode === true`', async () => {
      const user = userEvent.setup();
      const onSelectSectionMock = jest.fn();
      render(
        <NavbarItem
          {...getProps({
            isEditorMode: true,
            onSelectSection: onSelectSectionMock,
          })}
        />,
      );

      const tab = screen.getByRole('tab', { name: 'Certifications' });
      await user.click(tab);

      expect(onSelectSectionMock).not.toHaveBeenCalled();
    });

    it.each([
      { ariaDisabled: 'false', isEditorMode: false },
      { ariaDisabled: 'true', isEditorMode: true },
    ])(
      'should set aria-disabled="$ariaDisabled" when isEditorMode is $isEditorMode',
      ({ ariaDisabled, isEditorMode }) => {
        render(<NavbarItem {...getProps({ isEditorMode })} />);

        const tab = screen.getByRole('tab', { name: 'Certifications' });

        expect(tab).toHaveAttribute('aria-disabled', ariaDisabled);
      },
    );

    it('should set aria-selected="true" and add selected modifier when isSelected is true', () => {
      const { container } = render(
        <NavbarItem {...getProps({ isSelected: true })} />,
      );

      const tab = screen.getByRole('tab', { name: 'Certifications' });
      const li = container.querySelector('.NavbarItem')!;

      expect(tab).toHaveAttribute('aria-selected', 'true');
      expect(li).toHaveClass('NavbarItem_selected');
    });

    it('should set aria-selected="false" and omit selected modifier when isSelected is false', () => {
      const { container } = render(
        <NavbarItem {...getProps({ isSelected: false })} />,
      );

      const tab = screen.getByRole('tab', { name: 'Certifications' });
      const li = container.querySelector('.NavbarItem')!;

      expect(tab).toHaveAttribute('aria-selected', 'false');
      expect(li).not.toHaveClass('NavbarItem_selected');
    });

    it('should assign DOM tab element to ref', () => {
      const ref = createRef<HTMLButtonElement | null>();
      render(<NavbarItem {...getProps({ ref })} />);

      const tab = screen.getByRole('tab', { name: 'Certifications' });

      expect(ref.current).toBe(tab);
    });
  });

  describe('icon', () => {
    it('should render icon with accessible alt text and src', () => {
      const props = getProps();
      render(<NavbarItem {...props} />);

      const icon = screen.getByRole('img', { name: props.alt });

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', props.iconSrc);
    });
  });

  describe('delete button', () => {
    it('should render delete button with BEM classes when draggable and in editor mode', () => {
      render(
        <NavbarItem {...getProps({ isDraggable: true, isEditorMode: true })} />,
      );

      const button = screen.getByRole('button', {
        name: 'Delete Certifications',
      });

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass(
        'NavbarItem-ControlBtn',
        'NavbarItem-ControlBtn_delete',
      );
    });

    it.each([
      { isDraggable: true, isEditorMode: false },
      { isDraggable: false, isEditorMode: true },
      { isDraggable: false, isEditorMode: false },
    ])(
      'should not render delete button when isDraggable=$isDraggable and isEditorMode=$isEditorMode',
      ({ isDraggable, isEditorMode }) => {
        render(<NavbarItem {...getProps({ isDraggable, isEditorMode })} />);

        const button = screen.queryByRole('button', {
          name: 'Delete Certifications',
        });

        expect(button).not.toBeInTheDocument();
      },
    );

    it('should call `onDeleteSection` on click', async () => {
      const user = userEvent.setup();
      const onDeleteSectionMock = jest.fn();
      render(
        <NavbarItem
          {...getProps({
            isEditorMode: true,
            onDeleteSection: onDeleteSectionMock,
          })}
        />,
      );

      const deleteBtn = screen.getByRole('button', {
        name: 'Delete Certifications',
      });

      await user.click(deleteBtn);

      expect(onDeleteSectionMock).toHaveBeenCalledTimes(1);
    });
  });
});
