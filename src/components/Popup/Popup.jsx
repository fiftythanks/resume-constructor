/* eslint-disable no-param-reassign */
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import './Popup.scss';

export default function Popup({
  /**
   * And if you decide it needs refactoring, check all other
   * components for the same pattern and refactor them as well.
   */
  // ? It would probably be better if it were initialized to an empty string. Consider it.
  block = null,
  children,
  externalRef,
  id,
  isShown,
  modifiers = [],
  title,
  onClose,
}) {
  const ref = useRef(null);

  /**
   * Why on earth is `useEffect` here? It can be done easily with just checking
   * `isShown`'s value!
   */
  // TODO: refactor.
  useEffect(() => {
    const node = ref.current;

    if (isShown) {
      node.showModal();
    } else {
      node.close();
    }
  }, [isShown]);

  const root = document.getElementById('popup-root');

  let popupClassName = 'Popup';
  let titleClassName = 'Popup-Title';

  // Add BEM block(s) to the className.
  if (typeof block === 'string') {
    popupClassName += ` ${block}`;
    titleClassName += ` ${block}-Title`;
  } else if (block !== null) {
    throw new TypeError('`block` must be a string!');
  }

  // Add BEM modifier(s) to the className.
  if (Array.isArray(modifiers)) {
    if (modifiers.length > 0) {
      popupClassName += ` ${modifiers.join(' ')}`;
    }
  } else {
    throw new TypeError('Modifiers must be wrapped in an array!');
  }

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
