/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import '@blocks/toolbar-item.scss';

export default function NavItem({
  iconSrc,
  alt,
  className,
  isActive,
  canBeActivated = false,
  action = null,
  hasInner = false,
}) {
  if (hasInner) {
    return (
      <li className={`${className} toolbar-item`}>
        {action !== null ? (
          <button
            type="button"
            className={`toolbar-item__inner toolbar-item__inner_action ${canBeActivated && isActive ? 'toolbar-item__inner_active' : ''}`.trim()}
            onClick={action}
          >
            <img
              src={iconSrc}
              alt={alt}
              width="25px"
              height="25px"
              className="toolbar-item__icon"
            />
          </button>
        ) : (
          <div className="toolbar-item__inner">
            <img
              src={iconSrc}
              alt={alt}
              width="25px"
              height="25px"
              className="toolbar-item__icon"
            />
          </div>
        )}
      </li>
    );
  }

  return action !== null ? (
    <button
      type="button"
      className={`${className} toolbar-item toolbar-item_no-inner toolbar-item_action ${canBeActivated && isActive ? 'toolbar-item_active' : ''}`.trim()}
      onClick={action}
    >
      <img
        src={iconSrc}
        alt={alt}
        width="25px"
        height="25px"
        className="toolbar-item__icon"
      />
    </button>
  ) : (
    <div className={`${className} toolbar-item toolbar-item_no-inner`}>
      <img
        src={iconSrc}
        alt={alt}
        width="25px"
        height="25px"
        className="toolbar-item__icon"
      />
    </div>
  );
}
