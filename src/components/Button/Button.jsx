import React from 'react';
import './Button.scss';

export default function Button({
  children,
  onClick,
  elements = [],
  modifiers = [],
  isDisabled = false,
  isSubmit = false,
  id = null,
  label = null,
}) {
  let className = 'Button';

  // Add BEM element classes
  if (Array.isArray(elements)) {
    if (elements.length > 0) {
      className += ` ${elements.join(' ')}`;
    }
  } else {
    throw new TypeError('Elements must be provided wrapped in an array!');
  }

  // Add BEM modifier classes
  if (Array.isArray(modifiers)) {
    if (modifiers.length > 0) {
      className += ` ${modifiers.join(' ')}`;

      if (!modifiers.includes('_disabled') && isDisabled) {
        className += ' _disabled';
      }
    }
  } else {
    throw new TypeError('Modifiers must be wrapped in an array!');
  }

  return (
    <button
      type={isSubmit ? 'submit' : 'button'}
      onClick={onClick}
      className={className}
      id={id}
      aria-label={label}
    >
      {children}
    </button>
  );
}
