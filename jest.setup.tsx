import React, { useCallback, useState } from 'react';

import '@testing-library/jest-dom';

import { deserialize, serialize } from 'node:v8';

import type { DocumentProps, UsePDFInstance } from '@react-pdf/renderer';

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

jest.mock('pdfjs-dist/webpack', () => {
  const render = () => ({
    cancel() {},
    promise: new Promise<void>((resolve) => resolve()),
  });

  const getViewport = () => ({ height: 250, width: 250 });

  const getPage = () => ({
    getViewport,
    render,
  });

  const getDocumentImplementation = () => ({
    promise: {
      getPage,
      numPages: 3,
    },
  });

  return {
    getDocument: jest.fn(getDocumentImplementation),
    GlobalWorkerOptions: {
      workerSrc: '',
    },
  };
});

/**
 * Since ReactPDF and PDF.js can't work in a Node environment, we need a solid
 * workaround. The best way I could've come up with is mocking.
 */

jest.mock('@react-pdf/renderer', () => ({
  Document: jest.fn(({ ..._props }) => {}),
  Link: jest.fn(({ ..._props }) => {}),
  Text: jest.fn(({ ..._props }) => {}),
  View: jest.fn(({ ..._props }) => {}),
  Font: {
    register(_data: unknown) {},
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PDFDownloadLink: jest.fn(({ children, fileName, ...props }) => (
    <a data-testid="mock-pdf-download-link" {...props}>
      {typeof children === 'function'
        ? children({ loading: false, error: null })
        : children}
    </a>
  )),
  StyleSheet: {
    create(_styles: unknown) {},
  },
  usePDF: jest.fn(() => {
    const [document, _] = useState<UsePDFInstance>({
      url: 'blob:mock-pdf-url',
      loading: false,
      error: null,
      blob: null,
    });

    const setDocumentMock = useCallback(
      (_newDocument: React.ReactElement<DocumentProps>) => {},
      [],
    );

    return [document, setDocumentMock];
  }),
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
