import type { MouseEvent } from 'react';

import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import Button from './Button';

import type { Mock } from 'vitest';

describe('Button', () => {
  let handleClickMock: Mock<(e: MouseEvent<HTMLButtonElement>) => void>;

  beforeEach(() => {
    handleClickMock = vi.fn();
  });

  it('should render with the correct accessible name from its children', async () => {
    const screen = await render(
      <Button onClick={handleClickMock}>Click me</Button>,
    );

    const btn = screen.getByRole('button', { name: /click me/i });

    await expect.element(btn).toBeInTheDocument();
  });

  it('should use the `aria-label` prop for its accessible name when provided', async () => {
    const screen = await render(
      <Button aria-label="Close Dialog" onClick={handleClickMock}>
        X
      </Button>,
    );

    const btn = screen.getByRole('button', { name: /close dialog/i });

    await expect.element(btn).toBeInTheDocument();
    await expect.element(btn).toHaveTextContent('X');
  });

  it('should call the `onClick` handler when the user clicks the button', async () => {
    const user = userEvent.setup();
    const screen = await render(
      <Button onClick={handleClickMock}>Click me</Button>,
    );
    const btn = screen.getByRole('button', { name: /click me/i });

    await user.click(btn);

    expect(handleClickMock).toHaveBeenCalledTimes(1);
  });
});
