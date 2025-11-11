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

describe('ListItem', () => {
  it('should render an input field with an accessible name "Bullet point [index + 1]"', () => {
    render(<ListItem {...getProps()} />);

    const inputField = screen.getByRole('textbox', { name: 'Bullet point 2' });

    expect(inputField).toBeInTheDocument();
  });

  it("should call `edit` on change of the input field's value", async () => {
    const editMock = jest.fn();
    render(<ListItem {...getProps({ edit: editMock })} />);
    const user = userEvent.setup();
    const inputField = screen.getByRole('textbox', { name: 'Bullet point 2' });

    await user.type(inputField, 'f');

    expect(editMock).toHaveBeenCalledTimes(1);
  });

  it('should render a drag handle with an accessible name "Drag bullet point [index + 1]"', () => {
    render(<ListItem {...getProps()} />);

    const dragHandle = screen.getByRole('button', {
      name: 'Drag bullet point 2',
    });

    expect(dragHandle).toBeInTheDocument();
  });

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
