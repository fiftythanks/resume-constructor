/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import '@/styles/blocks/toolbar-item.scss';

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
  modifiers = [],
  innerAttributes = {},
  innerModifiers = [],
  iconModifiers = [],
}) {
  // The outer (compared to the inner) element's class name construction.
  let outerClassName = `${className} toolbar-item`;

  if (Array.isArray(modifiers)) {
    if (modifiers.length > 0) {
      outerClassName += ` ${modifiers.join(' ')}`;
    }
  } else {
    throw new TypeError('`modifiers` must be an array!');
  }

  // The icon's class name construction.
  let iconClassName = 'toolbar-item__icon';

  if (Array.isArray(iconModifiers)) {
    if (iconModifiers.length > 0) {
      iconClassName += ` ${iconModifiers.join(' ')}`;
    }
  } else {
    throw new TypeError('`iconModifiers` must be an array!');
  }

  if (hasInner) {
    // The inner element's class name construction.
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

    // If the outer element is a list item.
    if (isListItem) {
      return (
        <li className={outerClassName} {...attributes}>
          {action !== null ? (
            <button
              className={innerClassName}
              type="button"
              onClick={action}
              {...innerAttributes}
            >
              <img
                alt={alt}
                className={iconClassName}
                height="25px"
                src={iconSrc}
                width="25px"
              />
            </button>
          ) : (
            <div className={innerModifiers} {...innerAttributes}>
              <img
                alt={alt}
                className={iconClassName}
                height="25px"
                src={iconSrc}
                width="25px"
              />
            </div>
          )}
        </li>
      );
    }

    // If the outer element is a div.
    return (
      <div className={outerClassName} {...attributes}>
        {action !== null ? (
          <button
            className={`toolbar-item__inner toolbar-item__inner_action ${canBeActivated && isActive ? 'toolbar-item__inner_active' : ''}`.trim()}
            type="button"
            onClick={action}
            {...innerAttributes}
          >
            <img
              alt={alt}
              className="toolbar-item__icon"
              height="25px"
              src={iconSrc}
              width="25px"
            />
          </button>
        ) : (
          <div className="toolbar-item__inner" {...innerAttributes}>
            <img
              alt={alt}
              className="toolbar-item__icon"
              height="25px"
              src={iconSrc}
              width="25px"
            />
          </div>
        )}
      </div>
    );
  }

  // If there's no inner/outer element, only an element and an icon.
  const noInnerNoActionClassName =
    `${outerClassName} toolbar-item_no-inner toolbar-item_action ${canBeActivated && isActive ? 'toolbar-item_active' : ''}`.trim();

  return action !== null ? (
    <button
      className={noInnerNoActionClassName}
      type="button"
      onClick={action}
      {...attributes}
    >
      <img
        alt={alt}
        className={iconClassName}
        height="25px"
        src={iconSrc}
        width="25px"
      />
    </button>
  ) : (
    <div className={`${outerClassName} toolbar-item_no-inner`} {...attributes}>
      <img
        alt={alt}
        className={iconClassName}
        height="25px"
        src={iconSrc}
        width="25px"
      />
    </div>
  );
}
