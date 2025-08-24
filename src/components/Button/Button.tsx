import React, { ButtonHTMLAttributes } from 'react';

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
  let btnClassName = 'Button';

  if (className) btnClassName += ` ${className}`;

  // Add BEM element classes
  if (elements) {
    btnClassName += ` ${elements.join(' ')}`;
  }

  // Add BEM modifier classes
  if (modifiers) {
    btnClassName += ` ${modifiers.join(' ')}`;
  }
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
