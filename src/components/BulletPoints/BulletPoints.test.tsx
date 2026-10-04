// It disallowed using `crypto`, which is well supported.
/* eslint-disable n/no-unsupported-features/node-builtins */

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
    addItem: jest.fn(),
    data: structuredClone(ITEMS),
    deleteItem: jest.fn(),
    editItem: jest.fn(),
    legend: 'Some Legend',
    name: 'some-name',
    placeholder1: 'Placeholder 1',
    placeholder2: 'Placeholder 2',
    placeholder3: 'Placeholder 3',
    updateData: jest.fn(),
    updateScreenReaderAnnouncement: jest.fn(),
    ...overrides,
  };
}

describe('BulletPoints', () => {
  it('should render as a group with an accessible name and BEM classes', () => {
    render(<BulletPoints {...getProps()} />);

    const group = screen.getByRole('group', { name: 'Some Legend' });
    const list = screen.getByRole('list');

    expect(group).toBeInTheDocument();
    expect(group).toHaveClass('BulletPoints');
    expect(list).toHaveClass('BulletPoints-List');
  });

  it('should render bullet points for each item in `data`', () => {
    render(<BulletPoints {...getProps()} />);

    ITEMS.forEach(({ id }, i) => {
      const inputField = screen.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      expect(inputField).toBeInTheDocument();
      expect(inputField).toHaveAttribute('id', id);
    });
  });

  it('should render the exact number of listitems matching the items in data', () => {
    render(<BulletPoints {...getProps()} />);

    const listitems = screen.getAllByRole('listitem');

    expect(listitems).toHaveLength(ITEMS.length);
  });

  it('should call `handleFocusOnFirstElement` when the first bullet point drag handle is focused', () => {
    const mockFn = jest.fn();
    const props = getProps({ handleFocusOnFirstElement: mockFn });
    render(<BulletPoints {...props} />);

    const dragHandle = screen.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.focus();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call `handleKeyDownOnFirstElement` when key is pressed on the first bullet point drag handle', async () => {
    const mockFn = jest.fn();
    const user = userEvent.setup();
    const props = getProps({ handleKeyDownOnFirstElement: mockFn });
    render(<BulletPoints {...props} />);

    const dragHandle = screen.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    dragHandle.focus();
    await user.keyboard('{Tab}');

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should render the first three bullet points with placeholders from props', () => {
    render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const inputField = screen.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      expect(inputField).toHaveAttribute('placeholder', `Placeholder ${i + 1}`);
    }
  });

  it('should render bullet points with correct values from `data`', () => {
    render(<BulletPoints {...getProps()} />);

    ITEMS.forEach(({ value }, i) => {
      const inputField = screen.getByRole('textbox', {
        name: `Bullet point ${i + 1}`,
      });

      expect(inputField).toHaveValue(value);
    });
  });

  it('should call `editItem` when a bullet point value is changed', async () => {
    const editItemMock = jest.fn();
    render(<BulletPoints {...getProps({ editItem: editItemMock })} />);
    const user = userEvent.setup();

    const inputField = screen.getByRole('textbox', {
      name: 'Bullet point 1',
    });

    await user.type(inputField, 's');

    expect(editItemMock).toHaveBeenCalledTimes(1);
    expect(editItemMock).toHaveBeenCalledWith(0, 'value 1s');
  });

  it('should render drag handles with accessible names for each bullet point', () => {
    render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const dragHandle = screen.getByRole('button', {
        name: `Drag bullet point ${i + 1}`,
      });

      expect(dragHandle).toBeInTheDocument();
    }
  });

  it('should announce drag start to screen readers when drag handle is pressed with Space', async () => {
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

  it('should announce drag cancellation when Escape is pressed during dragging', async () => {
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

  it('should announce drop when Space is pressed a second time', async () => {
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

  it('should provide instructions for keyboard drag-and-drop via aria-describedby', async () => {
    render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

    const dragHandle = screen.getByRole('button', {
      name: 'Drag bullet point 1',
    });

    await user.tab();

    expect(dragHandle).toHaveFocus();

    const descriptionNode = document.getElementById(
      dragHandle.getAttribute('aria-describedby')!,
    )!;

    const cleanText = (text: string) => text.replaceAll(/\s+/g, ' ').trim();

    expect(cleanText(descriptionNode.textContent)).toBe(
      'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.',
    );
  });

  it('should render delete buttons with accessible names for each bullet point', () => {
    render(<BulletPoints {...getProps()} />);

    for (let i = 0; i < ITEMS.length; i++) {
      const deleteBtn = screen.getByRole('button', {
        name: `Delete bullet point ${i + 1}`,
      });

      expect(deleteBtn).toBeInTheDocument();
    }
  });

  it('should call `deleteItem` with a correct index when a delete button is pressed', async () => {
    const deleteItemMock = jest.fn();
    render(<BulletPoints {...getProps({ deleteItem: deleteItemMock })} />);
    const user = userEvent.setup();

    const deleteBtn = screen.getByRole('button', {
      name: 'Delete bullet point 1',
    });

    await user.click(deleteBtn);

    expect(deleteItemMock).toHaveBeenCalledTimes(1);
    expect(deleteItemMock).toHaveBeenCalledWith(0);
  });

  it('should announce deletion to screen readers when a delete button is clicked', async () => {
    const updateScreenReaderAnnouncementMock = jest.fn();

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

  it.each([
    {
      expected: 'Add bullet point',
      itemName: undefined,
    },
    {
      expected: 'Add skill',
      itemName: 'skill',
    },
  ])(
    'should render add-button with accessible name "$expected" when itemName is $itemName',
    ({ expected, itemName }) => {
      render(<BulletPoints {...getProps({ itemName })} />);

      const addBtn = screen.getByRole('button', {
        name: expected,
      });

      expect(addBtn).toBeInTheDocument();
      expect(addBtn).toHaveClass('BulletPoints-Add');
    },
  );

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
      name: 'Add bullet point',
    });

    deleteBtn.focus();

    await user.click(deleteBtn);

    expect(addBtn).toHaveFocus();
  });

  it("should focus the previous bullet point's delete button if the last bullet point is deleted", async () => {
    render(<BulletPoints {...getProps()} />);
    const user = userEvent.setup();

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
