import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import './Popup.scss';

export default function Popup({ children, isShown, handleClose, title }) {
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

  return createPortal(
    <dialog
      className="Popup"
      ref={ref}
      onClose={handleClose}
      aria-labelledby="popup-title"
    >
      <h2 className="Popup-Title" id="popup-title">
        {title}
      </h2>
      {children}
    </dialog>,
    root,
  );
}
