import React from 'react';

import './AppbarIcon.scss';

export default function AppbarIcon({ alt, src, className }) {
  let iconClassName = 'AppbarIcon';

  if (className !== undefined) {
    if (typeof className === 'string') {
      iconClassName += ` ${className}`;
    } else {
      throw new TypeError('`className` must be a string!');
    }
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
