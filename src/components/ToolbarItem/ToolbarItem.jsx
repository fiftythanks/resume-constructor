/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import '@blocks/toolbar-item.scss';

export default function ToolbarItem({
  iconSrc,
  alt,
  className,
  isActive,
  canBeActivated = false,
  action = null,
  hasInner = false,
  isListItem = false,
  attributes = {},
  innerAttributes = {},
  innerModifiers = [],
  iconModifiers = [],
}) {
  let iconClassName = 'toolbar-item__icon';

  if (Array.isArray(iconModifiers)) {
    if (iconModifiers.length > 0) {
      iconClassName += ` ${iconModifiers.join(' ')}`;
    }
  } else {
    throw new TypeError('`iconModifiers` must be an array!');
  }

  if (hasInner) {
    let innerClassName = 'toolbar-item__inner';

    if (action !== null) {
      innerClassName += ' toolbar-item__inner_action';

      if (canBeActivated && isActive) {
        innerClassName += ' toolbar-item__inner_active';
      }
    }

    if (Array.isArray(innerModifiers)) {
      if (innerModifiers.length > 0) {
        innerClassName += ` ${innerModifiers.join(' ')}`;
      }
    } else {
      throw new TypeError('`innerModifiers` must be an array!');
    }

    if (isListItem) {
      return (
        <li className={`${className} toolbar-item`} {...attributes}>
          {action !== null ? (
            <button
              type="button"
              className={innerClassName}
              onClick={action}
              {...innerAttributes}
            >
              <img
                src={iconSrc}
                alt={alt}
                width="25px"
                height="25px"
                className={iconClassName}
              />
            </button>
          ) : (
            <div className={innerModifiers} {...innerAttributes}>
              <img
                src={iconSrc}
                alt={alt}
                width="25px"
                height="25px"
                className={iconClassName}
              />
            </div>
          )}
        </li>
      );
    }

    return (
      <div className={`${className} toolbar-item`} {...attributes}>
        {action !== null ? (
          <button
            type="button"
            className={`toolbar-item__inner toolbar-item__inner_action ${canBeActivated && isActive ? 'toolbar-item__inner_active' : ''}`.trim()}
            onClick={action}
            {...innerAttributes}
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
          <div className="toolbar-item__inner" {...innerAttributes}>
            <img
              src={iconSrc}
              alt={alt}
              width="25px"
              height="25px"
              className="toolbar-item__icon"
            />
          </div>
        )}
      </div>
    );
  }

  return action !== null ? (
    <button
      type="button"
      className={`${className} toolbar-item toolbar-item_no-inner toolbar-item_action ${canBeActivated && isActive ? 'toolbar-item_active' : ''}`.trim()}
      onClick={action}
      {...attributes}
    >
      <img
        src={iconSrc}
        alt={alt}
        width="25px"
        height="25px"
        className={iconClassName}
      />
    </button>
  ) : (
    <div
      className={`${className} toolbar-item toolbar-item_no-inner`}
      {...attributes}
    >
      <img
        src={iconSrc}
        alt={alt}
        width="25px"
        height="25px"
        className={iconClassName}
      />
    </div>
  );
}
