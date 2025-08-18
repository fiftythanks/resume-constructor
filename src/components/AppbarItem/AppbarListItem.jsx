/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import AppbarBlock from './AppbarBlock';
import AppbarButton from './AppbarButton';

export default function AppbarListItem({
  action,
  alt,
  className,
  iconModifiers,
  iconSrc,
  innerClassName,
  onBlur,
  onKeyDown,
  attributes = {},
  innerAttributes = {},
}) {
  return (
    <li className={className} {...attributes}>
      {action !== null ? (
        <AppbarButton
          alt={alt}
          attributes={innerAttributes}
          className={innerClassName}
          iconModifiers={iconModifiers}
          iconSrc={iconSrc}
          onBlur={onBlur}
          onClick={action}
          onKeyDown={onKeyDown}
        />
      ) : (
        <AppbarBlock
          alt={alt}
          attributes={innerAttributes}
          className={innerClassName}
          iconModifiers={iconModifiers}
          iconSrc={iconSrc}
        />
      )}
    </li>
  );
}
