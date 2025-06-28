/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

export default function AppbarItem({
  alt,
  iconSrc,
  isActive,
  action = null,
  attributes = {},
  canBeActivated = false,
  className = '',
  hasInner = false,
  iconModifiers = [],
  innerAttributes = {},
  innerModifiers = [],
  isListItem = false,
  modifiers = [],
  onBlur = null,
  onKeyDown = null,
}) {
  // The outer (compared to the inner) element's class name construction.
  let outerClassName = `${className} appbar-item`;

  if (Array.isArray(modifiers)) {
    if (modifiers.length > 0) {
      outerClassName += ` ${modifiers.join(' ')}`;
    }
  } else {
    throw new TypeError('`modifiers` must be an array!');
  }

  // The icon's class name construction.
  let iconClassName = 'appbar-item__icon';

  if (Array.isArray(iconModifiers)) {
    if (iconModifiers.length > 0) {
      iconClassName += ` ${iconModifiers.join(' ')}`;
    }
  } else {
    throw new TypeError('`iconModifiers` must be an array!');
  }

  if (hasInner) {
    // The inner element's class name construction.
    let innerClassName = 'appbar-item__inner';

    if (action !== null) {
      innerClassName += ' appbar-item__inner_action';

      if (canBeActivated && isActive) {
        innerClassName += ' appbar-item__inner_active';
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
              onBlur={onBlur}
              onClick={action}
              onKeyDown={onKeyDown}
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
            className={`appbar-item__inner appbar-item__inner_action ${canBeActivated && isActive ? 'appbar-item__inner_active' : ''}`.trim()}
            type="button"
            onBlur={onBlur}
            onClick={action}
            onKeyDown={onKeyDown}
            {...innerAttributes}
          >
            <img
              alt={alt}
              className="appbar-item__icon"
              height="25px"
              src={iconSrc}
              width="25px"
            />
          </button>
        ) : (
          <div className="appbar-item__inner" {...innerAttributes}>
            <img
              alt={alt}
              className="appbar-item__icon"
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
    `${outerClassName} appbar-item_no-inner appbar-item_action ${canBeActivated && isActive ? 'appbar-item_active' : ''}`.trim();

  return action !== null ? (
    <button
      className={noInnerNoActionClassName}
      type="button"
      onBlur={onBlur}
      onClick={action}
      onKeyDown={onKeyDown}
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
    <div className={`${outerClassName} appbar-item_no-inner`} {...attributes}>
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
