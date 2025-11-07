import React, { ReactNode, RefObject, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { clsx } from 'clsx';

import './Popup.scss';

export interface PopupProps {
  block?: string;
  children: ReactNode;
  externalRef?: RefObject<HTMLDialogElement | null>;
  id: string;
  isShown: boolean;
  modifiers?: string[];
  onClose: () => void;
  title: string;
}

export default function Popup({
  block,
  children,
  externalRef,
  id,
  isShown,
  modifiers,
  title,
  onClose,
}: PopupProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const { current: node } = ref;

    if (node !== null) {
      if (isShown) {
        node.showModal();
      } else {
        node.close();
      }
    }
  }, [isShown]);

  const root = document.getElementById('popup-root')!;
  const popupClassName = clsx('Popup', block, modifiers);
  const titleClassName = clsx('Popup-Title', block && `${block}-Title`);

  return createPortal(
    <dialog
      aria-labelledby={`${id}-title`}
      className={popupClassName}
      id={id}
      onClose={onClose}
      ref={(node) => {
        ref.current = node;
        if (externalRef !== undefined) externalRef.current = node;
      }}
    >
      <h2 className={titleClassName} id={`${id}-title`}>
        {title}
      </h2>
      {children}
    </dialog>,
    root,
  );
}
