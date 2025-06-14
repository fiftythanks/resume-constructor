import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import './Popup.scss';

export default function Popup({
  children,
  isShown,
  onClose,
  title,
  block = null,
  modifiers = [],
  id,
}) {
  const ref = useRef(null);

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
      ref={ref}
      onClose={onClose}
    >
      <h2 className={titleClassName} id={`${id}-title`}>
        {title}
      </h2>
      {children}
    </dialog>,
    root,
  );
}
