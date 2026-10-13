import '@testing-library/jest-dom';

import { deserialize, serialize } from 'node:v8';

import type { UsePDFInstance } from '@react-pdf/renderer';

// TODO: clean up here.

/**
 * The Orta Jest extension didn't want to recognise `structuredClone`
 * as a function, and nothing worked. So I found this solution.
 */
if (typeof structuredClone !== 'function') {
  global.structuredClone = (value) => {
    return deserialize(serialize(value));
  };
}

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

HTMLDialogElement.prototype.close = jest.fn(function () {
  this.open = false;
});

HTMLDialogElement.prototype.showModal = jest.fn(function () {
  this.open = true;
});

jest.mock('pdfjs-dist', () => {
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
    getDocument: jest.fn(getDocumentImplementation),
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

jest.mock('@react-pdf/renderer', () => ({
  Document: jest.fn(({ children, ..._rest }) => children),
  Font: {
    load() {
      return Promise.resolve(true);
    },
    register(_data: unknown) {},
  },
  Link: jest.fn(({ children, href, ..._rest }) => (
    <a href={href}>{children}</a>
  )),
  Page: jest.fn(({ children, ..._rest }) => <div>{children}</div>),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PDFDownloadLink: jest.fn(({ children, fileName, ...props }) => (
    <a data-testid="mock-pdf-download-link" {...props}>
      {typeof children === 'function'
        ? children({ error: null, loading: false })
        : children}
    </a>
  )),
  PDFViewer: jest.fn(({ children, ..._rest }) => (
    <iframe data-testid="mock-pdf-viewer" title="PDF Viewer">
      {children}
    </iframe>
  )),
  StyleSheet: {
    create: jest.fn((styles: unknown) => styles),
  },
  Text: jest.fn(({ children, ..._rest }) => <span>{children}</span>),
  usePDF: jest.fn((): [UsePDFInstance, jest.Mock] => [
    {
      blob: new Blob(['mock-pdf-content'], { type: 'application/pdf' }),
      error: null,
      loading: false,
      url: 'blob:mock-pdf-url',
    },
    jest.fn(),
  ]),
  View: jest.fn(({ children, ..._rest }) => <div>{children}</div>),
}));

/**
 * `getComputedStyle` is used in `Preview` and must return `{ ...,
 * paddingInline: string }` for everything to work correctly.
 */
const getComputedStyleOriginal = window.getComputedStyle;

jest.spyOn(window, 'getComputedStyle').mockImplementation((elt: Element) => {
  const style = getComputedStyleOriginal(elt);

  if (style.getPropertyValue('padding-inline') === '') {
    style.setProperty('padding-inline', '2rem');
  }

  return style;
});
