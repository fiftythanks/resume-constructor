import type {
  MouseEventHandler,
  ReactNode,
  RefCallback,
  RefObject,
} from 'react';

import { clsx } from 'clsx';
import type { ReadonlyDeep } from 'type-fest';

import './MyComponent.scss';

import type { ReadonlyExcept } from '@/types/ReadonlyExcept';

export interface MyComponentProps {
  children?: ReactNode;
  className?: string;
  elements?: string | string[];
  id?: string;
  modifiers?: string | string[];
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ref?: RefCallback<HTMLButtonElement> | RefObject<HTMLButtonElement | null>;
}

// Default props type uses ReadonlyDeep.
// Use ReadonlyExcept only when excepting un-deepened props like ref:
type ReadonlyMyComponentProps = ReadonlyExcept<MyComponentProps, 'ref'>;

/**
 * Detailed JSDoc comment explaining component purpose, accessibility behaviour
 * and usage examples.
 */
export default function MyComponent({
  children,
  className,
  elements,
  id,
  modifiers,
  onClick,
  ref,
  ...rest
}: ReadonlyMyComponentProps) {
  const componentClassName = clsx(
    'MyComponent',
    className,
    elements,
    modifiers,
  );

  return (
    <button
      className={componentClassName}
      id={id}
      onClick={onClick}
      ref={ref}
      type="button"
      {...rest}
    >
      {children}
    </button>
  );
}
