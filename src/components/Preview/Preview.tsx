import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { PDFDownloadLink, usePDF } from '@react-pdf/renderer';
// FIXME: fix the types issue. `pdfjs-dist` comes with proper types. You should figure out how to use them.
import * as pdfjsLib from 'pdfjs-dist/webpack';

import useDebouncedWindowSize from '@/hooks/useDebouncedWindowSize';

import Button from '@/components/Button';
import Popup from '@/components/Popup';

import ResumeDocument from './ResumeDocument';

import closeSrc from '@/assets/icons/cross.svg';

import './Preview.scss';

import type { ResumeData, SectionId } from '@/types/resumeData';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
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

  // ? Messy... Is there a way to make it cleaner?
  const document = useMemo(
    () => <ResumeDocument activeSectionIds={activeSectionIds} data={data} />,
    [activeSectionIds, data],
  );

  const [instance, updateInstance] = usePDF({ document });

  useEffect(() => {
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
  //! USE_EFFECT IS TRIGGERED WHEN IT SHOULDN'T. YOU SHOULD FIND OUT WHICH STATES CAUSE THIS AND FIX THE ISSUE.
  useEffect(() => {
    if (instance.url === null || canvasNode === null) {
      return;
    }

    let isCancelled = false;
    let renderTask: null | RenderTask = null;

    async function loadAndRender() {
      try {
        const pdf: PDFDocumentProxy = await pdfjsLib.getDocument(instance.url)
          .promise;

        // As far as I understand from a glance, the line's purpose is to prevent the following logic from executing if `isCancelled` had been set to `true` before the `PDFDocumentLoadingTask` was resolved with `PDFDocumentProxy` (in other words, before the `pdf` got its value).
        // TODO: explain.
        if (isCancelled) return;

        setNumPages(pdf.numPages);

        const page = await pdf.getPage(openedPageIndex);

        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = canvasNode!;

        const canvasContext = canvas.getContext('2d')!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        /**
         * Before I refactored the component to TypeScript, `page.render` had
         * only `canvasContext` and `viewport` passed. But then, TypeScript
         * didn't allow me not to use neither of them, and yet,
         * `canvasContext`'s JSDoc says that if you pass it, the `canvas`
         * property must be `null`.
         *
         * I haven't tested it, so it has to be checked. It very likely
         * doesn't work properly now.
         */
        // TODO: check if it works.
        renderTask = page.render({
          canvasContext,
          canvas: null,
          viewport,
        });

        await renderTask.promise;
      } catch {
        return;
      }
    }

    void loadAndRender();

    return () => {
      if (renderTask === null) return;

      isCancelled = true;
      renderTask.cancel();
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
        <PDFDownloadLink
          document={document}
          fileName="Resume.pdf"
          // `Button_paddingInline_medium` replacement.
          style={{ paddingInline: '1rem' }}
        >
          {({ loading, error }) => {
            if (loading) return null;
            if (error) throw error;

            // TODO: delete or get back to how it was.
            // return (
            //   <Button
            //     className="Preview-DownloadBtn Preview-ActionBtn"
            //     modifiers={['Button_paddingInline_medium']}
            //   >
            //     Download
            //   </Button>
            // );
            return 'Download';
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
        {instance.loading && <p className="Preview-PdfTextAlt">Loading...</p>}

        {instance.error && (
          <p className="Preview-PdfTextAlt">
            Something went wrong. Try reloading the page.
          </p>
        )}

        <div style={{ width: canvasSize.width, height: canvasSize.height }}>
          <canvas ref={canvasCallbackRef} />
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
        <PDFDownloadLink
          document={document}
          fileName="Resume.pdf"
          // `Button_paddingInline_medium` replacement.
          style={{ paddingInline: '1rem' }}
        >
          {({ loading, error }) => {
            //? Does it render nothing in this case, or does it render an anchor tag anyway?
            if (loading) return null;
            if (error) throw error;

            // TODO: delete or get back to how it was.
            // return (
            //   <Button
            //     className="Preview-DownloadBtn Preview-ActionBtn"
            //     modifiers={['Button_paddingInline_medium']}
            //   >
            //     Download
            //   </Button>
            // );
            return 'Download';
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
    </Popup>
  );
}
