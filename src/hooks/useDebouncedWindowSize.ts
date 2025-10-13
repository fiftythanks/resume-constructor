// TODO: move to Preview's folder or delete this hook altogether if it isn't needed.

import { useEffect, useState } from 'react';

const DEBOUNCE_DELAY_MS = 1000;

export default function useDebouncedWindowSize() {
  const [windowSize, setWindowSize] = useState({
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    outerHeight: window.outerHeight,
    outerWidth: window.outerWidth,
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function handleResize() {
      clearTimeout(timer);

      timer = setTimeout(
        () =>
          setWindowSize({
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
            outerHeight: window.outerHeight,
            outerWidth: window.outerWidth,
          }),
        DEBOUNCE_DELAY_MS,
      );
    }

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}
