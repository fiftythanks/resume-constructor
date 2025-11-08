import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { clsx } from 'clsx';

import type { ReadonlyDeep } from 'type-fest';

import './AppbarIconButton.scss';

export interface AppbarIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  alt: string;
  iconSrc: string;
}

/**
 * A reusable, icon-only button for use in Navbar and Toolbar. It accepts all
 * standard HTML button attributes except for `children`.
 *
 * The `alt` prop is required for the icon's alternative text.
 *
 * The button's accessible name should be provided via the standard
 * `aria-label` attribute.
 *
 * @example
 * <AppbarButton
 *   alt="PDF Document"
 *   aria-label="Open Preview"
 *   iconSrc={src}
 *   onClick={openPreview}
 * />
 */
export default function AppbarIconButton({
  alt,
  className,
  iconSrc,
  ...rest
}: ReadonlyDeep<AppbarIconButtonProps>) {
  const btnClassName = clsx('AppbarIconButton', className);

  return (
    <button className={btnClassName} type="button" {...rest}>
      <img
        alt={alt}
        className="AppbarIconButton-Icon"
        height="25px"
        src={iconSrc}
        width="25px"
      />
    </button>
  );
}
