/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import AppbarBlockItem from './AppbarBlockItem';
import AppbarItemNoInner from './AppbarItemNoInner';
import AppbarListItem from './AppbarListItem';

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
  let outerClassName;

  if (typeof className === 'string') {
    // If there's no "appbar-item" class in the string.
    if (!/(.* +)?(appbar-item)( +.*)?/.test(className)) {
      // Trim in case an empty string is passed.
      outerClassName = `appbar-item ${className}`.trimEnd();
    } else {
      outerClassName = className;
    }
  } else {
    throw new TypeError('`className` must be a string!');
  }

  if (Array.isArray(modifiers)) {
    // Trim in case leading or trailing spaces appear
    outerClassName = `${outerClassName} ${modifiers.join(' ')}`.trim();
  } else {
    throw new TypeError('`modifiers` must be an array!');
  }

  if (hasInner) {
    // The inner element's class name construction.
    let innerClassName = 'appbar-item__inner';

    if (action !== null) {
      innerClassName = `${innerClassName} appbar-item__inner_action`.trim();

      if (canBeActivated && isActive) {
        innerClassName = `${innerClassName} appbar-item__inner_active`.trim();
      }
    }

    if (Array.isArray(innerModifiers)) {
      if (innerModifiers.length > 0) {
        innerClassName = `${innerClassName} ${innerModifiers.join(' ')}`.trim();
      }
    } else {
      throw new TypeError('`innerModifiers` must be an array!');
    }

    // If the outer element is a list item.
    if (isListItem) {
      return (
        <AppbarListItem
          action={action}
          alt={alt}
          attributes={attributes}
          className={outerClassName}
          iconModifiers={iconModifiers}
          iconSrc={iconSrc}
          innerAttributes={innerAttributes}
          innerClassName={innerClassName}
          onBlur={onBlur}
          onClick={action}
          onKeyDown={onKeyDown}
        />
      );
    }

    // If the outer element is a div.
    return (
      <AppbarBlockItem
        action={action}
        alt={alt}
        attributes={attributes}
        className={outerClassName}
        iconModifiers={iconModifiers}
        iconSrc={iconSrc}
        innerAttributes={innerAttributes}
        innerClassName={innerClassName}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    );
  }

  // If there's no inner/outer element, only an element and an icon.
  const noInnerClassName =
    `${outerClassName} appbar-item_no-inner ${action !== null ? 'appbar-item_action' : ' '}${canBeActivated && isActive ? 'appbar-item_active' : ''}`.trim();

  return (
    <AppbarItemNoInner
      action={action}
      alt={alt}
      attributes={{ ...attributes, ...innerAttributes }}
      className={noInnerClassName}
      iconModifiers={iconModifiers}
      iconSrc={iconSrc}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}
