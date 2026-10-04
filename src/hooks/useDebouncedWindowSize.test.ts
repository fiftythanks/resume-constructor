import { act, renderHook } from '@testing-library/react';

import useDebouncedWindowSize from './useDebouncedWindowSize';

describe('useDebouncedWindowSize', () => {
  const initialInnerHeight = window.innerHeight;
  const initialInnerWidth = window.innerWidth;
  const initialOuterHeight = window.outerHeight;
  const initialOuterWidth = window.outerWidth;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should return the initial window size on mount', () => {
    const { result } = renderHook(() => useDebouncedWindowSize());

    expect(result.current).toEqual({
      innerHeight: initialInnerHeight,
      innerWidth: initialInnerWidth,
      outerHeight: initialOuterHeight,
      outerWidth: initialOuterWidth,
    });
  });

  it('should not update window size immediately before debounce interval elapses', () => {
    const { result } = renderHook(() => useDebouncedWindowSize());

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
      writable: true,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
      jest.advanceTimersByTime(500);
    });

    expect(result.current.innerWidth).toBe(initialInnerWidth);
  });

  it('should update window size after the debounce delay elapses', () => {
    const { result } = renderHook(() => useDebouncedWindowSize());

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
      writable: true,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.innerWidth).toBe(1024);
  });

  it('should clean up the exact resize listener on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useDebouncedWindowSize());

    const resizeHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'resize',
    )?.[1];

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      resizeHandler,
    );
  });
});
