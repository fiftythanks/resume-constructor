import '@testing-library/jest-dom/vitest';

import type { UsePDFInstance } from '@react-pdf/renderer';
import type { Mock } from 'vitest';

vi.mock('tabbable');

vi.mock('pdfjs-dist/build/pdf.worker.min.mjs', () => ({
  default: 'test-file-stub',
}));

if (typeof Blob.prototype.arrayBuffer !== 'function') {
  Blob.prototype.arrayBuffer = async function () {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          resolve(new ArrayBuffer(0));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

/**
 * There's no implementation for `HTMLDialogElement.prototype.close`
 * and `HTMLDialogElement.prototype.showModal` in JSDOM yet.
 */

HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
  this.open = false;
});

HTMLDialogElement.prototype.showModal = vi.fn(function (
  this: HTMLDialogElement,
) {
  this.open = true;
});

vi.mock('pdfjs-dist', () => {
  const render = () => ({
    cancel() {},
    promise: Promise.resolve(),
  });

  const getViewport = () => ({
    height: 250,
    rawDims: {
      pageHeight: 841.89,
      pageWidth: 595.28,
      pageX: 0,
      pageY: 0,
    },
    width: 250,
  });

  const getTextContent = () =>
    Promise.resolve({
      items: [
        {
          dir: 'ltr',
          fontName: 'g_d0_f1',
          hasEOL: false,
          height: 12,
          str: 'Mock Resume Text',
          transform: [12, 0, 0, 12, 0, 800],
          width: 100,
        },
      ],
      styles: {},
    });

  const getPage = () => ({
    getTextContent,
    getViewport,
    render,
  });

  const getDocumentImplementation = () => ({
    promise: {
      getPage,
      numPages: 3,
    },
  });

  class MockTextLayer {
    cancel() {}
    render() {
      return Promise.resolve();
    }
  }

  return {
    getDocument: vi.fn(getDocumentImplementation),
    GlobalWorkerOptions: {
      workerSrc: '',
    },
    TextLayer: MockTextLayer,
  };
});

/**
 * Since ReactPDF and PDF.js can't work in a Node environment, we need a solid
 * workaround. The best way I could've come up with is mocking.
 */

vi.mock('@react-pdf/renderer', () => ({
  Document: vi.fn(({ children, ..._rest }) => children),
  Font: {
    load() {
      return Promise.resolve(true);
    },
    register(_data: unknown) {},
  },
  Link: vi.fn(({ children, href, ..._rest }) => <a href={href}>{children}</a>),
  Page: vi.fn(({ children, ..._rest }) => <div>{children}</div>),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PDFDownloadLink: vi.fn(({ children, fileName, ...props }) => (
    <a data-testid="mock-pdf-download-link" {...props}>
      {typeof children === 'function'
        ? children({ error: null, loading: false })
        : children}
    </a>
  )),
  PDFViewer: vi.fn(({ children, ..._rest }) => (
    <iframe data-testid="mock-pdf-viewer" title="PDF Viewer">
      {children}
    </iframe>
  )),
  StyleSheet: {
    create: vi.fn((styles: unknown) => styles),
  },
  Text: vi.fn(({ children, ..._rest }) => <span>{children}</span>),
  usePDF: vi.fn((): [UsePDFInstance, Mock] => [
    {
      blob: new Blob(['mock-pdf-content'], { type: 'application/pdf' }),
      error: null,
      loading: false,
      url: 'blob:mock-pdf-url',
    },
    vi.fn(),
  ]),
  View: vi.fn(({ children, ..._rest }) => <div>{children}</div>),
}));

/**
 * `getComputedStyle` is used in `Preview` and must return `{ ...,
 * paddingInline: string }` for everything to work correctly.
 */
const getComputedStyleOriginal = window.getComputedStyle.bind(window);

vi.spyOn(window, 'getComputedStyle').mockImplementation(
  (elt: Element, pseudoElt?: null | string) => {
    const style = getComputedStyleOriginal(elt, pseudoElt);

    return new Proxy(style, {
      get(target, prop) {
        if (prop === 'paddingInline') {
          return Reflect.get(target, prop, target) || '2rem';
        }

        const value: unknown = Reflect.get(target, prop, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  },
);
