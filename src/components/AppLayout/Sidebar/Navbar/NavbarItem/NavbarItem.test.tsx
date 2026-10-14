import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import NavbarItem from './NavbarItem';

import type { NavbarItemProps } from './NavbarItem';

function getProps(overrides?: Partial<NavbarItemProps>): NavbarItemProps {
  return {
    alt: 'Alternative text',
    iconSrc: 'path/to/icon.svg',
    isDraggable: true,
    isEditorMode: false,
    isSelected: false,
    sectionId: 'certifications',
    sectionTitle: 'Certifications',
    tabIndex: 0,
    onDeleteSection: vi.fn(),
    onSelectSection: vi.fn(),
    ...overrides,
  };
}

describe('NavbarItem', () => {
  describe('tab', () => {
    it('should render with an accessible name from the `sectionTitle` prop', async () => {
      const props = getProps();
      await render(<NavbarItem {...props} />);

      const tab = page.getByRole('tab', { name: props.sectionTitle });

      await expect.element(tab).toBeInTheDocument();
    });

    it('should call `onSelectSection` on click when `isEditorMode === false', async () => {
      const user = userEvent.setup();
      const props = getProps();
      await render(<NavbarItem {...props} />);

      const tab = page.getByRole('tab', { name: props.sectionTitle });
      await user.click(tab);

      expect(props.onSelectSection).toHaveBeenCalledTimes(1);
    });

    it('should not call `onSelectSection` on click when `isEditorMode === true', async () => {
      const user = userEvent.setup();
      const props = getProps({ isEditorMode: true });
      await render(<NavbarItem {...props} />);

      const tab = page.getByRole('tab', { name: props.sectionTitle });
      await user.click(tab, { force: true });

      expect(props.onSelectSection).not.toHaveBeenCalled();
    });

    it('should be enabled when `isEditorMode === false`', async () => {
      const props = getProps({ isEditorMode: false });
      await render(<NavbarItem {...props} />);

      const tab = page.getByRole('tab', { name: props.sectionTitle });

      await expect.element(tab).toHaveAttribute('aria-disabled', 'false');
    });

    it('should be disabled when `isEditorMode === true`', async () => {
      const props = getProps({ isEditorMode: true });
      await render(<NavbarItem {...props} />);

      const tab = page.getByRole('tab', { name: props.sectionTitle });

      await expect.element(tab).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be selected when `isSelected === true`', async () => {
      const props = getProps({ isSelected: true });
      await render(<NavbarItem {...props} />);

      const tab = page.getByRole('tab', { name: props.sectionTitle });

      await expect.element(tab).toHaveAttribute('aria-selected', 'true');
    });

    it('should not be selected when `isSelected === false`', async () => {
      const props = getProps({ isSelected: false });
      await render(<NavbarItem {...props} />);

      const tab = page.getByRole('tab', { name: props.sectionTitle });

      await expect.element(tab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('icon', () => {
    it('should render with an accessible name from the `alt` prop', async () => {
      const props = getProps();
      await render(<NavbarItem {...props} />);

      const icon = page.getByRole('img', { name: props.alt });

      await expect.element(icon).toBeInTheDocument();
    });

    it('should render the correct icon', async () => {
      const props = getProps();
      await render(<NavbarItem {...props} />);

      const icon = page.getByRole('img', {
        name: props.alt,
      });

      const endsWithIconSrc = new RegExp(`${props.iconSrc}$`);
      await expect
        .element(icon)
        .toHaveAttribute('src', expect.stringMatching(endsWithIconSrc));
    });

    it('should be a correct icon specified with the `iconSrc` prop', async () => {
      const props = getProps();
      await render(<NavbarItem {...props} />);
      const icon = page.getByRole('img', { name: props.alt });

      await expect.element(icon).toHaveAttribute('src', props.iconSrc);
    });
  });

  describe('delete button', () => {
    describe('render conditions', () => {
      it('should render when `isEditorMode === true && isDraggable === true`', async () => {
        const props = getProps({ isEditorMode: true });
        await render(<NavbarItem {...props} />);

        const button = page.getByRole('button', {
          name: `Delete ${props.sectionTitle}`,
        });

        await expect.element(button).toBeInTheDocument();
      });

      it('should not render when `isEditorMode === false && isDraggable === true`', async () => {
        const props = getProps();
        await render(<NavbarItem {...props} />);

        const btn = page.getByRole('button', {
          name: `Delete ${props.sectionTitle}`,
        });

        await expect.element(btn).not.toBeInTheDocument();
      });

      it('should not render when `isEditorMode === true && isDraggable === false`', async () => {
        const props = getProps({ isEditorMode: true, isDraggable: false });
        await render(<NavbarItem {...props} />);

        const btn = page.getByRole('button', {
          name: `Delete ${props.sectionTitle}`,
        });

        await expect.element(btn).not.toBeInTheDocument();
      });

      it('should not render when `isEditorMode === false && isDraggable === false`', async () => {
        const props = getProps({ isDraggable: false });
        await render(<NavbarItem {...props} />);

        const btn = page.getByRole('button', {
          name: `Delete ${props.sectionTitle}`,
        });

        await expect.element(btn).not.toBeInTheDocument();
      });
    });

    it('should call `onDeleteSection` on click', async () => {
      const user = userEvent.setup();
      const props = getProps({ isEditorMode: true });
      await render(<NavbarItem {...props} />);

      const deleteBtn = page.getByRole('button', {
        name: `Delete ${props.sectionTitle}`,
      });

      await user.click(deleteBtn);

      expect(props.onDeleteSection).toHaveBeenCalledTimes(1);
    });
  });
});
