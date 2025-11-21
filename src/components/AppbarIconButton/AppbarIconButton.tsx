import React from 'react';
import type { ButtonHTMLAttributes, RefObject } from 'react';

import { clsx } from 'clsx';

import './AppbarIconButton.scss';

import type { ReadonlyDeep } from 'type-fest';

export interface AppbarIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  alt: string;
  iconSrc: string;
  ref?: RefObject<HTMLButtonElement | null>;
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
  ref,
  ...rest
}: Pick<AppbarIconButtonProps, 'ref'> &
  ReadonlyDeep<Omit<AppbarIconButtonProps, 'ref'>>) {
  const btnClassName = clsx('AppbarIconButton', className);

  return (
    <button className={btnClassName} ref={ref} type="button" {...rest}>
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
