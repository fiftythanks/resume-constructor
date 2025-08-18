import React from 'react';

export default function AppbarIcon({
  alt,
  src,
  className = 'appbar-item__icon',
  modifiers = [],
}) {
  let iconClassName;

  if (typeof className === 'string') {
    // If there's no `appbar-item__icon` class in the string.
    if (!/(.* +)?(appbar-item__icon)( +.*)?/.test(className)) {
      // Trim in case an empty string is passed.
      iconClassName = `appbar-item__icon ${className}`.trimEnd();
    } else {
      iconClassName = className;
    }
  } else {
    throw new TypeError('`className` must be a string!');
  }

  if (Array.isArray(modifiers)) {
    iconClassName += ` ${modifiers.join(' ')}`;
  } else {
    throw new TypeError('`modifiers` must be an array!');
  }

  return (
    <img
      alt={alt}
      className={iconClassName}
      height="25px"
      src={src}
      width="25px"
    />
  );
}
