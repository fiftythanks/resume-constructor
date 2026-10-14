// It disallowed using `crypto`, which is well supported.
/* eslint-disable n/no-unsupported-features/node-builtins */

import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import BulletPoints from './BulletPoints';

import type { BulletPointsProps } from './BulletPoints';
import type { ItemWithId } from '@/types/resumeData';

const ITEMS: ItemWithId[] = [
  {
    id: crypto.randomUUID(),
    value: 'value 1',
  },
  {
    id: crypto.randomUUID(),
    value: 'value 2',
  },
  {
    id: crypto.randomUUID(),
    value: 'value 3',
  },
];

function getProps(overrides?: Partial<BulletPointsProps>): BulletPointsProps {
  return {
    addItem: () => {},
    data: structuredClone(ITEMS),
    deleteItem(_itemIndex: number) {},
    editItem(_itemIndex: number, _value: string) {},
    legend: 'Some Legend',
    name: 'some-name',
    placeholder1: 'Placeholder 1',
    placeholder2: 'Placeholder 2',
    placeholder3: 'Placeholder 3',
    updateData(_newData: ItemWithId[]) {},
    updateScreenReaderAnnouncement(_announcement: string) {},

    ...overrides,
  };
}

describe('BulletPoints', () => {
  it('should render as a group with an accessible name from the `legend` prop', async () => {
    await render(<BulletPoints {...getProps()} />);

    const group = page.getByRole('group', { name: 'Some Legend' });

    await expect.element(group).toBeInTheDocument();
  });

  it('should render bullet points for each item in `data`', async () => {
    await render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const { id } = ITEMS[i];
      const inputField = page.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      await expect.element(inputField).toBeInTheDocument();
      await expect.element(inputField).toHaveAttribute('id', id);
    }
  });

  it('should have no more bullet points than there are items', async () => {
    await render(<BulletPoints {...getProps()} />);

    const bulletPoints = page.getByTestId('bullet-points');

    expect(bulletPoints.element().children).toHaveLength(ITEMS.length);
  });

  it('should call `handleFocusOnFirstElement` when the first bullet point drag handle is focused', async () => {
    const mockFn = vi.fn();
    const props = getProps({ handleFocusOnFirstElement: mockFn });
    await render(<BulletPoints {...props} />);

    const dragHandle = page.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.element().focus();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call `handleKeyDownOnFirstElement` when key is pressed on the first bullet point drag handle', async () => {
    const mockFn = vi.fn();
    const user = userEvent.setup();
    const props = getProps({ handleKeyDownOnFirstElement: mockFn });
    await render(<BulletPoints {...props} />);

    const dragHandle = page.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.element().focus();
    await user.keyboard('{Tab}');

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should render the first three bullet points with placeholders from props `placeholder1`, `placeholder2` and `placeholder3` correspondingly', async () => {
    await render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const inputField = page.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      await expect
        .element(inputField)
        .toHaveAttribute('placeholder', `Placeholder ${i + 1}`);
    }
  });

  it('should render bullet points with correct values from `data`', async () => {
    await render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const { value } = ITEMS[i];
      const inputField = page.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      await expect.element(inputField).toHaveValue(value);
    }
  });

  it('should call `editItem` when a bullet point value is changed', async () => {
    const editItemMock = vi.fn((_itemIndex: number, _value: string) => {});
    await render(<BulletPoints {...getProps({ editItem: editItemMock })} />);
    const user = userEvent.setup();

    const inputField = page.getByRole('textbox', {
      name: 'Bullet point 1',
    });

    await user.type(inputField, 's');

    expect(editItemMock).toHaveBeenCalledTimes(1);
    expect(editItemMock).toHaveBeenCalledWith(0, 'value 1s');
  });

  it('should render drag handles with accessible names "Drag bullet point [index + 1]" for each bullet point', async () => {
    await render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const dragHandle = page.getByRole('button', {
        name: `Drag bullet point ${i + 1}`,
      });

      await expect.element(dragHandle).toBeInTheDocument();
    }
  });

  it('should announce "Picked up draggable item [index + 1]" to screen readers when the drag handle of a bullet point [index + 1] is clicked for the first time (in other words, on drag start)', async () => {
    await render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const dragHandle = page.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.element().focus();
    await user.keyboard(' ');

    const a11yElement = page.getByText('Picked up draggable item 1.');

    await expect.element(a11yElement).toBeInTheDocument();
  });

  // TODO: figure out how to test drag over. As far as I understand, it is impossible to do by the means of unit testing, at least in JSDOM.

  it('should announce "Dragging was cancelled. Draggable item [index + 1] was put to its initial position." to screen readers when Escape is pressed during dragging', async () => {
    await render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const dragHandle = page.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.element().focus();
    await user.keyboard(' ');
    await user.keyboard('{Escape}');

    const a11yElement = page.getByText(
      'Dragging was cancelled. Draggable item 1 was put to its initial position.',
    );

    await expect.element(a11yElement).toBeInTheDocument();
  });

  it('should announce "Draggable item [index + 1] was dropped over droppable area [droppableIndex + 1]" to screen readers when the dragged bullet point [index + 1] is dropped over droppable area [droppableIndex + 1]', async () => {
    await render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const dragHandle = page.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.element().focus();
    await user.keyboard(' ');
    await user.keyboard(' ');

    const a11yElement = page.getByText(
      'Draggable item 1 was dropped over droppable area 1',
    );

    await expect.element(a11yElement).toBeInTheDocument();
  });

  it('should provide a screen reader instruction "To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel."', async () => {
    await render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const dragHandle = page.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    await user.tab();

    await expect.element(dragHandle).toHaveFocus();

    const descriptionNode = document.getElementById(
      dragHandle.element().getAttribute('aria-describedby')!,
    )!;

    const cleanText = (text: string) => text.replaceAll(/\s+/g, ' ').trim();

    expect(cleanText(descriptionNode.textContent)).toBe(
      'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.',
    );
  });

  it('should render delete buttons with accessible names "Delete bullet point [index + 1]" for each bullet point', async () => {
    await render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const deleteBtn = page.getByRole('button', {
        name: `Delete bullet point ${i + 1}`,
      });

      await expect.element(deleteBtn).toBeInTheDocument();
    }
  });

  it('should call `deleteItem` with a correct index when a delete button is pressed', async () => {
    const deleteItemMock = vi.fn((_itemIndex: number) => {});
    await render(
      <BulletPoints {...getProps({ deleteItem: deleteItemMock })} />,
    );
    const user = userEvent.setup();

    const deleteBtn = page.getByRole('button', {
      name: 'Delete bullet point 1',
    });

    await user.click(deleteBtn);

    expect(deleteItemMock).toHaveBeenCalledTimes(1);
    expect(deleteItemMock).toHaveBeenCalledWith(0);
  });

  it('should announce "Bullet point [index + 1] was deleted." to screen readers when a delete button is clicked', async () => {
    const updateScreenReaderAnnouncementMock = vi.fn(
      (_announcement: string) => {},
    );

    await render(
      <BulletPoints
        {...getProps({
          updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
        })}
      />,
    );

    const user = userEvent.setup();

    const deleteBtn = page.getByRole('button', {
      name: 'Delete bullet point 1',
    });

    await user.click(deleteBtn);

    expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);

    expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledWith(
      'Bullet point 1 was deleted.',
    );
  });

  it("should render an add-button with an accessible name 'Add bullet point' if `itemName` isn't provided", async () => {
    await render(<BulletPoints {...getProps()} />);

    const addBtn = page.getByRole('button', {
      name: 'Add bullet point',
    });

    await expect.element(addBtn).toBeInTheDocument();
  });

  it('should render an add-button with an accessible name "Add [itemName]" if `itemName` is provided', async () => {
    await render(<BulletPoints {...getProps({ itemName: 'something' })} />);

    const addBtn = page.getByRole('button', {
      name: 'Add something',
    });

    await expect.element(addBtn).toBeInTheDocument();
  });

  it('should call `addItem` when the add-button is clicked', async () => {
    const addItemMock = vi.fn();
    await render(<BulletPoints {...getProps({ addItem: addItemMock })} />);
    const user = userEvent.setup();

    const addBtn = page.getByRole('button', {
      name: 'Add bullet point',
    });

    await user.click(addBtn);

    expect(addItemMock).toHaveBeenCalledTimes(1);
  });

  it("should focus the next bullet point's delete button if a bullet point that is not last is deleted", async () => {
    await render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const firstBulletPointDeleteBtn = page.getByRole('button', {
      name: 'Delete bullet point 1',
    });

    const secondBulletPointDeleteBtn = page.getByRole('button', {
      name: 'Delete bullet point 2',
    });

    firstBulletPointDeleteBtn.element().focus();

    await user.click(firstBulletPointDeleteBtn);

    await expect.element(secondBulletPointDeleteBtn).toHaveFocus();
  });

  it('should focus the add-button if the only bullet point is deleted', async () => {
    await render(
      <BulletPoints
        {...getProps({ data: [{ id: crypto.randomUUID(), value: '' }] })}
      />,
    );

    const user = userEvent.setup();

    const deleteBtn = page.getByRole('button', {
      name: 'Delete bullet point 1',
    });

    const addBtn = page.getByRole('button', {
      name: `Add bullet point`,
    });

    deleteBtn.element().focus();

    await user.click(deleteBtn);

    await expect.element(addBtn).toHaveFocus();
  });

  it("should focus the previous bullet point's delete button if the last bullet point (that is not the only one) is deleted", async () => {
    await render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    // There are three bullet points.

    const secondBulletPointDeleteBtn = page.getByRole('button', {
      name: 'Delete bullet point 2',
    });

    const thirdBulletPointDeleteBtn = page.getByRole('button', {
      name: 'Delete bullet point 3',
    });

    thirdBulletPointDeleteBtn.element().focus();

    await user.click(thirdBulletPointDeleteBtn);

    await expect.element(secondBulletPointDeleteBtn).toHaveFocus();
  });
});
