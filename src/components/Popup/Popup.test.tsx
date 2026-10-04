import { createRef } from 'react';
import type { RefObject } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Popup from './Popup';

import type { PopupProps } from './Popup';

describe('Popup', () => {
  let popupRoot: HTMLDivElement;

  beforeEach(() => {
    popupRoot = document.createElement('div');
    popupRoot.setAttribute('id', 'popup-root');
    document.body.appendChild(popupRoot);
  });

  afterEach(() => {
    popupRoot.remove();
    jest.clearAllMocks();
  });

  function getProps(overrides?: Partial<PopupProps>): PopupProps {
    return {
      children: <p>Dialog content</p>,
      id: 'test-popup',
      isShown: true,
      onClose: jest.fn(),
      title: 'Some Title',
      ...overrides,
    };
  }

  it('should render a semantic heading and accessible dialog with title text', () => {
    render(<Popup {...getProps()} />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Some Title',
    });
    const popup = screen.getByRole('dialog', { name: 'Some Title' });

    expect(heading).toBeInTheDocument();
    expect(popup).toBeInTheDocument();
    expect(popup).toHaveClass('Popup');
    expect(heading).toHaveClass('Popup-Title');
  });

  it('should apply BEM block and modifier classes to dialog and title', () => {
    render(
      <Popup
        {...getProps({
          block: 'CustomModal',
          modifiers: ['Popup_size_large'],
        })}
      />,
    );

    const popup = screen.getByRole('dialog', { name: 'Some Title' });
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Some Title',
    });

    expect(popup).toHaveClass('Popup', 'CustomModal', 'Popup_size_large');
    expect(heading).toHaveClass('Popup-Title', 'CustomModal-Title');
  });

  it('should call showModal when isShown is true and close when isShown is false', () => {
    const { rerender } = render(<Popup {...getProps({ isShown: true })} />);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();

    rerender(<Popup {...getProps({ isShown: false })} />);

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('should assign the dialog element to externalRef', () => {
    const externalRef: RefObject<HTMLDialogElement | null> = createRef();

    render(<Popup {...getProps({ externalRef })} />);

    const popup = screen.getByRole('dialog', { name: 'Some Title' });

    expect(externalRef.current).toBe(popup);
  });

  it('should call onClose callback when the dialog fires a close event', () => {
    const onCloseMock = jest.fn();
    render(<Popup {...getProps({ onClose: onCloseMock })} />);

    const popup = screen.getByRole('dialog', { name: 'Some Title' });
    fireEvent(popup, new Event('close'));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
