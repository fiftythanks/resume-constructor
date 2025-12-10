import React from 'react';
import type {
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
  RefCallback,
  RefObject,
} from 'react';

import { clsx } from 'clsx';

import './Button.scss';

import type { ReadonlyExcept } from '@/types/ReadonlyExcept';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  elements?: string | string[];
  modifiers?: string | string[];
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ref?: RefCallback<HTMLButtonElement> | RefObject<HTMLButtonElement | null>;
}

type ReadonlyButtonProps = ReadonlyExcept<ButtonProps, 'ref'>;

/**
 * A generic, reusable button component that accepts all standard HTML button
 * attributes.
 *
 * The accessible name is determined by the `children` prop, but can be
 * overridden for screen readers by the `aria-label` attribute.
 *
 * @example
 * <Button
 *   aria-label="Submit Form"
 *   modifiers="Button_primary"
 *   onClick={handleClick}
 *   type="submit"
 * >
 *   Submit
 * </Button>
 */
export default function Button({
  children,
  className,
  elements,
  modifiers,
  type = 'button',
  ...rest
}: ReadonlyButtonProps) {
  const btnClassName = clsx('Button', className, elements, modifiers);

  return (
    <button className={btnClassName} type={type} {...rest}>
      {children}
    </button>
  );
}
