/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import AppbarIcon from '@/components/AppbarIcon';

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
      <AppbarIcon alt={alt} src={iconSrc} />
    </button>
  );
}
