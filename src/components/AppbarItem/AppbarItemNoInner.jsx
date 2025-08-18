import React from 'react';

import AppbarBlock from './AppbarBlock';
import AppbarButton from './AppbarButton';

export default function AppbarItemNoInner({
  action,
  alt,
  attributes,
  className,
  iconModifiers,
  iconSrc,
  onBlur,
  onKeyDown,
}) {
  return action !== null ? (
    <AppbarButton
      alt={alt}
      attributes={attributes}
      className={className}
      iconModifiers={iconModifiers}
      iconSrc={iconSrc}
      onBlur={onBlur}
      onClick={action}
      onKeyDown={onKeyDown}
    />
  ) : (
    <AppbarBlock
      alt={alt}
      attributes={attributes}
      className={className}
      iconModifiers={iconModifiers}
      iconSrc={iconSrc}
    />
  );
}
