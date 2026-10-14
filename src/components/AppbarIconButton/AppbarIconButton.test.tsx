import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import AppbarIconButton from './AppbarIconButton';

import type { AppbarIconButtonProps } from './AppbarIconButton';

describe('AppbarIconButton', () => {
  const getProps = (
    overrides: Partial<AppbarIconButtonProps> = {},
  ): AppbarIconButtonProps => ({
    alt: 'Alternative text',
    onClick: vi.fn(),
    iconSrc: 'path/to/icon.jpg',
    ...overrides,
  });

  it('should render with an accessible name', async () => {
    const props = getProps();
    const screen = await render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props.alt });

    await expect.element(btn).toBeInTheDocument();
  });

  it('should use the `aria-label` prop for its accessible name when provided', async () => {
    const props = getProps({ 'aria-label': 'Close Dialog' });
    const screen = await render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props['aria-label'] });

    await expect.element(btn).toBeInTheDocument();
  });

  it('should render the correct icon', async () => {
    const props = getProps();
    const screen = await render(<AppbarIconButton {...props} />);

    const icon = screen.getByAltText(props.alt!);

    await expect.element(icon).toHaveAttribute('src', props.iconSrc);
  });

  it('should call `onClick` on a click event', async () => {
    const props = getProps();
    const user = userEvent.setup();
    const screen = await render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props.alt });
    await user.click(btn);

    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply the large icon modifier class when `largeIcon` is true', async () => {
    // Arrange
    const props = getProps({ largeIcon: true });

    // Act
    const screen = await render(<AppbarIconButton {...props} />);

    // Assert
    const icon = screen.getByRole('img');

    await expect.element(icon).toHaveClass('AppbarIconButton-Icon_large');
  });

  it('should not apply the large icon modifier class by default', async () => {
    // Arrange
    const props = getProps();

    // Act
    const screen = await render(<AppbarIconButton {...props} />);

    // Assert
    const icon = screen.getByRole('img');

    await expect.element(icon).not.toHaveClass('AppbarIconButton-Icon_large');
  });
});
