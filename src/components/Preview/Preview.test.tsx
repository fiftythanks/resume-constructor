import * as renderer from '@react-pdf/renderer';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as pdfjsLib from 'pdfjs-dist';
import '@testing-library/jest-dom';

import useAppState from '@/hooks/useAppState';
import useResumeData from '@/hooks/useResumeData';

import Preview from './Preview';

import type { PreviewProps } from './Preview';

interface MockInstanceOptions {
  error?: null | string;
  loading?: boolean;
}

/**
 * Changes the implementation of `usePDF` to alter document loading or error status.
 *
 * @returns A restore function to get back to the default implementation.
 */
function mockInstanceStatusTemporary({
  error = null,
  loading = false,
}: MockInstanceOptions = {}) {
  const defaultImplementation = (
    renderer.usePDF as jest.Mock
  ).getMockImplementation();

  (renderer.usePDF as jest.Mock).mockReturnValue([
    {
      blob: new Blob(['mock-pdf-content'], { type: 'application/pdf' }),
      error,
      loading,
      url: 'blob:mock-pdf-url',
    },
    jest.fn(),
  ]);

  return function restore() {
    (renderer.usePDF as jest.Mock).mockImplementation(defaultImplementation);
  };
}

/**
 * Mocks `pdfjsLib.getDocument` with a temporary total number of pages.
 *
 * @returns A restore function to revert to the default implementation.
 */
function mockNumPagesTemporary(numPages: number) {
  const getDocumentMock = pdfjsLib.getDocument as unknown as jest.Mock;
  const defaultImplementation = getDocumentMock.getMockImplementation();

  getDocumentMock.mockImplementation(() => ({
    promise: Promise.resolve({
      getPage: () =>
        Promise.resolve({
          getTextContent: () => Promise.resolve({ items: [], styles: {} }),
          getViewport: () => ({
            height: 250,
            rawDims: {
              pageHeight: 841.89,
              pageWidth: 595.28,
              pageX: 0,
              pageY: 0,
            },
            width: 250,
          }),
          render: () => ({
            cancel() {},
            promise: Promise.resolve(),
          }),
        }),
      numPages,
    }),
  }));

  return function restore() {
    getDocumentMock.mockImplementation(defaultImplementation);
  };
}

describe('Preview', () => {
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

  function renderPreview(props?: Partial<PreviewProps>) {
    render(<div id="popup-root" />);
    render(<Preview {...getProps(props)} />);
  }

  describe('Modal dialog and accessibility', () => {
    it('should render dialog with accessible name "Preview"', async () => {
      // ARRANGE & ACT
      renderPreview();

      const popup = await screen.findByRole('dialog', { name: 'Preview' });

      // ASSERT
      expect(popup).toBeInTheDocument();
      expect(popup).toHaveAttribute('id', 'resume-preview-dialog');
      expect(popup).toHaveClass('Popup', 'Preview');
    });

    it('should support a custom dialog id via the "id" prop', async () => {
      // ARRANGE & ACT
      renderPreview({ id: 'custom-dialog-id' });

      const popup = await screen.findByRole('dialog', { name: 'Preview' });

      // ASSERT
      expect(popup).toHaveAttribute('id', 'custom-dialog-id');
    });
  });

  describe('Close button', () => {
    it('should render with an accessible name "Close Popup"', async () => {
      // ARRANGE & ACT
      renderPreview();

      const btn = await screen.findByRole('button', { name: 'Close Popup' });

      // ASSERT
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveClass('Preview-CloseBtn');
    });

    it('should call "onClose" when clicked', async () => {
      // ARRANGE
      const onCloseMock = jest.fn();
      renderPreview({ onClose: onCloseMock });
      const user = userEvent.setup();
      const btn = await screen.findByRole('button', { name: 'Close Popup' });

      // ACT
      await user.click(btn);

      // ASSERT
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Download buttons', () => {
    it('should render two download buttons with accessible name "Download"', async () => {
      // ARRANGE & ACT
      renderPreview();

      const downloadBtns = await screen.findAllByRole('button', {
        name: 'Download',
      });

      // ASSERT
      expect(downloadBtns).toHaveLength(2);
      expect(downloadBtns[0]).toBeInTheDocument();
      expect(downloadBtns[1]).toBeInTheDocument();
    });
  });

  describe('Navigation buttons', () => {
    describe('"Next Page" button', () => {
      it('should render two "Next Page" buttons on initial page load', async () => {
        // ARRANGE & ACT
        renderPreview();

        const btns = await screen.findAllByRole('button', {
          name: 'Next Page',
        });

        // ASSERT
        expect(btns).toHaveLength(2);
        expect(btns[0]).toBeInTheDocument();
        expect(btns[1]).toBeInTheDocument();
      });

      it('should not render "Next Page" buttons when document has only one page', async () => {
        // ARRANGE
        const restore = mockNumPagesTemporary(1);

        // ACT
        renderPreview();
        await screen.findByRole('dialog', { name: 'Preview' });

        // ASSERT
        expect(
          screen.queryByRole('button', { name: 'Next Page' }),
        ).not.toBeInTheDocument();

        // CLEANUP
        restore();
      });

      it('should render "Previous Page" buttons after clicking "Next Page"', async () => {
        // ARRANGE
        renderPreview();
        const user = userEvent.setup();
        const nextBtns = await screen.findAllByRole('button', {
          name: 'Next Page',
        });

        // ACT
        await user.click(nextBtns[0]);

        // ASSERT
        const previousBtns = await screen.findAllByRole('button', {
          name: 'Previous Page',
        });
        expect(previousBtns).toHaveLength(2);
      });

      it('should not render "Next Page" buttons when advancing to the final page', async () => {
        // ARRANGE
        renderPreview();
        const user = userEvent.setup();
        const firstNextBtns = await screen.findAllByRole('button', {
          name: 'Next Page',
        });
        await user.click(firstNextBtns[0]);
        const secondNextBtns = await screen.findAllByRole('button', {
          name: 'Next Page',
        });

        // ACT
        await user.click(secondNextBtns[0]);

        // ASSERT
        expect(
          screen.queryByRole('button', { name: 'Next Page' }),
        ).not.toBeInTheDocument();
      });
    });

    describe('"Previous Page" button', () => {
      it('should not render "Previous Page" buttons on the first page', async () => {
        // ARRANGE & ACT
        renderPreview();
        await screen.findByRole('dialog', { name: 'Preview' });

        // ASSERT
        expect(
          screen.queryByRole('button', { name: 'Previous Page' }),
        ).not.toBeInTheDocument();
      });

      it('should hide "Previous Page" buttons after returning to the first page', async () => {
        // ARRANGE
        renderPreview();
        const user = userEvent.setup();
        const nextBtns = await screen.findAllByRole('button', {
          name: 'Next Page',
        });
        await user.click(nextBtns[0]);
        const previousBtns = await screen.findAllByRole('button', {
          name: 'Previous Page',
        });

        // ACT
        await user.click(previousBtns[0]);

        // ASSERT
        expect(
          screen.queryByRole('button', { name: 'Previous Page' }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Canvas and text layer rendering', () => {
    it('should render the resume page canvas', async () => {
      // ARRANGE & ACT
      renderPreview();

      const canvas = await screen.findByRole('img', {
        name: 'Resume page canvas',
      });

      // ASSERT
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveClass('Preview-Canvas');
    });

    it('should render the transparent text selection layer', async () => {
      // ARRANGE & ACT
      renderPreview();

      const textLayer = await screen.findByRole('region', {
        name: 'Text selection layer',
      });

      // ASSERT
      expect(textLayer).toBeInTheDocument();
      expect(textLayer).toHaveClass('Preview-TextLayer', 'textLayer');
    });
  });

  describe('Loading and error states', () => {
    it('should render loading indicator when document is loading', async () => {
      // ARRANGE
      const restore = mockInstanceStatusTemporary({ loading: true });

      // ACT
      renderPreview();

      const loadingText = await screen.findByText('Loading...');

      // ASSERT
      expect(loadingText).toBeInTheDocument();
      expect(loadingText).toHaveClass('Preview-PdfTextAlt');

      // CLEANUP
      restore();
    });

    it('should render error message when document fails to generate', async () => {
      // ARRANGE
      const restore = mockInstanceStatusTemporary({
        error: 'PDF generation failed',
      });

      // ACT
      renderPreview();

      const errorText = await screen.findByText(
        'Something went wrong. Try reloading the page.',
      );

      // ASSERT
      expect(errorText).toBeInTheDocument();
      expect(errorText).toHaveClass('Preview-PdfTextAlt');

      // CLEANUP
      restore();
    });
  });
});
