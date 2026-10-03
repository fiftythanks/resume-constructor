import { useRef } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';

import possibleSectionIds from '@/utils/possibleSectionIds';

import type { SectionId } from '@/types/resumeData';
import type { OverrideProperties, ReadonlyDeep } from 'type-fest';

export interface RelevantLastComponent<
  Section extends SectionId,
> extends HTMLButtonElement {
  id: 'delete-all' | 'fill-all' | 'preview' | 'toolbar-toggle' | Section;
}

function isRelevantLastComponent<Section extends SectionId>(
  component: Element | null,
): component is RelevantLastComponent<Section> {
  return (
    component instanceof HTMLButtonElement &&
    (possibleSectionIds.includes(component.id as SectionId) ||
      component.id === 'preview' ||
      component.id === 'delete-all' ||
      component.id === 'fill-all' ||
      component.id === 'toolbar-toggle')
  );
}

export interface RelevantFocusEvent<
  Section extends SectionId,
> extends FocusEvent<RelevantLastComponent<Section>> {
  nativeEvent: OverrideProperties<
    FocusEvent<RelevantLastComponent<Section>>['nativeEvent'],
    { type: 'focusin' }
  >;
  relatedTarget: RelevantLastComponent<Section>;
}

function isRelevantFocusEvent<Section extends SectionId>(
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

/**
 * FIXME: Captures the component only when the focus moves to the first tabbable
 * element, while the logic is actually that it doesn't matter where focus moves
 * inside the tabpanel as soon as it moves into the tabpanel.
 */
/**
 * FIXME: Doesn't capture the navbar toggle button or anything at all on the
 * navbar side.
 */
/**
 * Captures the last component that had focus before it moved to the tabpanel.
 * Returns to that component when `Shift+Tab` is pressed while focused on the
 * first tabbable element of the tabpanel.
 *
 * @returns captureLastComponentBeforeTabpanel Function that must be passed to
 * the first tabbable component as a "focus" event handler.
 * @returns focusLastComponentBeforeTabpanel Function that must be passed to
 * the first tabbable component as a "keydown" event handler.
 */
function useLastComponentBeforeTabpanel(sectionId: SectionId): ReadonlyDeep<{
  captureLastComponentBeforeTabpanel: HandleFocus;
  focusLastComponentBeforeTabpanel: HandleKeyboard;
}> {
  const lastComponent = useRef<RelevantLastComponent<typeof sectionId>>(null);

  const captureLastComponentBeforeTabpanel: HandleFocus = (e) => {
    if (!isRelevantFocusEvent<typeof sectionId>(e)) return;

    lastComponent.current = e.relatedTarget;
  };

  function isRelevantKeyboardEvent(
    e: KeyboardEvent,
  ): e is RelevantKeyboardEvent {
    return (
      e.nativeEvent.type === 'keydown' && e.key === 'Tab' && e.shiftKey === true
    );
  }

  const focusLastComponentBeforeTabpanel: HandleKeyboard = (e) => {
    if (
      !isRelevantKeyboardEvent(e) ||
      lastComponent.current === null ||
      // NOTE: We aren't interested in other elements here because the tab with this ID is the only element that needs this handling; the rest handle focus naturally, without such interventions. But I decided to keep track of the rest of relevant elements in any case; who knows where it's going to be useful.
      lastComponent.current.id !== sectionId
    ) {
      return;
    }

    e.preventDefault();
    lastComponent.current.focus();
  };

  return {
    captureLastComponentBeforeTabpanel,
    focusLastComponentBeforeTabpanel,
  };
}

export default useLastComponentBeforeTabpanel;
