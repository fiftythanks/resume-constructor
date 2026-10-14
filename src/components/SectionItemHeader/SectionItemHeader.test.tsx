import type { FocusEvent, KeyboardEvent, RefObject } from 'react';

import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import SectionItemHeader from './SectionItemHeader';

import type { SectionItemHeaderProps } from './SectionItemHeader';

function getMockSectionItemHeaderProps(
  overrides?: Partial<SectionItemHeaderProps>,
): SectionItemHeaderProps {
  return {
    addItem: vi.fn<() => void>(),
    deleteItem: vi.fn<() => void>(),
    handleFocus: vi.fn<(e: FocusEvent<HTMLElement>) => void>(),
    handleKeyDown: vi.fn<(e: KeyboardEvent) => void>(),
    itemName: 'Project',
    itemNumber: 1,
    itemsNumber: 1,
    showNextItem: vi.fn<() => void>(),
    showPreviousItem: vi.fn<() => void>(),
    updateScreenReaderAnnouncement: vi.fn<(announcement: string) => void>(),
    ...overrides,
  };
}

describe('SectionItemHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Semantic Structure & Accessibility', () => {
    it('should render a level-2 heading identifying the item name and number', async () => {
      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            itemName: 'Degree',
            itemNumber: 2,
            itemsNumber: 3,
          })}
        />,
      );

      const heading = screen.getByRole('heading', {
        level: 2,
        name: 'Degree 2',
      });

      await expect.element(heading).toBeInTheDocument();
    });

    it('should render only the Add button when there is a single item in the collection', async () => {
      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            itemNumber: 1,
            itemsNumber: 1,
          })}
        />,
      );

      await expect
        .element(screen.getByRole('button', { name: 'Add Project 2' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: /previous/i }))
        .not.toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: /show next/i }))
        .not.toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: /delete/i }))
        .not.toBeInTheDocument();
    });

    it('should render Next, Add and Delete buttons on the first item of a multi-item collection', async () => {
      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            itemNumber: 1,
            itemsNumber: 3,
          })}
        />,
      );

      await expect
        .element(screen.getByRole('button', { name: 'Show Next Project' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: 'Add Project 4' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: 'Delete Project 1' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: /previous/i }))
        .not.toBeInTheDocument();
    });

    it('should render Previous, Next, Add and Delete buttons on a middle item of a multi-item collection', async () => {
      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            itemNumber: 2,
            itemsNumber: 3,
          })}
        />,
      );

      await expect
        .element(screen.getByRole('button', { name: 'Show Previous Project' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: 'Show Next Project' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: 'Add Project 4' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: 'Delete Project 2' }))
        .toBeInTheDocument();
    });

    it('should render Previous, Add and Delete buttons on the final item of a multi-item collection', async () => {
      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            itemNumber: 3,
            itemsNumber: 3,
          })}
        />,
      );

      await expect
        .element(screen.getByRole('button', { name: 'Show Previous Project' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: 'Add Project 4' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: 'Delete Project 3' }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: /show next/i }))
        .not.toBeInTheDocument();
    });

    it('should not render navigation controls when itemsNumber is 0', async () => {
      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            itemNumber: 1,
            itemsNumber: 0,
          })}
        />,
      );

      await expect
        .element(screen.getByRole('button', { name: /previous/i }))
        .not.toBeInTheDocument();
      await expect
        .element(screen.getByRole('button', { name: /show next/i }))
        .not.toBeInTheDocument();
    });

    it('should forward a ref object to the root header element', async () => {
      const ref: RefObject<HTMLElement | null> = { current: null };

      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            ref,
          })}
        />,
      );

      const header = screen.getByTestId('section-item-header').element();

      expect(ref.current).toBe(header);
    });

    it('should invoke a callback ref with the root header element', async () => {
      const callbackRef = vi.fn();

      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            ref: callbackRef,
          })}
        />,
      );

      const header = screen.getByTestId('section-item-header').element();

      expect(callbackRef).toHaveBeenCalledTimes(1);
      expect(callbackRef).toHaveBeenCalledWith(header);
    });
  });

  describe('User Interactions & Live Announcements', () => {
    it('should invoke `addItem` and announce addition when Add button is clicked', async () => {
      expect.hasAssertions();

      const user = userEvent.setup();
      const addItemMock = vi.fn<() => void>();
      const announceMock = vi.fn<(announcement: string) => void>();

      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            addItem: addItemMock,
            itemName: 'Job',
            itemNumber: 2,
            itemsNumber: 2,
            updateScreenReaderAnnouncement: announceMock,
          })}
        />,
      );

      const addBtn = screen.getByRole('button', { name: 'Add Job 3' });
      await user.click(addBtn);

      expect(addItemMock).toHaveBeenCalledTimes(1);
      expect(announceMock).toHaveBeenCalledWith('Job 3 was added');
    });

    it('should invoke `deleteItem` and announce deletion when Delete button is clicked', async () => {
      expect.hasAssertions();

      const user = userEvent.setup();
      const deleteItemMock = vi.fn<() => void>();
      const announceMock = vi.fn<(announcement: string) => void>();

      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            deleteItem: deleteItemMock,
            itemName: 'Degree',
            itemNumber: 2,
            itemsNumber: 3,
            updateScreenReaderAnnouncement: announceMock,
          })}
        />,
      );

      const deleteBtn = screen.getByRole('button', { name: 'Delete Degree 2' });
      await user.click(deleteBtn);

      expect(deleteItemMock).toHaveBeenCalledTimes(1);
      expect(announceMock).toHaveBeenCalledWith('Degree 2 was deleted');
    });

    it('should invoke `showNextItem` and announce navigation when Next button is clicked', async () => {
      expect.hasAssertions();
      const user = userEvent.setup();
      const showNextMock = vi.fn<() => void>();
      const announceMock = vi.fn<(announcement: string) => void>();

      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            itemNumber: 1,
            itemsNumber: 3,
            showNextItem: showNextMock,
            updateScreenReaderAnnouncement: announceMock,
          })}
        />,
      );

      const nextBtn = screen.getByRole('button', { name: 'Show Next Project' });
      await user.click(nextBtn);

      expect(showNextMock).toHaveBeenCalledTimes(1);
      expect(announceMock).toHaveBeenCalledWith('Showing Project 2');
    });

    it('should invoke `showPreviousItem` and announce navigation when Previous button is clicked', async () => {
      expect.hasAssertions();
      const user = userEvent.setup();
      const showPreviousMock = vi.fn<() => void>();
      const announceMock = vi.fn<(announcement: string) => void>();

      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            itemNumber: 2,
            itemsNumber: 3,
            showPreviousItem: showPreviousMock,
            updateScreenReaderAnnouncement: announceMock,
          })}
        />,
      );

      const prevBtn = screen.getByRole('button', {
        name: 'Show Previous Project',
      });
      await user.click(prevBtn);

      expect(showPreviousMock).toHaveBeenCalledTimes(1);
      expect(announceMock).toHaveBeenCalledWith('Showing Project 1');
    });

    it('should operate safely when `updateScreenReaderAnnouncement` is omitted', async () => {
      expect.hasAssertions();
      const user = userEvent.setup();
      const addItemMock = vi.fn<() => void>();

      const screen = await render(
        <SectionItemHeader
          {...getMockSectionItemHeaderProps({
            addItem: addItemMock,
            updateScreenReaderAnnouncement: undefined,
          })}
        />,
      );

      const addBtn = screen.getByRole('button', { name: 'Add Project 2' });
      await expect(user.click(addBtn)).resolves.not.toThrow();

      expect(addItemMock).toHaveBeenCalledTimes(1);
    });
  });
});
