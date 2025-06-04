import React from 'react';
import './NavItem.scss';

export default function NavItem({ iconSrc, alt, isOpened, openSection }) {
  const openedModifier = isOpened ? 'NavItem-Btn_opened' : '';

  return (
    <li className="NavItem">
      <button
        type="button"
        className={`NavItem-Btn ${openedModifier}`.trim()}
        onClick={openSection}
      >
        <img
          src={iconSrc}
          alt={alt}
          width="25px"
          height="25px"
          className="NavItem-Icon"
        />
      </button>
    </li>
  );
}
