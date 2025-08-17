/* eslint-disable no-param-reassign */
import React from 'react';

import './Button.scss';

export default function Button({
  children,
  className = '',
  elements = [],
  id = null,
  isDisabled = false,
  isSubmit = false,
  label = null,
  modifiers = [],
  onClick,
}) {
  className = `${className} Button`.trimStart();

  // Add BEM element classes
  if (Array.isArray(elements)) {
    if (elements.length > 0) {
      className += ` ${elements.join(' ')}`;
    }
  } else {
    throw new TypeError('Elements must be wrapped in an array!');
  }

  // Add BEM modifier classes
  if (Array.isArray(modifiers)) {
    if (modifiers.length > 0) {
      className += ` ${modifiers.join(' ')}`;

      // TODO: remove this logic. There's no such modifier in the stylesheet.
      if (!modifiers.includes('_disabled') && isDisabled) {
        className += ' _disabled';
      }
    }
  } else {
    throw new TypeError('Modifiers must be wrapped in an array!');
  }

  return (
    <button
      aria-label={label}
      className={className}
      id={id}
      type={isSubmit ? 'submit' : 'button'}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
