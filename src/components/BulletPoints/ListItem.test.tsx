import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

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

/**
 * disabled
 * pressed
 * roledescription
 * describedby
 */

describe('ListItem', () => {
  describe('text input', () => {
    it('should render a text input with an accessible name "Bullet point [index + 1]"', async () => {
      await render(<ListItem {...getProps()} />);

      const input = page.getByRole('textbox', { name: 'Bullet point 2' });

      await expect.element(input).toBeInTheDocument();
    });

    it('should pass the text input the correct value from the `value` prop', async () => {
      const props = getProps();
      await render(<ListItem {...props} />);

      const input = page.getByRole('textbox', {
        name: 'Bullet point 2',
      });

      await expect.element(input).toHaveValue(props.value);
    });

    it('should pass the text input a placeholder "Bullet point [index + 1] if the `placeholder` prop is `undefined`', async () => {
      await render(<ListItem {...getProps()} />);

      const input = page.getByRole('textbox', {
        name: 'Bullet point 2',
      });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', 'Bullet point 2');
    });

    it('should pass the text input a placeholder from `placeholder` if `placeholder !== undefined`', async () => {
      const props = getProps({ placeholder: 'Some placeholder' });
      await render(<ListItem {...props} />);

      const input = page.getByRole('textbox', {
        name: 'Bullet point 2',
      });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', 'Some placeholder');
    });

    it('should call `edit` when the text input value is changed', async () => {
      const editMock = vi.fn();
      await render(<ListItem {...getProps({ edit: editMock })} />);
      const user = userEvent.setup();
      const input = page.getByRole('textbox', { name: 'Bullet point 2' });

      await user.type(input, 'f');

      expect(editMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('drag handle', () => {
    it('should render a drag handle with an accessible name "Drag bullet point [index + 1]"', async () => {
      await render(<ListItem {...getProps()} />);

      const dragHandle = page.getByRole('button', {
        name: 'Drag bullet point 2',
      });

      await expect.element(dragHandle).toBeInTheDocument();
    });

    it('should call `handleFocusOnFirstElement` when focused if `handleFocusOnFirstElement` is defined', async () => {
      const mockFn = vi.fn();
      const props = getProps({ handleFocusOnFirstElement: mockFn });
      await render(<ListItem {...props} />);

      const dragHandle = page.getByRole('button', {
        name: 'Drag bullet point 2',
      });

      dragHandle.element().focus();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call `handleKeyDownOnFirstElement` when key is pressed if `handleKeyDownOnFirstElement` is defined', async () => {
      const mockFn = vi.fn();
      const user = userEvent.setup();
      const props = getProps({ handleKeyDownOnFirstElement: mockFn });
      await render(<ListItem {...props} />);

      const dragHandle = page.getByRole('button', {
        name: 'Drag bullet point 2',
      });

      dragHandle.element().focus();
      await user.keyboard('{Tab}');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete btn', () => {
    it('should render a delete button with an accessible name "Delete bullet point [index + 1]"', async () => {
      await render(<ListItem {...getProps()} />);

      const deleteBtn = page.getByRole('button', {
        name: 'Delete bullet point 2',
      });

      await expect.element(deleteBtn).toBeInTheDocument();
    });

    it('should call `deleteItem` when the delete button is clicked', async () => {
      const deleteItemMock = vi.fn();
      await render(<ListItem {...getProps({ deleteItem: deleteItemMock })} />);
      const user = userEvent.setup();

      const deleteBtn = page.getByRole('button', {
        name: 'Delete bullet point 2',
      });

      await user.click(deleteBtn);

      expect(deleteItemMock).toHaveBeenCalledTimes(1);
    });
  });
});
