import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import '@testing-library/jest-dom/vitest';

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
  it('should render a heading with text from its `title` prop', () => {
    render(<Container />);
    render(<Popup {...getProps()} />);

    const heading = screen.getByRole('heading', { name: 'Some Title' });

    expect(heading).toBeInTheDocument();
  });

  it('should render with an accessible name from its heading', () => {
    render(<Container />);
    render(<Popup {...getProps()} />);

    const popup = screen.getByRole('dialog', { name: 'Some Title' });

    expect(popup).toBeInTheDocument();
  });

  it("shouldn't render if `isShown === false`", () => {
    render(<Container />);
    render(<Popup {...getProps({ isShown: false })} />);

    const popup = screen.queryByRole('dialog', { name: 'Some Title' });

    expect(popup).not.toBeInTheDocument();
  });

  it('should close and call `onClose` when Escape is pressed', async () => {
    // Arrange
    const onCloseMock = vi.fn();
    render(<Container />);
    render(<Popup {...getProps({ onClose: onCloseMock })} />);

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    const popup = screen.queryByRole('dialog', { name: 'Some Title' });

    expect(popup).not.toBeInTheDocument();
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
