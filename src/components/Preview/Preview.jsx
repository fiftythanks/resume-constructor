import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { usePDF } from '@react-pdf/renderer';
import * as pdfjsLib from 'pdfjs-dist/webpack';

import useDebouncedWindowSize from '@/hooks/useDebouncedWindowSize';

import Button from '@/components/Button';
import Popup from '@/components/Popup';

import ResumeDocument from './ResumeDocument';

import closeSrc from '@/assets/icons/cross.svg';

import './Preview.scss';

// Setting worker path to worker bundle.
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../dist/pdf.worker.bundle.js';

// TODO: add "Next Page" and "Previeous Page" buttons.
// TODO: add a download button.
// TODO: clean up in the component.
// TODO (application-wide): either use different states for the live preview and this preview, or somehow make this preview not update every time state updates, since it changes on every keystroke, and it slows the app down significantly.
// FIXME: when I add a bullet point (at least in Education), this error throws, `pdf.mjs:10835  GET blob:http://localhost:8080/c7c3ed6c-cc3f-44c8-98be-a9bdc83909c8 net::ERR_FILE_NOT_FOUND`.

// It's how the aspect ratio is defined in the `react-pdf` library.
// https://github.com/diegomura/react-pdf/blob/ee5c96b80326ba4441b71be4c7a85ba9f61d4174/packages/layout/src/page/getSize.ts
const A4_ASPECT_RATIO = 595.28 / 841.89;

export default function Preview({ activeSectionIDs, data, isShown, onClose }) {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [canvasNode, setCanvasNode] = useState(null);
  const [numPages, setNumPages] = useState(0);
  // 1-based indices.
  const [openedPageIndex, setOpenedPageIndex] = useState(1);
  const popupRef = useRef(null);
  const viewportWidth = useDebouncedWindowSize().innerWidth;

  const canvasCallbackRef = useCallback((node) => {
    if (node !== null) {
      setCanvasNode(node);
    }
  }, []);

  // ? Messy... Is there a way to make it cleaner?
  const document = useMemo(
    () => <ResumeDocument activeSectionIDs={activeSectionIDs} data={data} />,
    [activeSectionIDs, data],
  );

  const [instance, updateInstance] = usePDF({ document });

  useEffect(() => {
    updateInstance(document);
  }, [document, updateInstance]);

  /**
   * This one is for changing the size of the canvas to always keep it A4 when
   * the browser window is resized.
   */
  useLayoutEffect(() => {
    if (isShown && popupRef.current !== null) {
      // Inline padding of the modal. Defined in `Preview.scss`.
      const paddingInline = parseFloat(
        getComputedStyle(popupRef.current).paddingInline,
      );
      const width = viewportWidth - 2 * paddingInline;

      // ? Why is it a state? Does it need to be a state?
      /**
       * Width is calculated automatically. It simply takes up as much space as
       * it can. This is desired. This line calculates what height the canvas
       * should be to preserve the A4 paper aspect ratio in portrait mode.
       */
      setCanvasSize({ width, height: width / A4_ASPECT_RATIO });
    }
  }, [isShown, viewportWidth]);

  // And this one is for rendering the document with `pdf.js`.
  useEffect(() => {
    if (instance.url === null || canvasNode === null) return undefined;

    let isCancelled = false;
    let renderTask = null;

    async function loadAndRender() {
      try {
        const pdf = await pdfjsLib.getDocument(instance.url).promise;
        if (isCancelled) return undefined;

        setNumPages(pdf.numPages);

        const page = await pdf.getPage(openedPageIndex);
        if (isCancelled) return undefined;

        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = canvasNode;
        const canvasContext = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        renderTask = page.render({ canvasContext, viewport });
        await renderTask.promise;

        return undefined;
      } catch (e) {
        return undefined;
      }
    }

    loadAndRender();

    return () => {
      isCancelled = true;
      renderTask?.cancel();
    };
  }, [canvasNode, instance, openedPageIndex]);

  return (
    <Popup
      block="Preview"
      externalRef={popupRef}
      id="preview-modal"
      isShown={isShown}
      title="Preview"
      onClose={onClose}
    >
      <button className="Preview-CloseBtn" type="button" onClick={onClose}>
        <img alt="Close Popup" height="32px" src={closeSrc} width="32px" />
      </button>
      <div className="Preview-NavBtns">
        {openedPageIndex > 1 && (
          <Button
            className="Preview-NavBtn"
            onClick={() => setOpenedPageIndex(openedPageIndex - 1)}
          >
            Previous Page
          </Button>
        )}
        {numPages > openedPageIndex && (
          <Button
            className="Preview-NavBtn"
            onClick={() => setOpenedPageIndex(openedPageIndex + 1)}
          >
            Next Page
          </Button>
        )}
      </div>
      <div className="Preview-CanvasContainer">
        {instance.loading && (
          // TODO: add styling.
          <p>Loading...</p>
        )}

        {instance.error && (
          // TODO: add styling.
          <p>Something went wrong. Try reloading the page.</p>
        )}

        <div style={{ width: canvasSize.width, height: canvasSize.height }}>
          <canvas ref={canvasCallbackRef} />
        </div>
      </div>
      <div className="Preview-NavBtns">
        {openedPageIndex > 1 && (
          <Button
            className="Preview-NavBtn"
            onClick={() => setOpenedPageIndex(openedPageIndex - 1)}
          >
            Previous Page
          </Button>
        )}
        {numPages > openedPageIndex && (
          <Button
            className="Preview-NavBtn"
            onClick={() => setOpenedPageIndex(openedPageIndex + 1)}
          >
            Next Page
          </Button>
        )}
      </div>
    </Popup>
  );
}
