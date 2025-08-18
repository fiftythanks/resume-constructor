/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import AppbarIcon from './AppbarIcon';

export default function AppbarBlock({
  alt,
  className,
  iconModifiers,
  iconSrc,
  attributes = {},
}) {
  return (
    <div className={className} {...attributes}>
      <AppbarIcon alt={alt} modifiers={iconModifiers} src={iconSrc} />
    </div>
  );
}
