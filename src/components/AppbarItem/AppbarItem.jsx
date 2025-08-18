/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import AppbarIcon from '@/components/AppbarIcon';

// TODO: identify and get rid of duplicated logic.
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
              <AppbarIcon alt={alt} modifiers={iconModifiers} src={iconSrc} />
            </button>
          ) : (
            <div className={innerClassName} {...innerAttributes}>
              <AppbarIcon alt={alt} modifiers={iconModifiers} src={iconSrc} />
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
            className={innerClassName}
            type="button"
            onBlur={onBlur}
            onClick={action}
            onKeyDown={onKeyDown}
            {...innerAttributes}
          >
            <AppbarIcon alt={alt} modifiers={iconModifiers} src={iconSrc} />
          </button>
        ) : (
          <div className={innerClassName} {...innerAttributes}>
            <AppbarIcon alt={alt} modifiers={iconModifiers} src={iconSrc} />
          </div>
        )}
      </div>
    );
  }

  // If there's no inner/outer element, only an element and an icon.
  const noInnerClassName =
    `${outerClassName} appbar-item_no-inner ${action !== null ? 'appbar-item_action' : ' '}${canBeActivated && isActive ? 'appbar-item_active' : ''}`.trim();

  return action !== null ? (
    <button
      className={noInnerClassName}
      type="button"
      onBlur={onBlur}
      onClick={action}
      onKeyDown={onKeyDown}
      {...attributes}
    >
      <AppbarIcon alt={alt} modifiers={iconModifiers} src={iconSrc} />
    </button>
  ) : (
    <div className={noInnerClassName} {...attributes}>
      <AppbarIcon alt={alt} modifiers={iconModifiers} src={iconSrc} />
    </div>
  );
}
