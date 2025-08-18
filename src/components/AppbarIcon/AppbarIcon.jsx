import React from 'react';

export default function AppbarIcon({
  alt,
  src,
  className = 'appbar-item__icon',
  modifiers = [],
}) {
  let iconClassName;

  if (className !== 'appbar-item__icon') {
    if (typeof className === 'string') {
      iconClassName = 'appbar-item__icon';
    } else {
      throw new TypeError('`className` must be a string!');
    }
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
