import React, { ButtonHTMLAttributes, MouseEventHandler } from 'react';

import { clsx } from 'clsx/lite';

import './AppbarButton.scss';

interface AppbarButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  alt: string;
  iconSrc: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
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
export default function AppbarButton({
  alt,
  className,
  iconSrc,
  ...rest
}: AppbarButtonProps) {
  const btnClassName = clsx('AppbarButton', className);

  return (
    <button className={btnClassName} type="button" {...rest}>
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
