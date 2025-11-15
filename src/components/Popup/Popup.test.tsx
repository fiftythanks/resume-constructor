import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

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

// should render a heading with text `title`

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

  it('should call `onClose` on close', () => {
    const onCloseMock = jest.fn();
    render(<Container />);
    render(<Popup {...getProps({ onClose: onCloseMock })} />);
    const popup = screen.getByRole('dialog', { name: 'Some Title' });

    /**
     * JSDOM hasn't implemented HTMLDialogElement properly yet, so the `close`
     * event won't fire when the popup is closed. I had to come up with
     * a workaround in this test. This is the best thing I could've thought of
     * at the moment.
     */
    fireEvent(popup, new Event('close'));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  // TODO: add a test for closing the popup by pressing Escape.

  it('should render a heading with text from the prop `title`', () => {
    render(<Container />);
    render(<Popup {...getProps()} />);

    const heading = screen.getByRole('heading', { name: 'Some Title' });

    expect(heading).toBeInTheDocument();
  });
});
