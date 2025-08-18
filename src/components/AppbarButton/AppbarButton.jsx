/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import './AppbarButton.scss';

export default function AppbarButton({
  active,
  alt,
  canBeActivated,
  className,
  iconSrc,
  onBlur,
  onClick,
  onKeyDown,
  attributes = {},
}) {
  return (
    <button
      className={`AppbarButton AppbarButton_action${canBeActivated && active ? ' AppbarButton_active' : ''} ${className}`.trimEnd()}
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
