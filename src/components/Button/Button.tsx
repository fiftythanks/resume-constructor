import React, { ButtonHTMLAttributes } from 'react';

import { clsx } from 'clsx/lite';

import './Button.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  elements?: string[];
  isSubmit?: boolean;
  label?: string;
  modifiers?: string[];
}

/**
 * A generic, reusable button component that accepts all standard HTML button
 * attributes.
 *
 * The accessible name is determined by the `children` prop, but can be
 * overridden for screen readers by the `label` prop or `aria-label` attribute.
 *
 * @param elements BEM-element class names.
 * @param modifiers BEM-modifier class names.
 */
export default function Button({
  children,
  className,
  elements,
  id,
  isSubmit,
  label,
  modifiers,
  onClick,
  ...rest
}: ButtonProps) {
  const btnClassName = clsx('Button', className, elements, modifiers);

  return (
    <button
      aria-label={label}
      className={btnClassName}
      id={id}
      type={isSubmit ? 'submit' : 'button'}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
