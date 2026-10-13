import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Font, PDFDownloadLink, usePDF } from '@react-pdf/renderer';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs';

import useDebouncedWindowSize from '@/hooks/useDebouncedWindowSize';

import Button from '@/components/Button';
import Popup from '@/components/Popup';

import ResumeDocument from './ResumeDocument';

import closeSrc from '@/assets/icons/cross.svg';

import type { ResumeData, SectionId } from '@/types/resumeData';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import type { ReadonlyDeep } from 'type-fest';

import './Preview.scss';

// Set path to the compiled worker asset.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * Aspect ratio defined in `@react-pdf/renderer` for standard A4 page size.
 * https://github.com/diegomura/react-pdf/blob/ee5c96b80326ba4441b71be4c7a85ba9f61d4174/packages/layout/src/page/getSize.ts
 */
const A4_ASPECT_RATIO = 595.28 / 841.89;

export interface PreviewProps {
  activeSectionIds: SectionId[];
  data: ResumeData;
  id?: string;
  isShown: boolean;
  onClose: () => void;
}

/**
 * A resume preview dialog that renders the PDF document on an HTML canvas
 * with an interactive invisible text layer overlay for text selection and copying.
 */
export default function Preview({
  activeSectionIds,
  data,
  id = 'resume-preview-dialog',
  isShown,
  onClose,
}: ReadonlyDeep<PreviewProps>) {
  const [instance, updateInstance] = usePDF();
  const [canvasSize, setCanvasSize] = useState({ height: 0, width: 0 });
  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);
  const [textLayerNode, setTextLayerNode] = useState<HTMLDivElement | null>(
    null,
  );
  const [numPages, setNumPages] = useState(0);
  const popupRef = useRef<HTMLDialogElement | null>(null);
  const { innerWidth: viewportWidth } = useDebouncedWindowSize();

  // 1-based page indices matching PDF.js page conventions.
  const [openedPageIndex, setOpenedPageIndex] = useState(1);

  const canvasCallbackRef = useCallback((node: HTMLCanvasElement | null) => {
    setCanvasNode(node);
  }, []);
  const textLayerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    setTextLayerNode(node);
  }, []);

  /**
   * If fonts are not loaded manually prior to rendering the document,
   * initial document generation will fall back to unstyled glyphs.
   */
  const [areFontsLoaded, setAreFontsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

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
      .then(() => {
        if (!isCancelled) {
          setAreFontsLoaded(true);
        }
      })
      .catch((e: unknown) => {
        console.error(e);

        if (!isCancelled) {
          // Setting to true so we still get a PDF, at least with fallback fonts.
          setAreFontsLoaded(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Prevent `usePDF` from creating a new PDF on every re-render.
  const document = useMemo(() => {
    if (!areFontsLoaded) {
      return;
    }

    return <ResumeDocument activeSectionIds={activeSectionIds} data={data} />;
  }, [activeSectionIds, areFontsLoaded, data]);

  useEffect(() => {
    if (document !== undefined) {
      // Synchronises the external React-PDF worker compiler with updated document contents.
      updateInstance(document);
    }
  }, [document, updateInstance]);

  /**
   * Calculates the size of the canvas to preserve the A4 paper aspect ratio
   * in portrait mode as the viewport is resized.
   */
  useLayoutEffect(() => {
    if (!isShown || popupRef.current === null) {
      return;
    }

    const paddingInline = parseFloat(
      getComputedStyle(popupRef.current).paddingInline,
    );

    const width = viewportWidth - 2 * paddingInline;

    setCanvasSize({ height: width / A4_ASPECT_RATIO, width });
  }, [isShown, viewportWidth]);

  // Renders the document with PDF.js on canvas with transparent text layer overlay.
  useEffect(() => {
    const blob = instance.blob;
    if (blob === null || canvasNode === null) return;

    let isCancelled = false;
    let renderTask: null | RenderTask = null;
    let textLayerInstance: null | pdfjsLib.TextLayer = null;

    async function loadAndRender(targetBlob: Blob) {
      let pdf: PDFDocumentProxy;
      let page: PDFPageProxy;

      // ======================================================================
      // PDF PAGE PROXY
      // ======================================================================

      // `pdf` initialisation.
      try {
        const buffer = await targetBlob.arrayBuffer();

        if (isCancelled) return;

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
        });
        pdf = await loadingTask.promise;

        if (isCancelled) return;

        setNumPages(pdf.numPages);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'RenderingCancelledException') {
          return;
        }

        console.error(e);
        return;
      }

      // `page` initialisation.
      try {
        page = await pdf.getPage(openedPageIndex);

        if (isCancelled) return;
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'RenderingCancelledException') {
          return;
        }

        console.error(e);
        return;
      }

      // ======================================================================
      // PDF DOCUMENT RENDER
      // ======================================================================

      if (canvasNode === null || !canvasNode.isConnected) {
        return;
      }

      const viewport = page.getViewport({ scale: 2.0 });

      canvasNode.width = viewport.width;
      canvasNode.height = viewport.height;
      canvasNode.style.width = '100%';
      canvasNode.style.height = '100%';

      const canvasContext = canvasNode.getContext('2d');
      if (canvasContext === null) return;

      try {
        renderTask = page.render({
          canvas: canvasNode,
          viewport,
        });

        await renderTask.promise;
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'RenderingCancelledException') {
          return;
        }

        console.error(e);
      }

      // ======================================================================
      // TEXT LAYER RENDER
      // ======================================================================

      if (isCancelled || textLayerNode === null || !textLayerNode.isConnected) {
        return;
      }

      try {
        textLayerNode.replaceChildren();

        const textContent = await page.getTextContent();
        if (isCancelled) return;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const displayScale =
          canvasSize.width > 0
            ? canvasSize.width / unscaledViewport.width
            : 1.0;

        textLayerNode.style.setProperty('--scale-factor', `${displayScale}`);

        textLayerInstance = new pdfjsLib.TextLayer({
          container: textLayerNode,
          textContentSource: textContent,
          viewport: page.getViewport({ scale: displayScale }),
        });

        await textLayerInstance.render();
      } catch (e: unknown) {
        if (
          e instanceof Error &&
          (e.name === 'RenderingCancelledException' ||
            e.name === 'AbortException')
        ) {
          return;
        }

        console.error(e);
      }
    }

    void loadAndRender(blob);

    return () => {
      isCancelled = true;
      renderTask?.cancel();
      textLayerInstance?.cancel();
    };
  }, [
    canvasNode,
    canvasSize.width,
    instance.blob,
    openedPageIndex,
    textLayerNode,
  ]);

  return (
    <Popup
      block="Preview"
      externalRef={popupRef}
      id={id}
      isShown={isShown}
      title="Preview"
      onClose={onClose}
    >
      <button
        aria-label="Close Popup"
        className="Preview-CloseBtn"
        type="button"
        onClick={() => {
          popupRef.current?.close();
          onClose();
        }}
      >
        <img alt="Close Popup" height="32px" src={closeSrc} width="32px" />
      </button>
      {document === undefined ||
      !areFontsLoaded ||
      instance.url === null ? null : (
        <>
          <div className="Preview-ActionBtns">
            {openedPageIndex > 1 && (
              <Button
                className="Preview-ActionBtn"
                onClick={() =>
                  setOpenedPageIndex((prev) => Math.max(1, prev - 1))
                }
              >
                Previous Page
              </Button>
            )}
            <PDFDownloadLink document={document} fileName="resume.pdf">
              {({ error, loading }) => {
                if (loading) return null;

                if (error !== null) {
                  console.error(error);
                  return null;
                }

                return (
                  <Button modifiers={['Button_paddingInline_medium']}>
                    Download
                  </Button>
                );
              }}
            </PDFDownloadLink>
            {numPages > openedPageIndex && (
              <Button
                className="Preview-ActionBtn"
                onClick={() =>
                  setOpenedPageIndex((prev) => Math.min(numPages, prev + 1))
                }
              >
                Next Page
              </Button>
            )}
          </div>
          <div className="Preview-CanvasContainer">
            {instance.loading && (
              <p className="Preview-PdfTextAlt">Loading...</p>
            )}
            {instance.error !== null && (
              <p className="Preview-PdfTextAlt">
                Something went wrong. Try reloading the page.
              </p>
            )}
            <div
              className="Preview-PageWrapper"
              style={{
                height: canvasSize.height,
                position: 'relative',
                width: canvasSize.width,
              }}
            >
              <canvas
                aria-label="Resume page canvas"
                className="Preview-Canvas"
                data-testid="preview-canvas"
                ref={canvasCallbackRef}
                role="img"
              />
              <div
                aria-label="Text selection layer"
                className="Preview-TextLayer textLayer"
                data-testid="preview-text-layer"
                ref={textLayerCallbackRef}
                role="region"
              />
            </div>
          </div>
          <div className="Preview-ActionBtns">
            {openedPageIndex > 1 && (
              <Button
                className="Preview-ActionBtn"
                onClick={() =>
                  setOpenedPageIndex((prev) => Math.max(1, prev - 1))
                }
              >
                Previous Page
              </Button>
            )}
            <PDFDownloadLink document={document} fileName="resume.pdf">
              {({ error, loading }) => {
                if (loading) return null;

                if (error !== null) {
                  console.error(error);
                  return null;
                }

                return (
                  <Button modifiers={['Button_paddingInline_medium']}>
                    Download
                  </Button>
                );
              }}
            </PDFDownloadLink>
            {numPages > openedPageIndex && (
              <Button
                className="Preview-ActionBtn"
                onClick={() =>
                  setOpenedPageIndex((prev) => Math.min(numPages, prev + 1))
                }
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
