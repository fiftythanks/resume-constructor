import { act, renderHook } from '@testing-library/react';

import useDebouncedWindowSize from './useDebouncedWindowSize';

jest.useFakeTimers();

// FIXME: what happened? The tests fail.
describe('useDebouncedWindowSize', () => {
  const initialInnerHeight = window.innerHeight;
  const initialInnerWidth = window.innerWidth;
  const initialOuterHeight = window.outerHeight;
  const initialOuterWidth = window.outerWidth;

  it('should return the initial window size on mount', () => {
    const { result } = renderHook(() => useDebouncedWindowSize());

    expect(result.current.innerHeight).toBe(initialInnerHeight);
    expect(result.current.innerWidth).toBe(initialInnerWidth);
    expect(result.current.outerHeight).toBe(initialOuterHeight);
    expect(result.current.outerWidth).toBe(initialOuterWidth);
  });

  it('should update the window size after a debounced resize', async () => {
    const { result } = renderHook(() => useDebouncedWindowSize());

    await act(async () => {
      Object.defineProperty(window, innerWidth, {
        writable: true,
        value: 1024,
      });

      window.dispatchEvent(new Event('resize'));
    });

    // The state shouldn't have been called yet because of the debounce.
    expect(result.current.innerWidth).toBe(initialInnerWidth);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.innerWidth).toBe(1024);
  });

  it('should clean up the event listener on unmount', async () => {
    const spy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useDebouncedWindowSize());

    await act(async () => {
      unmount();
    });

    expect(spy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
