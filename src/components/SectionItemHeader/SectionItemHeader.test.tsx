import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SectionItemHeader from './SectionItemHeader';

import type { SectionItemHeaderProps } from './SectionItemHeader';

function getProps(
  overrides?: Partial<SectionItemHeaderProps>,
): SectionItemHeaderProps {
  return {
    addItem: jest.fn(),
    deleteItem: jest.fn(),
    handleFocus: jest.fn(),
    handleKeyDown: jest.fn(),
    itemName: 'Project',
    itemNumber: 1,
    itemsNumber: 1,
    showNextItem: jest.fn(),
    showPreviousItem: jest.fn(),
    ...overrides,
  };
}

describe('SectionItemHeader', () => {
  describe('Baseline Semantic Structure & Accessible Names', () => {
    it('should render a semantic level-2 heading identifying the current item number', () => {
      const props = getProps({ itemNumber: 1, itemsNumber: 1 });
      render(<SectionItemHeader {...props} />);

      const heading = screen.getByRole('heading', {
        level: 2,
        name: 'Project 1',
      });

      expect(heading).toBeInTheDocument();
    });

    it('should render only the Add button when there is a single item in the collection', () => {
      const props = getProps({ itemNumber: 1, itemsNumber: 1 });
      render(<SectionItemHeader {...props} />);

      const addBtn = screen.getByRole('button', { name: 'Add Project 2' });
      expect(addBtn).toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: /previous/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /show next/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /delete/i }),
      ).not.toBeInTheDocument();
    });

    it('should render Next, Add, and Delete buttons on the first item of a multi-item collection', () => {
      const props = getProps({ itemNumber: 1, itemsNumber: 3 });
      render(<SectionItemHeader {...props} />);

      expect(
        screen.getByRole('button', { name: 'Show Next Project' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Project 4' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete Project 1' }),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: /previous/i }),
      ).not.toBeInTheDocument();
    });

    it('should render Previous, Next, Add, and Delete buttons on a middle item of a multi-item collection', () => {
      const props = getProps({ itemNumber: 2, itemsNumber: 3 });
      render(<SectionItemHeader {...props} />);

      expect(
        screen.getByRole('button', { name: 'Show Previous Project' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Show Next Project' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Project 4' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete Project 2' }),
      ).toBeInTheDocument();
    });

    it('should render Previous, Add, and Delete buttons on the final item of a multi-item collection', () => {
      const props = getProps({ itemNumber: 3, itemsNumber: 3 });
      render(<SectionItemHeader {...props} />);

      expect(
        screen.getByRole('button', { name: 'Show Previous Project' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Project 4' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete Project 3' }),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: /show next/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('User Interactions via userEvent', () => {
    it('should invoke `addItem` when the Add button is clicked', async () => {
      const user = userEvent.setup();
      const addItemMock = jest.fn();
      const props = getProps({ addItem: addItemMock });
      render(<SectionItemHeader {...props} />);

      const addBtn = screen.getByRole('button', { name: 'Add Project 2' });
      await user.click(addBtn);

      expect(addItemMock).toHaveBeenCalledTimes(1);
    });

    it('should invoke `showNextItem` when the Show Next button is clicked', async () => {
      const user = userEvent.setup();
      const showNextMock = jest.fn();
      const props = getProps({
        itemNumber: 1,
        itemsNumber: 2,
        showNextItem: showNextMock,
      });
      render(<SectionItemHeader {...props} />);

      const nextBtn = screen.getByRole('button', { name: 'Show Next Project' });
      await user.click(nextBtn);

      expect(showNextMock).toHaveBeenCalledTimes(1);
    });

    it('should invoke `showPreviousItem` when the Show Previous button is clicked', async () => {
      const user = userEvent.setup();
      const showPreviousMock = jest.fn();
      const props = getProps({
        itemNumber: 2,
        itemsNumber: 2,
        showPreviousItem: showPreviousMock,
      });
      render(<SectionItemHeader {...props} />);

      const prevBtn = screen.getByRole('button', {
        name: 'Show Previous Project',
      });
      await user.click(prevBtn);

      expect(showPreviousMock).toHaveBeenCalledTimes(1);
    });

    it('should invoke `deleteItem` when the Delete button is clicked', async () => {
      const user = userEvent.setup();
      const deleteItemMock = jest.fn();
      const props = getProps({
        itemNumber: 1,
        itemsNumber: 2,
        deleteItem: deleteItemMock,
      });
      render(<SectionItemHeader {...props} />);

      const deleteBtn = screen.getByRole('button', {
        name: 'Delete Project 1',
      });
      await user.click(deleteBtn);

      expect(deleteItemMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard & Focus Management (Shift+Tab Reverse Tabbing)', () => {
    it('should attach `handleFocus` and `handleKeyDown` to the Add button when single item exists', async () => {
      const user = userEvent.setup();
      const handleFocusMock = jest.fn();
      const handleKeyDownMock = jest.fn();
      const props = getProps({
        handleFocus: handleFocusMock,
        handleKeyDown: handleKeyDownMock,
        itemNumber: 1,
        itemsNumber: 1,
      });
      render(<SectionItemHeader {...props} />);

      const addBtn = screen.getByRole('button', { name: 'Add Project 2' });
      await user.click(addBtn);

      expect(handleFocusMock).toHaveBeenCalledTimes(1);

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(handleKeyDownMock).toHaveBeenCalled();
    });

    it('should attach `handleFocus` and `handleKeyDown` to the Next button when on first item of multiple', async () => {
      const user = userEvent.setup();
      const handleFocusMock = jest.fn();
      const handleKeyDownMock = jest.fn();
      const props = getProps({
        handleFocus: handleFocusMock,
        handleKeyDown: handleKeyDownMock,
        itemNumber: 1,
        itemsNumber: 2,
      });
      render(<SectionItemHeader {...props} />);

      const nextBtn = screen.getByRole('button', { name: 'Show Next Project' });
      nextBtn.focus();

      expect(handleFocusMock).toHaveBeenCalledTimes(1);

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(handleKeyDownMock).toHaveBeenCalled();
    });

    it('should attach `handleFocus` and `handleKeyDown` to the Previous button when itemNumber > 1', async () => {
      const user = userEvent.setup();
      const handleFocusMock = jest.fn();
      const handleKeyDownMock = jest.fn();
      const props = getProps({
        handleFocus: handleFocusMock,
        handleKeyDown: handleKeyDownMock,
        itemNumber: 2,
        itemsNumber: 3,
      });
      render(<SectionItemHeader {...props} />);

      const prevBtn = screen.getByRole('button', {
        name: 'Show Previous Project',
      });
      prevBtn.focus();

      expect(handleFocusMock).toHaveBeenCalledTimes(1);

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(handleKeyDownMock).toHaveBeenCalled();
    });

    it('should operate safely without runtime exceptions when `handleFocus` is omitted', async () => {
      const user = userEvent.setup();
      const handleKeyDownMock = jest.fn();
      const props = getProps({
        handleFocus: undefined,
        handleKeyDown: handleKeyDownMock,
        itemNumber: 2,
        itemsNumber: 3,
      });

      render(<SectionItemHeader {...props} />);

      const prevBtn = screen.getByRole('button', {
        name: 'Show Previous Project',
      });
      prevBtn.focus();

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(handleKeyDownMock).toHaveBeenCalled();
    });
  });

  describe('Focus Retention and Boundary Handling', () => {
    /**
     * VULN-02: Focus Loss on Item Deletion (WCAG 2.4.3 Focus Order).
     * When deleting an item down to a single item, the Delete button unmounts.
     * Focus must smoothly transfer to the available Add button.
     */
    it('retains focus on an available control when deleting down to 1 item', async () => {
      const user = userEvent.setup();
      const propsTwoItems = getProps({
        itemNumber: 2,
        itemsNumber: 2,
      });

      const { rerender } = render(<SectionItemHeader {...propsTwoItems} />);

      const deleteBtn = screen.getByRole('button', {
        name: 'Delete Project 2',
      });
      deleteBtn.focus();
      expect(document.activeElement).toBe(deleteBtn);

      await user.click(deleteBtn);

      const propsSingleItem = getProps({
        itemNumber: 1,
        itemsNumber: 1,
      });
      rerender(<SectionItemHeader {...propsSingleItem} />);

      const addBtn = screen.getByRole('button', { name: 'Add Project 2' });
      expect(document.activeElement).toBe(addBtn);
    });

    /**
     * VULN-02: Focus Loss on Boundary Navigation (WCAG 2.4.3 Focus Order).
     * When navigating to the last item, the "Show Next" button unmounts while focused.
     * Focus must smoothly transfer to the available "Show Previous" button.
     */
    it('retains focus on an available control when navigating to the last item', async () => {
      const user = userEvent.setup();
      const propsItem1 = getProps({
        itemNumber: 1,
        itemsNumber: 2,
      });

      const { rerender } = render(<SectionItemHeader {...propsItem1} />);

      const nextBtn = screen.getByRole('button', { name: 'Show Next Project' });
      nextBtn.focus();
      expect(document.activeElement).toBe(nextBtn);

      await user.click(nextBtn);

      const propsItem2 = getProps({
        itemNumber: 2,
        itemsNumber: 2,
      });
      rerender(<SectionItemHeader {...propsItem2} />);

      const prevBtn = screen.getByRole('button', {
        name: 'Show Previous Project',
      });
      expect(document.activeElement).toBe(prevBtn);
    });

    /**
     * VULN-05: Zero Items Boundary Handling.
     * When itemsNumber is 0, the component must never render navigation or "Show Next".
     */
    it('must not render navigation controls or Show Next button when itemsNumber is 0', () => {
      render(
        <SectionItemHeader
          {...getProps({
            itemNumber: 1,
            itemsNumber: 0,
          })}
        />,
      );

      expect(
        screen.queryByRole('button', { name: /previous/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /show next/i }),
      ).not.toBeInTheDocument();
    });

    /**
     * VULN-10: Architectural Parity & Delete Button ID (WCAG 4.1.2).
     * Sibling sections assign id="delete-degree" and id="delete-job".
     * SectionItemHeader must assign id="delete-project".
     */
    it('assigns an id attribute to the delete button matching sibling sections', () => {
      render(
        <SectionItemHeader
          {...getProps({
            itemNumber: 1,
            itemsNumber: 2,
          })}
        />,
      );

      const deleteBtn = screen.getByRole('button', {
        name: 'Delete Project 1',
      });

      expect(deleteBtn).toHaveAttribute('id', 'delete-project');
    });

    /**
     * VULN-03: Keyboard Navigation & Reverse Tabbing Order.
     * When on the final item of a multi-item collection, "Show Previous" is the
     * first tabbable element and handles `Shift+Tab`.
     * The Add button must not hijack reverse tabbing.
     */
    it('does not hijack Shift+Tab on Add button when itemsNumber > 1, routing reverse tabbing through Show Previous', async () => {
      const user = userEvent.setup();
      const handleKeyDownMock = jest.fn();
      render(
        <SectionItemHeader
          {...getProps({
            handleKeyDown: handleKeyDownMock,
            itemNumber: 2,
            itemsNumber: 2,
          })}
        />,
      );

      const addBtn = screen.getByRole('button', { name: 'Add Project 3' });
      addBtn.focus();

      await user.keyboard('{Shift>}{Tab}{/Shift}');

      expect(handleKeyDownMock).not.toHaveBeenCalled();

      const prevBtn = screen.getByRole('button', {
        name: 'Show Previous Project',
      });
      prevBtn.focus();

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(handleKeyDownMock).toHaveBeenCalled();
    });

    it('attaches keyboard handler to Add button when itemsNumber <= 1 as the first tabbable element', async () => {
      const user = userEvent.setup();
      const handleKeyDownMock = jest.fn();
      render(
        <SectionItemHeader
          {...getProps({
            handleKeyDown: handleKeyDownMock,
            itemNumber: 1,
            itemsNumber: 0,
          })}
        />,
      );

      const addBtn = screen.getByRole('button', { name: 'Add Project 1' });
      addBtn.focus();

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(handleKeyDownMock).toHaveBeenCalled();
    });
  });

  describe('Screen Reader Announcements', () => {
    it('calls updateScreenReaderAnnouncement when navigating, adding or deleting items', async () => {
      const user = userEvent.setup();
      const announceMock = jest.fn();
      render(
        <SectionItemHeader
          {...getProps({
            itemNumber: 2,
            itemsNumber: 3,
            updateScreenReaderAnnouncement: announceMock,
          })}
        />,
      );

      const prevBtn = screen.getByRole('button', {
        name: 'Show Previous Project',
      });
      await user.click(prevBtn);
      expect(announceMock).toHaveBeenCalledWith('Showing Project 1');

      const nextBtn = screen.getByRole('button', {
        name: 'Show Next Project',
      });
      await user.click(nextBtn);
      expect(announceMock).toHaveBeenCalledWith('Showing Project 3');

      const addBtn = screen.getByRole('button', { name: 'Add Project 4' });
      await user.click(addBtn);
      expect(announceMock).toHaveBeenCalledWith('Project 4 was added');

      const deleteBtn = screen.getByRole('button', {
        name: 'Delete Project 2',
      });
      await user.click(deleteBtn);
      expect(announceMock).toHaveBeenCalledWith('Project 2 was deleted');
    });
  });
});
