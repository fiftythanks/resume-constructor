/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import AppbarIcon from './AppbarIcon';

export default function AppbarButton({
  alt,
  className,
  iconModifiers,
  iconSrc,
  onBlur,
  onClick,
  onKeyDown,
  attributes = {},
}) {
  return (
    <button
      className={className}
      type="button"
      onBlur={onBlur}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...attributes}
    >
      <AppbarIcon alt={alt} modifiers={iconModifiers} src={iconSrc} />
    </button>
  );
}
