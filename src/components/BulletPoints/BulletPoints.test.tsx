// It disallowed using `crypto`, which is well supported.
/* eslint-disable n/no-unsupported-features/node-builtins */
import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

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
  it('should render as a group with an accessible name from the `legend` prop', () => {
    render(<BulletPoints {...getProps()} />);

    const group = screen.getByRole('group', { name: 'Some Legend' });

    expect(group).toBeInTheDocument();
  });

  it('should render bullet points for each item in `data`', () => {
    render(<BulletPoints {...getProps()} />);

    ITEMS.forEach(({ id }, i) => {
      const inputField = screen.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      expect(inputField).toBeInTheDocument();
      expect(inputField.id).toBe(id);
    });
  });

  it('should have no more bullet points than there are items', () => {
    render(<BulletPoints {...getProps()} />);

    const bulletPoints = screen.getByTestId('bullet-points');

    expect(bulletPoints.children).toHaveLength(ITEMS.length);
  });

  it('should call `setFirstTabbable` and pass the first bullet to it when there are bullets', () => {
    const mockFn = jest.fn((_firstTabbable) => {});
    const props = getProps({ setFirstTabbable: mockFn });
    render(<BulletPoints {...props} />);

    const dragHandle = screen.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(dragHandle);
  });

  it("should call `setFirstTabbable` and pass the 'Add Bullet Point' button to it when there aren't bullets", () => {
    // Arrange
    const mockFn = jest.fn((_firstTabbable) => {});
    const props = getProps({ setFirstTabbable: mockFn });
    props.data = [];

    render(<BulletPoints {...props} />);

    // Act
    const btn = screen.getByRole('button', {
      name: 'Add bullet point',
    });

    // Assert
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(btn);
  });

  it('should render the first three bullet points with placeholders from props `placeholder1`, `placeholder2` and `placeholder3` correspondingly', () => {
    render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const inputField: HTMLInputElement = screen.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      expect(inputField.placeholder).toBe(`Placeholder ${i + 1}`);
    }
  });

  it('should render bullet points with correct values from `data`', () => {
    render(<BulletPoints {...getProps()} />);

    ITEMS.forEach(({ value }, i) => {
      const inputField: HTMLInputElement = screen.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      expect(inputField.value).toBe(value);
    });
  });

  it('should call `editItem` when a bullet point value is changed', async () => {
    const editItemMock = jest.fn((_itemIndex: number, _value: string) => {});
    render(<BulletPoints {...getProps({ editItem: editItemMock })} />);
    const user = userEvent.setup();

    const inputField = screen.getByRole('textbox', {
      name: 'Bullet point 1',
    });

    await user.type(inputField, 's');

    expect(editItemMock).toHaveBeenCalledTimes(1);
    expect(editItemMock).toHaveBeenCalledWith(0, 'value 1s');
  });

  it('should render drag handles with accessible names "Drag bullet point [index + 1]" for each bullet point', () => {
    render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const dragHandle = screen.getByRole('button', {
        name: `Drag bullet point ${i + 1}`,
      });

      expect(dragHandle).toBeInTheDocument();
    }
  });

  it('should announce "Picked up draggable item [index + 1]" to screen readers when the drag handle of a bullet point [index + 1] is clicked for the first time (in other words, on drag start)', async () => {
    render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const dragHandle = screen.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.focus();
    await user.keyboard(' ');

    const a11yElement = screen.getByText('Picked up draggable item 1.');

    expect(a11yElement).toBeInTheDocument();
  });

  // TODO: figure out how to test drag over. As far as I understand, it is impossible to do by the means of unit testing, at least in Jest.

  it('should announce "Dragging was cancelled. Draggable item [index + 1] was put to its initial position." to screen readers when Escape is pressed during dragging', async () => {
    render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const dragHandle = screen.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.focus();
    await user.keyboard(' ');
    await user.keyboard('{Escape}');

    const a11yElement = screen.getByText(
      'Dragging was cancelled. Draggable item 1 was put to its initial position.',
    );

    expect(a11yElement).toBeInTheDocument();
  });

  it('should announce "Draggable item [index + 1] was dropped over droppable area [droppableIndex + 1]" to screen readers when the dragged bullet point [index + 1] is dropped over droppable area [droppableIndex + 1]', async () => {
    render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const dragHandle = screen.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.focus();
    await user.keyboard(' ');
    await user.keyboard(' ');

    const a11yElement = screen.getByText(
      'Draggable item 1 was dropped over droppable area 1',
    );

    expect(a11yElement).toBeInTheDocument();
  });

  it('should provide a screen reader instruction "To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel."', async () => {
    render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const dragHandle = screen.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    await user.tab();

    expect(dragHandle).toHaveFocus();

    const descriptionNode = document.getElementById(
      dragHandle.getAttribute('aria-describedBy')!,
    )!;

    const cleanText = (text: string) => text.replaceAll(/\s+/g, ' ').trim();

    expect(cleanText(descriptionNode.textContent)).toBe(
      'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.',
    );
  });

  it('should render delete buttons with accessible names "Delete bullet point [index + 1]" for each bullet point', () => {
    render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const deleteBtn = screen.getByRole('button', {
        name: `Delete bullet point ${i + 1}`,
      });

      expect(deleteBtn).toBeInTheDocument();
    }
  });

  it('should call `deleteItem` with a correct index when a delete button is pressed', async () => {
    const deleteItemMock = jest.fn((_itemIndex: number) => {});
    render(<BulletPoints {...getProps({ deleteItem: deleteItemMock })} />);
    const user = userEvent.setup();

    const deleteBtn = screen.getByRole('button', {
      name: 'Delete bullet point 1',
    });

    await user.click(deleteBtn);

    expect(deleteItemMock).toHaveBeenCalledTimes(1);
    expect(deleteItemMock).toHaveBeenCalledWith(0);
  });

  it('should announce "Bullet point [index + 1] was deleted." to screen readers when a delete button is clicked', async () => {
    const updateScreenReaderAnnouncementMock = jest.fn(
      (_announcement: string) => {},
    );

    render(
      <BulletPoints
        {...getProps({
          updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
        })}
      />,
    );

    const user = userEvent.setup();

    const deleteBtn = screen.getByRole('button', {
      name: 'Delete bullet point 1',
    });

    await user.click(deleteBtn);

    expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);

    expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledWith(
      'Bullet point 1 was deleted.',
    );
  });

  it("should render an add-button with an accessible name 'Add bullet point' if `itemName` isn't provided", () => {
    render(<BulletPoints {...getProps()} />);

    const addBtn = screen.getByRole('button', {
      name: 'Add bullet point',
    });

    expect(addBtn).toBeInTheDocument();
  });

  it('should render an add-button with an accessible name "Add [itemName]" if `itemName` is provided', () => {
    render(<BulletPoints {...getProps({ itemName: 'something' })} />);

    const addBtn = screen.getByRole('button', {
      name: 'Add something',
    });

    expect(addBtn).toBeInTheDocument();
  });

  it('should call `addItem` when the add-button is clicked', async () => {
    const addItemMock = jest.fn();
    render(<BulletPoints {...getProps({ addItem: addItemMock })} />);
    const user = userEvent.setup();

    const addBtn = screen.getByRole('button', {
      name: 'Add bullet point',
    });

    await user.click(addBtn);

    expect(addItemMock).toHaveBeenCalledTimes(1);
  });

  it("should focus the next bullet point's delete button if a bullet point that is not last is deleted", async () => {
    render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const firstBulletPointDeleteBtn = screen.getByRole('button', {
      name: 'Delete bullet point 1',
    });

    const secondBulletPointDeleteBtn = screen.getByRole('button', {
      name: 'Delete bullet point 2',
    });

    firstBulletPointDeleteBtn.focus();

    await user.click(firstBulletPointDeleteBtn);

    expect(secondBulletPointDeleteBtn).toHaveFocus();
  });

  it('should focus the add-button if the only bullet point is deleted', async () => {
    render(
      <BulletPoints
        {...getProps({ data: [{ id: crypto.randomUUID(), value: '' }] })}
      />,
    );

    const user = userEvent.setup();

    const deleteBtn = screen.getByRole('button', {
      name: 'Delete bullet point 1',
    });

    const addBtn = screen.getByRole('button', {
      name: `Add bullet point`,
    });

    deleteBtn.focus();

    await user.click(deleteBtn);

    expect(addBtn).toHaveFocus();
  });

  it("should focus the previous bullet point's delete button if the last bullet point (that is not the only one) is deleted", async () => {
    render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    // There are three bullet points.

    const secondBulletPointDeleteBtn = screen.getByRole('button', {
      name: 'Delete bullet point 2',
    });

    const thirdBulletPointDeleteBtn = screen.getByRole('button', {
      name: 'Delete bullet point 3',
    });

    thirdBulletPointDeleteBtn.focus();

    await user.click(thirdBulletPointDeleteBtn);

    expect(secondBulletPointDeleteBtn).toHaveFocus();
  });
});
