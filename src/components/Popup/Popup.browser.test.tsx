import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import Popup from './Popup';

import type { PopupProps } from './Popup';

/**
 * Since `Popup` is portalled to `popup-root`, there must exist an
 * element with such an ID.
 */
function Container() {
  return <div id="popup-root" />;
}

function getProps(overrides?: Partial<PopupProps>): PopupProps {
  return {
    children: <div />,
    id: 'some-id',
    isShown: true,
    onClose: () => {},
    title: 'Some Title',
    ...overrides,
  };
}

describe('Popup', () => {
  it('should close and call `onClose` when Escape is pressed', async () => {
    // Arrange
    const onCloseMock = vi.fn();
    await render(<Container />);
    const screen = await render(
      <Popup {...getProps({ onClose: onCloseMock })} />,
    );

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    const popup = screen.getByRole('dialog', { name: 'Some Title' });

    await expect.element(popup).not.toBeInTheDocument();
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
