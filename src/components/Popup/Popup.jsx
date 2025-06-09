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
  const root = document.getElementById('popup-root');
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;

    if (isShown) {
      node.showModal();
    } else {
      node.close();
    }
  }, [isShown]);

  let popupClassName = 'Popup';
  let titleClassName = 'Popup-Title';

  if (typeof block === 'string') {
    popupClassName += ` ${block}`;
    titleClassName += ` ${block}-Title`;
  } else if (block !== null) {
    throw new TypeError('`block` must be a string!');
  }

  if (Array.isArray(modifiers)) {
    if (modifiers.length > 0) {
      popupClassName += ` ${modifiers.join(' ')}`;
    }
  } else {
    throw new TypeError('Modifiers must be wrapped in an array!');
  }

  return createPortal(
    <dialog
      className={popupClassName}
      ref={ref}
      onClose={onClose}
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <h2 className={titleClassName} id={`${id}-title`}>
        {title}
      </h2>
      {children}
    </dialog>,
    root,
  );
}
