import * as renderer from '@react-pdf/renderer';
import * as pdfjsLib from 'pdfjs-dist';
import { render, renderHook } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import useAppState from '@/hooks/useAppState';
import useResumeData from '@/hooks/useResumeData';

import Preview from './Preview';

import type { PreviewProps } from './Preview';
import type { Mock } from 'vitest';

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
    renderer.usePDF as Mock
  ).getMockImplementation();

  (renderer.usePDF as Mock).mockReturnValue([
    {
      blob: new Blob(['mock-pdf-content'], { type: 'application/pdf' }),
      error,
      loading,
      url: 'blob:mock-pdf-url',
    },
    vi.fn(),
  ]);

  return function restore() {
    if (defaultImplementation) {
      (renderer.usePDF as Mock).mockImplementation(defaultImplementation);
    }
  };
}

/**
 * Mocks `pdfjsLib.getDocument` with a temporary total number of pages.
 *
 * @returns A restore function to revert to the default implementation.
 */
function mockNumPagesTemporary(numPages: number) {
  const getDocumentMock = pdfjsLib.getDocument as unknown as Mock;
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
    if (defaultImplementation) {
      getDocumentMock.mockImplementation(defaultImplementation);
    }
  };
}

describe('Preview', () => {
  async function getProps(
    overrides?: Partial<PreviewProps>,
  ): Promise<PreviewProps> {
    const { result: resumeDataResult } = await renderHook(() =>
      useResumeData(),
    );
    const { result: appStateResult } = await renderHook(() => useAppState());
    const { activeSectionIds } = appStateResult.current;

    return {
      activeSectionIds: structuredClone(activeSectionIds),
      data: structuredClone(resumeDataResult.current.data),
      isShown: true,
      onClose: () => {},
      ...overrides,
    };
  }

  async function renderPreview(props?: Partial<PreviewProps>) {
    const resolvedProps = await getProps(props);
    await render(<div id="popup-root" />);
    await render(<Preview {...resolvedProps} />);
  }

  describe('Modal dialog and accessibility', () => {
    it('should render dialog with accessible name "Preview"', async () => {
      // ARRANGE & ACT
      await renderPreview();

      const popup = page.getByRole('dialog', { name: 'Preview' });

      // ASSERT
      await expect.element(popup).toBeInTheDocument();
      await expect
        .element(popup)
        .toHaveAttribute('id', 'resume-preview-dialog');
      await expect.element(popup).toHaveClass('Popup', 'Preview');
    });

    it('should support a custom dialog id via the "id" prop', async () => {
      // ARRANGE & ACT
      await renderPreview({ id: 'custom-dialog-id' });

      const popup = page.getByRole('dialog', { name: 'Preview' });

      // ASSERT
      await expect.element(popup).toHaveAttribute('id', 'custom-dialog-id');
    });
  });

  describe('Close button', () => {
    it('should render with an accessible name "Close Popup"', async () => {
      // ARRANGE & ACT
      await renderPreview();

      const btn = page.getByRole('button', { name: 'Close Popup' });

      // ASSERT
      await expect.element(btn).toBeInTheDocument();
      await expect.element(btn).toHaveClass('Preview-CloseBtn');
    });

    it('should call "onClose" when clicked', async () => {
      // ARRANGE
      const onCloseMock = vi.fn();
      await renderPreview({ onClose: onCloseMock });
      const user = userEvent.setup();
      const btn = page.getByRole('button', { name: 'Close Popup' });

      // ACT
      await user.click(btn);

      // ASSERT
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Download buttons', () => {
    it('should render two download buttons with accessible name "Download"', async () => {
      // ARRANGE & ACT
      await renderPreview();

      const downloadBtnLocator = page.getByRole('button', {
        name: 'Download',
      });
      await expect.element(downloadBtnLocator.first()).toBeInTheDocument();
      const downloadBtns = downloadBtnLocator.all();

      // ASSERT
      expect(downloadBtns).toHaveLength(2);
      await expect.element(downloadBtns[0]).toBeInTheDocument();
      await expect.element(downloadBtns[1]).toBeInTheDocument();
    });
  });

  describe('Navigation buttons', () => {
    describe('"Next Page" button', () => {
      it('should render two "Next Page" buttons on initial page load', async () => {
        // ARRANGE & ACT
        await renderPreview();

        const nextBtnLocator = page.getByRole('button', {
          name: 'Next Page',
        });
        await expect.element(nextBtnLocator.first()).toBeInTheDocument();
        const btns = nextBtnLocator.all();

        // ASSERT
        expect(btns).toHaveLength(2);
        await expect.element(btns[0]).toBeInTheDocument();
        await expect.element(btns[1]).toBeInTheDocument();
      });

      it('should not render "Next Page" buttons when document has only one page', async () => {
        // ARRANGE
        const restore = mockNumPagesTemporary(1);

        // ACT
        await renderPreview();
        await expect
          .element(page.getByRole('dialog', { name: 'Preview' }))
          .toBeInTheDocument();

        // ASSERT
        await expect
          .element(page.getByRole('button', { name: 'Next Page' }))
          .not.toBeInTheDocument();

        // CLEANUP
        restore();
      });

      it('should render "Previous Page" buttons after clicking "Next Page"', async () => {
        // ARRANGE
        await renderPreview();
        const user = userEvent.setup();
        const nextBtnLocator = page.getByRole('button', {
          name: 'Next Page',
        });

        // ACT
        await user.click(nextBtnLocator.first());

        // ASSERT
        const previousBtnLocator = page.getByRole('button', {
          name: 'Previous Page',
        });
        await expect.element(previousBtnLocator.first()).toBeInTheDocument();
        expect(previousBtnLocator.all()).toHaveLength(2);
      });

      it('should not render "Next Page" buttons when advancing to the final page', async () => {
        // ARRANGE
        await renderPreview();
        const user = userEvent.setup();
        const nextBtnLocator = page.getByRole('button', {
          name: 'Next Page',
        });
        await user.click(nextBtnLocator.first());

        // ACT
        await user.click(nextBtnLocator.first());

        // ASSERT
        await expect.element(nextBtnLocator).not.toBeInTheDocument();
      });
    });

    describe('"Previous Page" button', () => {
      it('should not render "Previous Page" buttons on the first page', async () => {
        // ARRANGE & ACT
        await renderPreview();
        await expect
          .element(page.getByRole('dialog', { name: 'Preview' }))
          .toBeInTheDocument();

        // ASSERT
        await expect
          .element(page.getByRole('button', { name: 'Previous Page' }))
          .not.toBeInTheDocument();
      });

      it('should hide "Previous Page" buttons after returning to the first page', async () => {
        // ARRANGE
        await renderPreview();
        const user = userEvent.setup();
        const nextBtnLocator = page.getByRole('button', {
          name: 'Next Page',
        });
        await user.click(nextBtnLocator.first());
        const previousBtnLocator = page.getByRole('button', {
          name: 'Previous Page',
        });

        // ACT
        await user.click(previousBtnLocator.first());

        // ASSERT
        await expect.element(previousBtnLocator).not.toBeInTheDocument();
      });
    });
  });

  describe('Canvas and text layer rendering', () => {
    it('should render the resume page canvas', async () => {
      // ARRANGE & ACT
      await renderPreview();

      const canvas = page.getByRole('img', {
        name: 'Resume page canvas',
      });

      // ASSERT
      await expect.element(canvas).toBeInTheDocument();
      await expect.element(canvas).toHaveClass('Preview-Canvas');
    });

    it('should render the transparent text selection layer', async () => {
      // ARRANGE & ACT
      await renderPreview();

      const textLayer = page.getByRole('region', {
        name: 'Text selection layer',
      });

      // ASSERT
      await expect.element(textLayer).toBeInTheDocument();
      await expect
        .element(textLayer)
        .toHaveClass('Preview-TextLayer', 'textLayer');
    });
  });

  describe('Loading and error states', () => {
    it('should render loading indicator when document is loading', async () => {
      // ARRANGE
      const restore = mockInstanceStatusTemporary({ loading: true });

      // ACT
      await renderPreview();

      const loadingText = page.getByText('Loading...');

      // ASSERT
      await expect.element(loadingText).toBeInTheDocument();
      await expect.element(loadingText).toHaveClass('Preview-PdfTextAlt');

      // CLEANUP
      restore();
    });

    it('should render error message when document fails to generate', async () => {
      // ARRANGE
      const restore = mockInstanceStatusTemporary({
        error: 'PDF generation failed',
      });

      // ACT
      await renderPreview();

      const errorText = page.getByText(
        'Something went wrong. Try reloading the page.',
      );

      // ASSERT
      await expect.element(errorText).toBeInTheDocument();
      await expect.element(errorText).toHaveClass('Preview-PdfTextAlt');

      // CLEANUP
      restore();
    });
  });
});
