import React from 'react';

import './AppbarIcon.scss';

export default function AppbarIcon({ alt, src, className, modifiers = [] }) {
  let iconClassName = 'AppbarIcon';

  if (className !== undefined) {
    if (typeof className === 'string') {
      iconClassName += ` ${className}`;
    } else {
      throw new TypeError('`className` must be a string!');
    }
  }

  // TODO: get rid of modifiers, there's no need in them.
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
