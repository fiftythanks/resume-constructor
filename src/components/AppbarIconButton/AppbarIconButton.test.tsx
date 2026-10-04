import { createRef } from 'react';
import type { MouseEvent } from 'react';

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
    iconSrc: 'path/to/icon.jpg',
    onClick: jest.fn<void, [MouseEvent<HTMLButtonElement>]>(),
    ...overrides,
  });

  it('should render with an accessible name and designated BEM classes', () => {
    const props = getProps({ className: 'custom-modifier' });
    render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props.alt });
    const icon = screen.getByAltText(props.alt!);

    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('AppbarIconButton', 'custom-modifier');
    expect(btn).toHaveAttribute('type', 'button');
    expect(icon).toHaveClass('AppbarIconButton-Icon');
    expect(icon).toHaveAttribute('src', props.iconSrc);
  });

  it('should use the `aria-label` prop for its accessible name when provided', () => {
    const props = getProps({ 'aria-label': 'Close Dialog' });
    render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: 'Close Dialog' });

    expect(btn).toBeInTheDocument();
  });

  it('should forward ref to the underlying button element', () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const props = getProps({ ref: buttonRef });
    render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props.alt });

    expect(buttonRef.current).toBe(btn);
  });

  it('should call `onClick` on a click event', async () => {
    const props = getProps();
    const user = userEvent.setup();
    render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props.alt });
    await user.click(btn);

    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it('should not call `onClick` when the button is disabled', async () => {
    const props = getProps({ disabled: true });
    const user = userEvent.setup();
    render(<AppbarIconButton {...props} />);

    const btn = screen.getByRole('button', { name: props.alt });
    await user.click(btn);

    expect(props.onClick).not.toHaveBeenCalled();
    expect(btn).toBeDisabled();
  });
});
