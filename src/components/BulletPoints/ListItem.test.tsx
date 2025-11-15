import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ListItem from './ListItem';

import type { ListItemProps } from './ListItem';

function getProps(overrides?: Partial<ListItemProps>): ListItemProps {
  return {
    deleteItem: () => {},
    edit: () => {},
    id: 'some id',
    index: 1,
    name: 'some name',
    value: 'some value',
    ...overrides,
  };
}

// disabled
// pressed
// roledescription
// describedby

describe('ListItem', () => {
  describe('text input', () => {
    it('should render a text input with an accessible name "Bullet point [index + 1]"', () => {
      render(<ListItem {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Bullet point 2' });

      expect(input).toBeInTheDocument();
    });

    it('should pass the text input the correct value from the `value` prop', () => {
      const props = getProps();
      render(<ListItem {...props} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Bullet point 2',
      });

      expect(input.value).toBe(props.value);
    });

    it('should pass the text input a placeholder "Bullet point [index + 1] if the `placeholder` prop is `undefined`', () => {
      render(<ListItem {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Bullet point 2',
      });

      expect(input.placeholder).toBe('Bullet point 2');
    });

    it('should pass the text input a placeholder from `placeholder` if `placeholder !== undefined`', () => {
      const props = getProps({ placeholder: 'Some placeholder' });
      render(<ListItem {...props} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Bullet point 2',
      });

      expect(input.placeholder).toBe('Some placeholder');
    });

    it('should call `edit` when the text input value is changed', async () => {
      const editMock = jest.fn();
      render(<ListItem {...getProps({ edit: editMock })} />);
      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Bullet point 2' });

      await user.type(input, 'f');

      expect(editMock).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('drag handle', () => {
    it('should render a drag handle with an accessible name "Drag bullet point [index + 1]"', () => {
      render(<ListItem {...getProps()} />);

      const dragHandle = screen.getByRole('button', {
        name: 'Drag bullet point 2',
      });

      expect(dragHandle).toBeInTheDocument();
    });
  });

  describe('delete btn', () => {
    it('should render a delete button with an accessible name "Delete bullet point [index + 1]"', () => {
      render(<ListItem {...getProps()} />);

      const deleteBtn = screen.getByRole('button', {
        name: 'Delete bullet point 2',
      });

      expect(deleteBtn).toBeInTheDocument();
    });

    it('should call `deleteItem` when the delete button is clicked', async () => {
      const deleteItemMock = jest.fn();
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
