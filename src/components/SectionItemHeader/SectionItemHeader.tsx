import { useEffect, useRef } from 'react';
import type { FocusEvent, KeyboardEvent, Ref, RefObject } from 'react';

import type {
  HandleFocus,
  HandleKeyboard,
} from '@/hooks/useLastComponentBeforeTabpanel';

import Button from '@/components/Button';

import addSrc from '@/assets/icons/add-black.svg';
import deleteSrc from '@/assets/icons/delete.svg';
import nextSrc from '@/assets/icons/next.svg';
import prevSrc from '@/assets/icons/prev.svg';

import type { ReadonlyExcept } from '@/types/ReadonlyExcept';

import './SectionItemHeader.scss';

export interface SectionItemHeaderProps {
  addItem: () => void;
  deleteItem: () => void;
  handleFocus?: HandleFocus;
  handleKeyDown?: HandleKeyboard;
  itemName: 'Degree' | 'Job' | 'Project';
  itemNumber: number;
  itemsNumber: number;
  ref?: Ref<HTMLElement>;
  showNextItem: () => void;
  showPreviousItem: () => void;
  updateScreenReaderAnnouncement?: (announcement: string) => void;
}

/**
 * Header used in the Work Experience, Projects and Education sections. Shows
 * the number of the displayed degree, job or project and provides an interface
 * for navigating through items, as well as adding and deleting them.
 *
 * @param addItem Callback for adding a new item.
 * @param deleteItem Callback for deleting the current item.
 * @param handleFocus Function for capturing the component's first tabbable element.
 * @param handleKeyDown Function for moving focus to the last focused component
 * before focus moved into the header, if `Shift+Tab` is pressed.
 * @param itemName Name of the item ("Degree", "Job" or "Project").
 * @param itemNumber 1-based index of the currently displayed item.
 * @param itemsNumber Total count of items.
 * @param ref Reference to the root header element.
 * @param showNextItem Callback for displaying the next item.
 * @param showPreviousItem Callback for displaying the previous item.
 * @param updateScreenReaderAnnouncement Optional callback for announcing status
 * updates to assistive technologies.
 */
export default function SectionItemHeader({
  addItem,
  deleteItem,
  handleFocus,
  handleKeyDown,
  itemName,
  itemNumber,
  itemsNumber,
  ref,
  showNextItem,
  showPreviousItem,
  updateScreenReaderAnnouncement,
}: ReadonlyExcept<SectionItemHeaderProps, 'ref'>) {
  const wasFocusedInside = useRef(false);

  const localHeaderRef = useRef<HTMLElement | null>(null);
  const previousBtnRef = useRef<HTMLButtonElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const deleteBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleHeaderRef = (node: HTMLElement | null) => {
    localHeaderRef.current = node;

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref && 'current' in ref) {
      (ref as RefObject<HTMLElement | null>).current = node;
    }
  };

  /**
   * Tracks pointer interactions outside the header to clear focus retention
   * state when focus is deliberately moved elsewhere.
   */
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!localHeaderRef.current?.contains(e.target as Node)) {
        wasFocusedInside.current = false;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  /**
   * Retains focus on an available control when an active button unmounts
   * during item deletion or boundary navigation.
   */
  useEffect(() => {
    if (!wasFocusedInside.current) {
      return;
    }

    if (!localHeaderRef.current?.isConnected) {
      return;
    }

    const isFocusStillInside = localHeaderRef.current.contains(
      document.activeElement,
    );

    if (!isFocusStillInside) {
      const target =
        previousBtnRef.current ??
        nextBtnRef.current ??
        addBtnRef.current ??
        deleteBtnRef.current;

      if (target) {
        target.focus();
      } else {
        wasFocusedInside.current = false;
      }
    }
  });

  const handleFocusCapture = () => {
    wasFocusedInside.current = true;
  };

  const handleBlurCapture = (e: FocusEvent<HTMLElement>) => {
    if (
      e.relatedTarget instanceof Node &&
      !localHeaderRef.current?.contains(e.relatedTarget)
    ) {
      wasFocusedInside.current = false;
    }
  };

  const handlePrevious = () => {
    showPreviousItem();
    updateScreenReaderAnnouncement?.(`Showing ${itemName} ${itemNumber - 1}`);
  };

  const handleNext = () => {
    showNextItem();
    updateScreenReaderAnnouncement?.(`Showing ${itemName} ${itemNumber + 1}`);
  };

  const handleAdd = () => {
    addItem();
    updateScreenReaderAnnouncement?.(
      `${itemName} ${itemsNumber + 1} was added`,
    );
  };

  const handleDelete = () => {
    deleteItem();
    updateScreenReaderAnnouncement?.(`${itemName} ${itemNumber} was deleted`);
  };

  const handleNextFocus = (e: FocusEvent<HTMLButtonElement>) => {
    if (handleFocus !== undefined && itemNumber === 1) {
      handleFocus(e);
    }
  };

  const handleNextKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (handleKeyDown !== undefined && itemNumber === 1) {
      handleKeyDown(e);
    }
  };

  const handleAddFocus = (e: FocusEvent<HTMLButtonElement>) => {
    if (handleFocus !== undefined && itemsNumber <= 1) {
      handleFocus(e);
    }
  };

  const handleAddKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (handleKeyDown !== undefined && itemsNumber <= 1) {
      handleKeyDown(e);
    }
  };

  return (
    <header
      className="SectionItemHeader"
      data-testid="section-item-header"
      ref={handleHeaderRef}
      onBlurCapture={handleBlurCapture}
      onFocusCapture={handleFocusCapture}
    >
      <h2>
        {itemName} {itemNumber}
      </h2>
      {itemsNumber > 1 && (
        <div className="SectionItemHeader-Navigation">
          {itemNumber > 1 && (
            <Button
              aria-label={`Show Previous ${itemName}`}
              id={`show-previous-${itemName.toLowerCase()}`}
              key="show-previous"
              ref={previousBtnRef}
              onClick={handlePrevious}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              modifiers={[
                'Button_paddingBlock_none',
                'Button_paddingInline_small',
              ]}
            >
              <img alt="Previous" height="25px" src={prevSrc} width="25px" />
            </Button>
          )}
          {itemNumber < itemsNumber && (
            <Button
              aria-label={`Show Next ${itemName}`}
              id={`show-next-${itemName.toLowerCase()}`}
              key="show-next"
              ref={nextBtnRef}
              onClick={handleNext}
              onFocus={handleNextFocus}
              onKeyDown={handleNextKeyDown}
              modifiers={[
                'Button_paddingBlock_none',
                'Button_paddingInline_small',
              ]}
            >
              <img alt="Next" height="25px" src={nextSrc} width="25px" />
            </Button>
          )}
        </div>
      )}
      <Button
        aria-label={`Add ${itemName} ${itemsNumber + 1}`}
        id={`add-${itemName.toLowerCase()}`}
        modifiers={['Button_paddingBlock_none', 'Button_paddingInline_small']}
        ref={addBtnRef}
        onClick={handleAdd}
        onFocus={handleAddFocus}
        onKeyDown={handleAddKeyDown}
      >
        <img alt="Add" height="25px" src={addSrc} width="25px" />
      </Button>
      {itemsNumber > 1 && (
        <button
          aria-label={`Delete ${itemName} ${itemNumber}`}
          className="SectionItemHeader-DeleteBtn"
          id={`delete-${itemName.toLowerCase()}`}
          ref={deleteBtnRef}
          type="button"
          onClick={handleDelete}
        >
          <img alt="Delete" height="25px" src={deleteSrc} width="25px" />
        </button>
      )}
    </header>
  );
}
