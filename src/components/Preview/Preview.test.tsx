import React, { useCallback, useState } from 'react';

import * as renderer from '@react-pdf/renderer';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as pdfjsLib from 'pdfjs-dist/webpack';

import useAppState from '@/hooks/useAppState';
import '@testing-library/jest-dom';

import useResumeData from '@/hooks/useResumeData';

import Preview from './Preview';

import type { PreviewProps } from './Preview';
import type { DocumentProps, UsePDFInstance } from '@react-pdf/renderer';

// TODO: this test suite is a disaster. Refactor this rubbish heavily.

// Testing plan:
// TODO: to be finished as soon as I figure out how the component works.
// Download Link
// - [ ] If loading, should not render.
// - [ ] If error, should throw.

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
 * Changes the implementation of `usePDF` to alter document loading status.
 *
 * @returns A restore function to get back to the default implementation.
 */
function mockInstanceStatusTemporary({
  loading = false,
  error = null,
}: {
  error?: null | string;
  loading?: boolean;
}) {
  const usePDFDefaultImplementation = (
    renderer.usePDF as jest.Mock
  ).getMockImplementation();

  const usePDFTemporary = () => {
    const [document, _] = useState<UsePDFInstance>({
      loading,
      error,
      blob: null,
      url: 'blob:mock-pdf-url',
    });

    const setDocumentMock = useCallback(
      (_newDocument: React.ReactElement<DocumentProps>) => {},
      [],
    );

    return [document, setDocumentMock];
  };

  (renderer.usePDF as jest.Mock).mockImplementation(usePDFTemporary);

  function restore() {
    (renderer.usePDF as jest.Mock).mockImplementation(
      usePDFDefaultImplementation,
    );
  }

  return restore;
}

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
 * Changes the implementation of `getDocument` from mocked `pdfjs-dist/webpack`
 * to have a different `numPages` value.
 *
 * @returns A restore function to get back to the default implementation.
 */
function mockWithNumPagesTemporary(numPages: number) {
  const defaultImplementation = (
    pdfjsLib.getDocument as jest.Mock
  ).getMockImplementation();

  const temporaryImplementation = () => ({
    promise: {
      numPages,
      getPage: pdfjsLib.getDocument('url').promise.getPage,
    },
  });

  (pdfjsLib.getDocument as jest.Mock).mockImplementation(
    temporaryImplementation,
  );

  function restore() {
    (pdfjsLib.getDocument as jest.Mock).mockImplementation(
      defaultImplementation,
    );
  }

  return restore;
}

jest.mock('@/hooks/useDebouncedWindowSize', () => () => ({ innerWidth: 250 }));

describe('Preview', () => {
  /**
   * Since to test this component, we can safely use the same data and state, I
   * decided to do just that. The following logic creates `appState` and
   * fills the resume with enough data necessary for testing `Preview`.
   */
  const { result: resumeDataResult } = renderHook(() => useResumeData());
  const { result: appStateResult } = renderHook(() => useAppState());
  const { activeSectionIds } = appStateResult.current;

  function getProps(overrides?: Partial<PreviewProps>): PreviewProps {
    return {
      activeSectionIds: structuredClone(activeSectionIds),
      data: structuredClone(resumeDataResult.current.data),
      isShown: true,
      onClose: () => {},
      ...overrides,
    };
  }

  function renderPreview(
    props?: PreviewProps,
    Component: typeof Preview = Preview,
  ) {
    // `Preview` is portalled into an element with an ID "popup-root".
    render(<div id="popup-root" />);
    render(<Component {...getProps(props)} />);
  }

  // Tests

  /**
   * `getComputedStyle` is used in the component and must return { ...,
   * paddingInline: string } for everything to work correctly.
   */
  const getComputedStyleOriginal = window.getComputedStyle;

  jest.spyOn(window, 'getComputedStyle').mockImplementation((elt: Element) => {
    const style = getComputedStyleOriginal(elt);

    if (style.getPropertyValue('padding-inline') === '') {
      style.setProperty('padding-inline', '2rem');
    }

    return style;
  });

  it('should render with an accessible name "Preview"', async () => {
    renderPreview();

    const popup = await screen.findByRole('dialog', { name: 'Preview' });

    expect(popup).toBeInTheDocument();
  });

  describe('Download links', () => {
    it('should render two download links with text "Download"', async () => {
      renderPreview();

      const downloadLinks: HTMLAnchorElement[] = await screen.findAllByTestId(
        'mock-pdf-download-link',
      );

      expect(downloadLinks).toHaveLength(2);
      expect(downloadLinks[0].text).toBe('Download');
      expect(downloadLinks[1].text).toBe('Download');
    });
  });

  describe('Close Popup Button', () => {
    it('should render with an accessible name "Close Popup"', async () => {
      renderPreview();

      const btn = await screen.findByRole('button', { name: 'Close Popup' });

      expect(btn).toBeInTheDocument();
    });

    it('should call `onClose` when clicked', async () => {
      const mockFn = jest.fn();
      renderPreview(getProps({ onClose: mockFn }));
      const user = userEvent.setup();
      const btn = await screen.findByRole('button', { name: 'Close Popup' });

      await user.click(btn);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation Buttons', () => {
    describe('Next Page', () => {
      it('should render two buttons "Next Page"', async () => {
        renderPreview();

        const btns = await screen.findAllByRole('button', {
          name: 'Next Page',
        });

        expect(btns).toHaveLength(2);
        expect(btns[0]).toBeInTheDocument();
        expect(btns[1]).toBeInTheDocument();
      });

      it('should not render "Next Page" buttons when the opened page is the last page', async () => {
        const restoreMock = mockWithNumPagesTemporary(1);
        renderPreview();

        await expect(
          screen.findAllByRole('button', {
            name: 'Next Page',
          }),
        ).rejects.toThrow();

        // Cleanup
        restoreMock();
      });

      it('should increment `openedPageIndex` on click', async () => {
        // Arrange
        renderPreview();
        const user = userEvent.setup();

        const btns = await screen.findAllByRole('button', {
          name: 'Next Page',
        });

        // Act
        await user.click(btns[0]);
        await user.click(btns[0]);

        // Assert
        /**
         * Since there are only three pages (as we defined in our mock),
         * the buttons must not render after two clicks.
         */
        expect(btns[0]).not.toBeInTheDocument();
        expect(btns[1]).not.toBeInTheDocument();
      });
    });

    describe('Previous Page', () => {
      it('should not render "Previous Page" buttons when the opened page is the first page', async () => {
        renderPreview();

        await expect(
          screen.findAllByRole('button', { name: 'Previous Page' }),
        ).rejects.toThrow();
      });

      it('should render two buttons "Previous Page"', async () => {
        // Arrange
        renderPreview();
        const user = userEvent.setup();

        const name = 'Next Page';
        const nextPageBtn = (await screen.findAllByRole('button', { name }))[0];

        /**
         * This is necessary because "Previous Page" buttons won't render when
         * the first page is opened.
         */
        await user.click(nextPageBtn);

        // Act
        const previousPageBtns = await screen.findAllByRole('button', {
          name: 'Previous Page',
        });

        // Assert
        expect(previousPageBtns).toHaveLength(2);
        expect(previousPageBtns[0]).toBeInTheDocument();
        expect(previousPageBtns[1]).toBeInTheDocument();
      });

      it('should decrement `openedPageIndex` on click', async () => {
        // Arrange
        renderPreview();
        const user = userEvent.setup();

        const name = 'Next Page';
        const nextPageBtn = (await screen.findAllByRole('button', { name }))[0];

        /**
         * Increments `openedPageIndex` to 2, causing "Previous Page" buttons'
         * render.
         */
        await user.click(nextPageBtn);

        const previousPageBtns = await screen.findAllByRole('button', {
          name: 'Previous Page',
        });

        // Act
        await user.click(previousPageBtns[0]);

        /**
         * Since `openedPageIndex` has been decremented by the click, the
         * "Previous Page" buttons should not render now.
         */
        expect(previousPageBtns[0]).not.toBeInTheDocument();
        expect(previousPageBtns[1]).not.toBeInTheDocument();
      });
    });
  });

  describe('Document', () => {
    it('should render "Loading..." while the document is loading', async () => {
      // Arrange

      // Mock instance loading status
      const restoreMock = mockInstanceStatusTemporary({ loading: true });

      renderPreview();

      // Act
      const paragraph = await screen.findByText('Loading...');

      // Assert
      expect(paragraph).toBeInTheDocument();

      // Cleanup
      restoreMock();
    });

    it('should render "Something went wrong. Try reloading the page." when an error occurs during document loading.', async () => {
      // Arrange

      // Mock instance loading status
      const restoreMock = mockInstanceStatusTemporary({ error: 'Some error' });

      renderPreview();

      // Act
      const paragraph = await screen.findByText(
        'Something went wrong. Try reloading the page.',
      );

      // Assert
      expect(paragraph).toBeInTheDocument();

      // Cleanup
      restoreMock();
    });
  });
});
