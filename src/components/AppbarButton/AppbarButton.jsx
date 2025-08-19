/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import './AppbarButton.scss';

export default function AppbarButton({
  alt,
  className,
  iconSrc,
  onBlur,
  onClick,
  onKeyDown,
  attributes = {},
}) {
  if (alt === undefined) {
    throw new ReferenceError('`alt` must be provided!');
  }

  if (iconSrc === undefined) {
    throw new ReferenceError('`iconSrc` must be provided!');
  }

  return (
    <button
      className={`AppbarButton AppbarButton_action ${className}`.trimEnd()}
      type="button"
      onBlur={onBlur}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...attributes}
    >
      <img
        alt={alt}
        className="AppbarButton-Icon"
        height="25px"
        src={iconSrc}
        width="25px"
      />
    </button>
  );
}
