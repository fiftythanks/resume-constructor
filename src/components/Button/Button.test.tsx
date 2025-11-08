import React, { MouseEvent } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from './Button';

import '@testing-library/jest-dom';

describe('Button', () => {
  let handleClickMock: jest.Mock<void, [MouseEvent<HTMLButtonElement>]>;

  beforeEach(() => {
    handleClickMock = jest.fn();
  });

  it('should render with the correct accessible name from its children', () => {
    render(<Button onClick={handleClickMock}>Click me</Button>);

    const btn = screen.getByRole('button', { name: /click me/i });

    expect(btn).toBeInTheDocument();
  });

  it('should use the `aria-label` prop for its accessible name when provided', () => {
    render(
      <Button aria-label="Close Dialog" onClick={handleClickMock}>
        X
      </Button>,
    );

    const btn = screen.getByRole('button', { name: /close dialog/i });

    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('X');
  });

  it('should call the `onClick` handler when the user clicks the button', async () => {
    const user = userEvent.setup();
    render(<Button onClick={handleClickMock}>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });

    await user.click(btn);

    expect(handleClickMock).toHaveBeenCalledTimes(1);
  });
});
