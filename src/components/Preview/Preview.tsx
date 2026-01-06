import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Font, PDFDownloadLink, usePDF } from '@react-pdf/renderer';
// FIXME: fix the types issue. `pdfjs-dist` comes with proper types. You should figure out how to use them.
import * as pdfjsLib from 'pdfjs-dist/webpack';

import useDebouncedWindowSize from '@/hooks/useDebouncedWindowSize';

import Button from '@/components/Button';
import Popup from '@/components/Popup';

import ResumeDocument from './ResumeDocument';

import closeSrc from '@/assets/icons/cross.svg';

import './Preview.scss';

import type { ResumeData, SectionId } from '@/types/resumeData';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import type { ReadonlyDeep } from 'type-fest';

// TODO: clean up in the component.
// TODO: announce the document (or error/loading) to screen readers.
// FIXME: when I add a bullet point (at least in Education), this error throws, `pdf.mjs:10835  GET blob:http://localhost:8080/c7c3ed6c-cc3f-44c8-98be-a9bdc83909c8 net::ERR_FILE_NOT_FOUND`.

// Setting worker path to worker bundle.
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../dist/pdf.worker.bundle.js';

// It's how the aspect ratio is defined in the `react-pdf` library.
// https://github.com/diegomura/react-pdf/blob/ee5c96b80326ba4441b71be4c7a85ba9f61d4174/packages/layout/src/page/getSize.ts
const A4_ASPECT_RATIO = 595.28 / 841.89;

export interface PreviewProps {
  activeSectionIds: SectionId[];
  data: ResumeData;
  isShown: boolean;
  onClose: () => void;
}

/**
 * A resume preview dialog that renders the PDF document on a canvas.
 */
export default function Preview({
  activeSectionIds,
  data,
  isShown,
  onClose,
}: ReadonlyDeep<PreviewProps>) {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);
  const [numPages, setNumPages] = useState(0);
  const popupRef = useRef<HTMLDialogElement | null>(null);
  const { innerWidth: viewportWidth } = useDebouncedWindowSize();

  // 1-based indices. (Not my choice, it's how the API works.)
  const [openedPageIndex, setOpenedPageIndex] = useState(1);

  const canvasCallbackRef = useCallback((node: HTMLCanvasElement) => {
    setCanvasNode(node);
  }, []);

  /**
   * If we don't load fonts manually, the first time resume is rendered, its
   * content will use incorrect fonts.
   */
  const [areFontsLoaded, setAreFontsLoaded] = useState(false);

  useEffect(() => {
    const normal = Font.load({
      fontFamily: 'EBGaramond',
      fontStyle: 'normal',
      fontWeight: 'normal',
    });

    const normalBold = Font.load({
      fontFamily: 'EBGaramond',
      fontStyle: 'normal',
      fontWeight: 'bold',
    });

    const italic = Font.load({
      fontFamily: 'EBGaramond',
      fontStyle: 'italic',
      fontWeight: 'normal',
    });

    Promise.all([normal, normalBold, italic])
      .then(() => setAreFontsLoaded(true))
      .catch((e) => {
        console.error(e);

        // Setting to true so we still get a PDF, at least with wrong fonts.
        setAreFontsLoaded(true);
      });
  }, []);

  // Initialised with an empty instance (`instance.url === null`).
  const [instance, updateInstance] = usePDF();

  // ? Messy... Is there a way to make it cleaner?
  // Prevent `usePDF` from creating a new PDF on every re-render.
  const document = useMemo(() => {
    // Don't define `document` until fonts are loaded.
    if (!areFontsLoaded) {
      return undefined;
    }

    return <ResumeDocument activeSectionIds={activeSectionIds} data={data} />;
  }, [activeSectionIds, areFontsLoaded, data]);

  // As soon as `document` is defined, create the PDF instance.
  useEffect(() => {
    if (document === undefined) return;

    updateInstance(document);
  }, [document, updateInstance]);

  // ? Does the canvas need debouncing? It was needed when there was an actual embedded PDF, but now? Canvas can itself resize properly, you just need to apply CSS, right?
  /**
   * This one is for changing the size of the canvas to always keep it A4 when
   * the browser window is resized.
   */
  useLayoutEffect(() => {
    if (!isShown || popupRef.current === null) {
      return;
    }

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
  }, [isShown, viewportWidth]);

  // And this one is for rendering the document with `pdf.js`.
  useEffect(() => {
    if (instance.blob === null || canvasNode === null) return;

    let isCancelled = false;
    let renderTask: null | RenderTask = null;

    async function loadAndRender() {
      let pdf: PDFDocumentProxy;
      let page: PDFPageProxy;

      try {
        pdf = await pdfjsLib.getDocument(instance.url).promise;

        if (isCancelled) return;

        setNumPages(pdf.numPages);
      } catch (e) {
        console.error(e);
        return;
      }

      try {
        page = await pdf.getPage(openedPageIndex);

        if (isCancelled) return;
      } catch (e) {
        console.error(e);
        return;
      }

      // Don't proceed if the canvas has disappeared for some reason.
      if (canvasNode === null) {
        return;
      }

      const viewport = page.getViewport({ scale: 2.0 });

      canvasNode.width = viewport.width;
      canvasNode.height = viewport.height;
      canvasNode.style.width = '100%';
      canvasNode.style.height = '100%';

      try {
        renderTask = page.render({
          canvas: null,
          canvasContext: canvasNode.getContext('2d')!,
          viewport,
        });

        await renderTask.promise;
      } catch (e) {
        console.error(e);
      }
    }

    void loadAndRender();

    return () => {
      isCancelled = true;

      if (renderTask === null) {
        return;
      }

      renderTask.cancel();
    };
  }, [canvasNode, instance.blob, instance.url, openedPageIndex]);

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
      {document === undefined ||
      !areFontsLoaded ||
      instance.url === null ? null : (
        <>
          <div className="Preview-ActionBtns">
            {openedPageIndex > 1 && (
              <Button
                // FIXME: there's no such class. There's only `Preview-ActionBtns`, but will this class apply to `Button` when it's in the `Preview`'s stylesheet? Figure out and fix.
                className="Preview-ActionBtn"
                onClick={() => setOpenedPageIndex(openedPageIndex - 1)}
              >
                Previous Page
              </Button>
            )}
            <PDFDownloadLink document={document} fileName="Resume.pdf">
              {({ loading, error }) => {
                if (loading) return null;
                // TODO: don't throw. Just log the error and return `null`.
                if (error) throw error;
                return (
                  <Button modifiers={['Button_paddingInline_medium']}>
                    Download
                  </Button>
                );
              }}
            </PDFDownloadLink>
            {numPages > openedPageIndex && (
              <Button
                // FIXME: there's no such class. There's only `Preview-ActionBtns`, but will this class apply to `Button` when it's in the `Preview`'s stylesheet? Figure out and fix.
                className="Preview-ActionBtn"
                onClick={() => setOpenedPageIndex(openedPageIndex + 1)}
              >
                Next Page
              </Button>
            )}
          </div>
          <div className="Preview-CanvasContainer">
            {/* FIXME: What if both `loading` and `error` are `true`? What if they are true, yet the document has loaded? */}
            {instance.loading && (
              <p className="Preview-PdfTextAlt">Loading...</p>
            )}

            {instance.error && (
              <p className="Preview-PdfTextAlt">
                Something went wrong. Try reloading the page.
              </p>
            )}

            <div style={{ width: canvasSize.width, height: canvasSize.height }}>
              <canvas data-testid="preview-canvas" ref={canvasCallbackRef} />
            </div>
          </div>
          <div className="Preview-ActionBtns">
            {openedPageIndex > 1 && (
              <Button
                // FIXME: there's no such class. There's only `Preview-ActionBtns`, but will this class apply to `Button` when it's in the `Preview`'s stylesheet? Figure out and fix.
                className="Preview-ActionBtn"
                onClick={() => setOpenedPageIndex(openedPageIndex - 1)}
              >
                Previous Page
              </Button>
            )}
            <PDFDownloadLink document={document} fileName="Resume.pdf">
              {({ loading, error }) => {
                //? Does it render nothing in this case, or does it render an anchor tag anyway?
                if (loading) return null;
                // TODO: don't throw. Just log the error and return `null`.
                if (error) throw error;

                return (
                  <Button modifiers={['Button_paddingInline_medium']}>
                    Download
                  </Button>
                );
              }}
            </PDFDownloadLink>
            {numPages > openedPageIndex && (
              <Button
                // FIXME: there's no such class. There's only `Preview-ActionBtns`, but will this class apply to `Button` when it's in the `Preview`'s stylesheet? Figure out and fix.
                className="Preview-ActionBtn"
                onClick={() => setOpenedPageIndex(openedPageIndex + 1)}
              >
                Next Page
              </Button>
            )}
          </div>
        </>
      )}
    </Popup>
  );
}
