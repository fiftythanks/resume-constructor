import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import AppbarIconButton from './AppbarIconButton';

import type { AppbarIconButtonProps } from './AppbarIconButton';

describe('AppbarIconButton', () => {
  const getProps = (
    overrides: Partial<AppbarIconButtonProps> = {},
  ): AppbarIconButtonProps => ({
    alt: 'Alternative text',
    onClick: jest.fn(),
    iconSrc: 'path/to/icon.jpg',
    ...overrides,
  });

  it('should render with an accessible name', () => {
    const props = getProps();
    render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props.alt });

    expect(btn).toBeInTheDocument();
  });

  it('should use the `aria-label` prop for its accessible name when provided', () => {
    const props = getProps({ 'aria-label': 'Close Dialog' });
    render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props['aria-label'] });

    expect(btn).toBeInTheDocument();
  });

  it('should render the correct icon', () => {
    const props = getProps();
    render(<AppbarIconButton {...props} />);

    const icon = screen.getByAltText(props.alt!);

    expect(icon).toHaveAttribute('src', props.iconSrc);
  });

  it('should call `onClick` on a click event', async () => {
    const props = getProps();
    const user = userEvent.setup();
    render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props.alt });
    await user.click(btn);

    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply the large icon modifier class when `largeIcon` is true', () => {
    // Arrange
    const props = getProps({ largeIcon: true });

    // Act
    render(<AppbarIconButton {...props} />);

    // Assert
    const icon = screen.getByRole('img');

    expect(icon).toHaveClass('AppbarIconButton-Icon_large');
  });

  it('should not apply the large icon modifier class by default', () => {
    // Arrange
    const props = getProps();

    // Act
    render(<AppbarIconButton {...props} />);

    // Assert
    const icon = screen.getByRole('img');

    expect(icon).not.toHaveClass('AppbarIconButton-Icon_large');
  });
});
