import { createRef } from 'react';
import type { MouseEvent } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Button from './Button';

describe('Button', () => {
  let handleClickMock: jest.Mock<void, [MouseEvent<HTMLButtonElement>]>;

  beforeEach(() => {
    handleClickMock = jest.fn();
  });

  it('should render with the correct accessible name and default type', () => {
    render(<Button onClick={handleClickMock}>Click me</Button>);

    const btn = screen.getByRole('button', { name: 'Click me' });

    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveClass('Button');
  });

  it('should apply BEM elements, modifiers and custom classNames', () => {
    render(
      <Button
        className="custom-class"
        elements="ParentBlock-ActionButton"
        modifiers={['Button_primary', 'Button_width_full']}
        onClick={handleClickMock}
      >
        Styled button
      </Button>,
    );

    const btn = screen.getByRole('button', { name: 'Styled button' });

    expect(btn).toHaveClass(
      'Button',
      'custom-class',
      'ParentBlock-ActionButton',
      'Button_primary',
      'Button_width_full',
    );
  });

  it('should use the `aria-label` prop for its accessible name when provided', () => {
    render(
      <Button aria-label="Close Dialog" onClick={handleClickMock}>
        X
      </Button>,
    );

    const btn = screen.getByRole('button', { name: 'Close Dialog' });

    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('X');
  });

  it('should forward ref to the underlying HTML button element', () => {
    const buttonRef = createRef<HTMLButtonElement>();

    render(
      <Button ref={buttonRef} onClick={handleClickMock}>
        With Ref
      </Button>,
    );

    const btn = screen.getByRole('button', { name: 'With Ref' });

    expect(buttonRef.current).toBe(btn);
  });

  it('should call the `onClick` handler when the user clicks the button', async () => {
    const user = userEvent.setup();

    render(<Button onClick={handleClickMock}>Click me</Button>);
    const btn = screen.getByRole('button', { name: 'Click me' });

    await user.click(btn);

    expect(handleClickMock).toHaveBeenCalledTimes(1);
  });

  it('should not call `onClick` when the button is disabled', async () => {
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClickMock}>
        Disabled button
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Disabled button' });

    await user.click(btn);

    expect(handleClickMock).not.toHaveBeenCalled();
    expect(btn).toBeDisabled();
  });
});
