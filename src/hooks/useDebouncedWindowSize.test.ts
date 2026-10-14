import { renderHook } from 'vitest-browser-react';

import useDebouncedWindowSize from './useDebouncedWindowSize';

vi.useFakeTimers();

describe('useDebouncedWindowSize', () => {
  const initialInnerHeight = window.innerHeight;
  const initialInnerWidth = window.innerWidth;
  const initialOuterHeight = window.outerHeight;
  const initialOuterWidth = window.outerWidth;

  it('should return the initial window size on mount', async () => {
    const { result } = await renderHook(() => useDebouncedWindowSize());

    expect(result.current.innerHeight).toBe(initialInnerHeight);
    expect(result.current.innerWidth).toBe(initialInnerWidth);
    expect(result.current.outerHeight).toBe(initialOuterHeight);
    expect(result.current.outerWidth).toBe(initialOuterWidth);
  });

  it('should update the window size after a debounced resize', async () => {
    const { act, result } = await renderHook(() => useDebouncedWindowSize());

    await act(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
        writable: true,
      });

      window.dispatchEvent(new Event('resize'));
    });

    // The state shouldn't have been called yet because of the debounce.
    expect(result.current.innerWidth).toBe(initialInnerWidth);

    await act(() => {
      vi.runAllTimers();
    });

    expect(result.current.innerWidth).toBe(1024);
  });

  it('should clean up the event listener on unmount', async () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = await renderHook(() => useDebouncedWindowSize());

    await unmount();

    expect(spy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
