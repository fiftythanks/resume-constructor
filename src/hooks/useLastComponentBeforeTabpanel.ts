import type { FocusEvent, KeyboardEvent } from 'react';

import possibleSectionIds from '@/utils/possibleSectionIds';

import type { SectionId } from '@/types/resumeData';
import type { OverrideProperties, ReadonlyDeep } from 'type-fest';

export type ToolbarButtonId =
  | 'delete-all'
  | 'fill-all'
  | 'preview'
  | 'toolbar-toggle';

export interface RelevantLastComponent<
  Section extends SectionId = SectionId,
> extends HTMLButtonElement {
  id: Section | ToolbarButtonId;
}

/**
 * Type assertion is required because `possibleSectionIds` is typed as `SectionIds`
 * (`SectionId[]`) and `Array.prototype.includes` restricts its argument to `SectionId`.
 */
function isSectionId(id: string): id is SectionId {
  return possibleSectionIds.includes(id as SectionId);
}

function isRelevantLastComponent<Section extends SectionId = SectionId>(
  component: Element | null,
): component is RelevantLastComponent<Section> {
  return (
    component instanceof HTMLButtonElement &&
    (isSectionId(component.id) ||
      component.id === 'preview' ||
      component.id === 'delete-all' ||
      component.id === 'fill-all' ||
      component.id === 'toolbar-toggle')
  );
}

export interface RelevantFocusEvent<
  Section extends SectionId = SectionId,
> extends FocusEvent<RelevantLastComponent<Section>> {
  nativeEvent: OverrideProperties<
    FocusEvent<RelevantLastComponent<Section>>['nativeEvent'],
    { type: 'focusin' }
  >;
  relatedTarget: RelevantLastComponent<Section>;
}

function isRelevantFocusEvent<Section extends SectionId = SectionId>(
  e: FocusEvent<HTMLElement>,
): e is RelevantFocusEvent<Section> {
  return (
    e.nativeEvent.type === 'focusin' &&
    isRelevantLastComponent<Section>(e.relatedTarget)
  );
}

export interface RelevantKeyboardEvent extends KeyboardEvent {
  key: 'Tab';
  nativeEvent: OverrideProperties<
    KeyboardEvent['nativeEvent'],
    { type: 'keydown' }
  >;
  shiftKey: true;
}

export type HandleFocus = (e: FocusEvent<HTMLElement>) => void;
export type HandleKeyboard = (e: KeyboardEvent) => void;

let lastComponent: null | RelevantLastComponent = null;

/**
 * Resets the tracked last component before the tabpanel.
 * Provided for test cleanup to ensure isolation across test cases.
 */
export function resetLastComponentBeforeTabpanel(): void {
  lastComponent = null;
}

/**
 * Determines whether focus movement represents internal navigation within the
 * active section wrapper, tabpanel or navigation controls.
 */
function isInternalNavigation(element: Element | null): boolean {
  if (!element) {
    return false;
  }

  return (
    element.closest('.AppLayout-SectionWrapper') !== null ||
    element.closest('[role="tabpanel"]') !== null ||
    element.closest('.section') !== null ||
    element.closest('.AppLayout-NavBtns') !== null
  );
}

/**
 * Captures the last component that had focus before it moved to the tabpanel.
 * Returns to that component (or the currently active section tab if focus
 * originated from the navbar) when "Shift+Tab" is pressed while focused on the
 * first tabbable element of the tabpanel.
 *
 * @param sectionId The identifier of the section whose tabpanel is controlled.
 * @returns captureLastComponentBeforeTabpanel Function that must be passed to
 * the first tabbable component as a "focus" event handler.
 * @returns focusLastComponentBeforeTabpanel Function that must be passed to
 * the first tabbable component as a "keydown" event handler.
 */
function useLastComponentBeforeTabpanel(sectionId: SectionId): ReadonlyDeep<{
  captureLastComponentBeforeTabpanel: HandleFocus;
  focusLastComponentBeforeTabpanel: HandleKeyboard;
}> {
  const captureLastComponentBeforeTabpanel: HandleFocus = (e) => {
    if (isRelevantFocusEvent(e)) {
      if (e.relatedTarget.isConnected) {
        lastComponent = e.relatedTarget;
      }
      return;
    }

    if (isInternalNavigation(e.relatedTarget)) {
      return;
    }

    lastComponent = null;
  };

  function isRelevantKeyboardEvent(
    e: KeyboardEvent,
  ): e is RelevantKeyboardEvent {
    return (
      e.nativeEvent.type === 'keydown' && e.key === 'Tab' && e.shiftKey === true
    );
  }

  const focusLastComponentBeforeTabpanel: HandleKeyboard = (e) => {
    if (!isRelevantKeyboardEvent(e) || lastComponent === null) {
      return;
    }

    if (isSectionId(lastComponent.id)) {
      const activeTab = document.getElementById(sectionId);

      if (activeTab && activeTab.isConnected) {
        e.preventDefault();
        activeTab.focus();
      }
      return;
    }
  };

  return {
    captureLastComponentBeforeTabpanel,
    focusLastComponentBeforeTabpanel,
  };
}

export default useLastComponentBeforeTabpanel;
