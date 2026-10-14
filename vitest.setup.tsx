import '@testing-library/jest-dom/vitest';

import type { UsePDFInstance } from '@react-pdf/renderer';
import type { Mock } from 'vitest';

import './src/styles/main.scss';

const style = document.createElement('style');
style.textContent = `
  @layer reset, base, blocks, helpers;
  body > div:has(.AppLayout) {
    width: 100%;
    height: 100%;
  }
`;
document.head.prepend(style);

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
 * Mock `@react-pdf/renderer` and `pdfjs-dist` in component tests so PDF
 * compilation and canvas rendering remain fast and deterministic.
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
  Path: vi.fn(() => <path />),
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
  Svg: vi.fn(({ children, ..._rest }) => <svg>{children}</svg>),
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
