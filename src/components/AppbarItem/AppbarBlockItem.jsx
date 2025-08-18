/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import AppbarBlock from './AppbarBlock';
import AppbarButton from './AppbarButton';

export default function AppbarBlockItem({
  action,
  alt,
  attributes,
  className,
  iconModifiers,
  iconSrc,
  innerAttributes,
  innerClassName,
  onBlur,
  onKeyDown,
}) {
  return (
    <div className={className} {...attributes}>
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
    </div>
  );
}
