import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ListItem from './ListItem';

import type { ListItemProps } from './ListItem';

describe('ListItem', () => {
  function getProps(overrides?: Partial<ListItemProps>): ListItemProps {
    return {
      deleteItem: jest.fn<void, []>(),
      edit: jest.fn<void, [ChangeEvent<HTMLInputElement>]>(),
      id: 'some-id',
      index: 1,
      name: 'some-name',
      value: 'some value',
      ...overrides,
    };
  }

  describe('semantic structure and BEM classes', () => {
    it('should render a list item with designated BEM classes and child elements', () => {
      render(<ListItem {...getProps()} />);

      const item = screen.getByRole('listitem');
      const dragHandle = screen.getByRole('button', {
        name: 'Drag bullet point 2',
      });
      const input = screen.getByRole('textbox', { name: 'Bullet point 2' });
      const deleteBtn = screen.getByRole('button', {
        name: 'Delete bullet point 2',
      });

      expect(item).toBeInTheDocument();
      expect(item).toHaveClass('BulletPoints-ListItem');
      expect(dragHandle).toHaveClass(
        'BulletPoints-Button',
        'BulletPoints-Button_dragHandle',
      );
      expect(input).toHaveClass('BulletPoints-Field');
      expect(deleteBtn).toHaveClass(
        'BulletPoints-Button',
        'BulletPoints-Button_delete',
      );
    });
  });

  describe('text input', () => {
    it('should render a text input with correct value and accessible name', () => {
      const props = getProps({ value: 'Initial bullet value' });
      render(<ListItem {...props} />);

      const input = screen.getByRole('textbox', { name: 'Bullet point 2' });

      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Initial bullet value');
    });

    it.each([
      {
        expected: 'Bullet point 2',
        placeholder: undefined,
      },
      {
        expected: 'Custom bullet placeholder',
        placeholder: 'Custom bullet placeholder',
      },
    ])(
      'should render placeholder "$expected" when placeholder prop is $placeholder',
      ({ expected, placeholder }) => {
        render(<ListItem {...getProps({ placeholder })} />);

        const input = screen.getByRole('textbox', { name: 'Bullet point 2' });

        expect(input).toHaveAttribute('placeholder', expected);
      },
    );

    it('should call `edit` when the text input value is changed', async () => {
      const editMock = jest.fn<void, [ChangeEvent<HTMLInputElement>]>();
      render(<ListItem {...getProps({ edit: editMock })} />);
      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Bullet point 2' });

      await user.type(input, 'f');

      expect(editMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('drag handle', () => {
    it('should render a drag handle with accessible name', () => {
      render(<ListItem {...getProps()} />);

      const dragHandle = screen.getByRole('button', {
        name: 'Drag bullet point 2',
      });

      expect(dragHandle).toBeInTheDocument();
    });

    it('should call `handleFocusOnFirstElement` when focused if provided', () => {
      const mockFn = jest.fn<void, [FocusEvent<HTMLButtonElement>]>();
      const props = getProps({ handleFocusOnFirstElement: mockFn });
      render(<ListItem {...props} />);

      const dragHandle = screen.getByRole('button', {
        name: 'Drag bullet point 2',
      });

      dragHandle.focus();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `handleKeyDownOnFirstElement` when key is pressed if provided', async () => {
      const mockFn = jest.fn<void, [KeyboardEvent]>();
      const user = userEvent.setup();
      const props = getProps({ handleKeyDownOnFirstElement: mockFn });
      render(<ListItem {...props} />);

      const dragHandle = screen.getByRole('button', {
        name: 'Drag bullet point 2',
      });

      dragHandle.focus();
      await user.keyboard('{Tab}');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete button', () => {
    it('should render a delete button with accessible name', () => {
      render(<ListItem {...getProps()} />);

      const deleteBtn = screen.getByRole('button', {
        name: 'Delete bullet point 2',
      });

      expect(deleteBtn).toBeInTheDocument();
    });

    it('should call `deleteItem` when the delete button is clicked', async () => {
      const deleteItemMock = jest.fn<void, []>();
      render(<ListItem {...getProps({ deleteItem: deleteItemMock })} />);
      const user = userEvent.setup();

      const deleteBtn = screen.getByRole('button', {
        name: 'Delete bullet point 2',
      });

      await user.click(deleteBtn);

      expect(deleteItemMock).toHaveBeenCalledTimes(1);
    });
  });
});
