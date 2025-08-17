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
  if (typeof className === 'string') {
    className = `${className} Button`.trimStart();
  } else {
    throw new TypeError('`className` must be a string!');
  }

  // Add BEM element classes
  if (Array.isArray(elements)) {
    elements.forEach((element) => {
      if (typeof element !== 'string')
        throw new TypeError('Elements must be strings!');
    });

    if (elements.length > 0) {
      className += ` ${elements.join(' ')}`;
    }
  } else {
    throw new TypeError('Elements must be wrapped in an array!');
  }

  // Add BEM modifier classes
  if (Array.isArray(modifiers)) {
    modifiers.forEach((modifier) => {
      if (typeof modifier !== 'string')
        throw new TypeError('Modifiers must be strings!');
    });

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
