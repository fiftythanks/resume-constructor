import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import Popup from './Popup';

import type { PopupProps } from './Popup';

import '@testing-library/jest-dom';

/**
 * Since `Popup` is portalled to `popup-root`, there must exist an
 * element with such an ID.
 */
function Container() {
  return <div id="popup-root" />;
}

function children() {
  return <div />;
}

function getProps(overrides?: Partial<PopupProps>): PopupProps {
  return {
    children: children(),
    id: 'some-id',
    isShown: true,
    onClose: () => {},
    title: 'Some Title',
    ...overrides,
  };
}

describe('Popup', () => {
  it('should render with an accessible name from its `title` prop', () => {
    render(<Container />);
    render(<Popup {...getProps()} />);

    const popup = screen.getByRole('dialog', { name: 'Some Title' });

    expect(popup).toBeInTheDocument();
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
});
