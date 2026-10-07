import type { ButtonHTMLAttributes, Ref } from 'react';

import { clsx } from 'clsx';

import type { ReadonlyDeep } from 'type-fest';

import './AppbarIconButton.scss';

export interface AppbarIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  // TODO: Probably unnecessary prop. Delete it.
  alt?: string;
  iconSrc: string;
  // Right now, it's only used for the double chevrons on the navbar toggle btn.
  largeIcon?: boolean;
  ref?: Ref<HTMLButtonElement>;
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
  className = '',
  iconSrc,
  largeIcon = false,
  ref,
  ...rest
}: Pick<AppbarIconButtonProps, 'ref'> &
  ReadonlyDeep<Omit<AppbarIconButtonProps, 'ref'>>) {
  const btnClassName = clsx('AppbarIconButton', className);

  return (
    // TODO: Make it `Button`.
    <button className={btnClassName} ref={ref} type="button" {...rest}>
      <img
        alt={alt}
        height="25px"
        src={iconSrc}
        width="25px"
        className={clsx(
          'AppbarIconButton-Icon',
          largeIcon && 'AppbarIconButton-Icon_large',
        )}
      />
    </button>
  );
}
