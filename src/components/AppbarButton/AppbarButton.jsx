import React from 'react';

import { clsx } from 'clsx/lite';

import Button from '@/components/Button';

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
  const btnClassName = clsx('AppbarButton', className);

  return (
    <Button
      className={btnClassName}
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
    </Button>
  );
}
