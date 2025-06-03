import React from 'react';

export default function Item({ iconSrc, alt, active = false, action }) {
  const activeClass = active ? 'Item-Btn_active' : '';

  return (
    <li className="Item">
      <button
        type="button"
        className={`Item-Btn ${activeClass}`.trim()}
        onClick={action}
      >
        {/* Random width and height for now. Change later. */}
        <img
          src={iconSrc}
          alt={alt}
          width="45px"
          height="45px"
          className="Item-Icon"
        />
      </button>
    </li>
  );
}
