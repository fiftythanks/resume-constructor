import React, { useCallback, useState } from 'react';

import * as renderer from '@react-pdf/renderer';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import '@testing-library/jest-dom';

import getFilledData from '@/hooks/useResumeData/getFilledData';

import Preview from './Preview';

import type { PreviewProps } from './Preview';
import type { SectionId } from '@/types/resumeData';
import type { DocumentProps, UsePDFInstance } from '@react-pdf/renderer';

const INITIAL_ACTIVE_SECTION_IDS: SectionId[] = [
  'personal',
  'education',
  'experience',
];

const INITIAL_DATA = getFilledData();

/**
 * Changes the implementation of `usePDF` to alter document loading status.
 *
 * @returns A restore function to get back to the default implementation.
 */
function mockInstanceStatusTemporary({
  error = null,
  loading = false,
}: {
  error?: null | string;
  loading?: boolean;
}) {
  const usePDFDefaultImplementation = (
    renderer.usePDF as jest.Mock
  ).getMockImplementation();

  const usePDFTemporary = () => {
    const [document] = useState<UsePDFInstance>({
      blob: null,
      error,
      loading,
      url: 'blob:mock-pdf-url',
    });

    const setDocumentMock = useCallback(
      (_newDocument: React.ReactElement<DocumentProps>) => {},
      [],
    );

    return [document, setDocumentMock];
  };

  (renderer.usePDF as jest.Mock).mockImplementation(usePDFTemporary);

  return function restore() {
    (renderer.usePDF as jest.Mock).mockImplementation(
      usePDFDefaultImplementation,
    );
  };
}

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

  const originalResult = defaultImplementation
    ? defaultImplementation('url')
    : null;

  const temporaryImplementation = () => ({
    promise: {
      getPage: originalResult?.promise?.getPage ?? jest.fn(),
      numPages,
    },
  });

  (pdfjsLib.getDocument as jest.Mock).mockImplementation(
    temporaryImplementation,
  );

  return function restore() {
    (pdfjsLib.getDocument as jest.Mock).mockImplementation(
      defaultImplementation,
    );
  };
}

function getProps(overrides?: Partial<PreviewProps>): PreviewProps {
  return {
    activeSectionIds: structuredClone(INITIAL_ACTIVE_SECTION_IDS),
    data: cloneDeep(INITIAL_DATA),
    isShown: true,
    onClose: () => {},
    ...overrides,
  };
}

describe('Preview', () => {
  beforeEach(() => {
    const popupRoot = document.createElement('div');
    popupRoot.id = 'popup-root';
    document.body.appendChild(popupRoot);

    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({} as CanvasRenderingContext2D);
  });

  afterEach(() => {
    document.getElementById('popup-root')?.remove();
    jest.restoreAllMocks();
  });

  it('should render with an accessible name "Preview"', async () => {
    // Arrange & Act
    render(<Preview {...getProps()} />);

    // Assert
    const popup = await screen.findByRole('dialog', { name: 'Preview' });

    expect(popup).toBeInTheDocument();
  });

  describe('Download buttons', () => {
    it('should render two download buttons with text "Download"', async () => {
      // Arrange & Act
      render(<Preview {...getProps()} />);

      // Assert
      const downloadBtns = await screen.findAllByRole('button', {
        name: 'Download',
      });

      expect(downloadBtns).toHaveLength(2);
    });
  });

  describe('Close Popup Button', () => {
    it('should render with an accessible name "Close Popup"', async () => {
      // Arrange & Act
      render(<Preview {...getProps()} />);

      // Assert
      const btn = await screen.findByRole('button', { name: 'Close Popup' });

      expect(btn).toBeInTheDocument();
    });

    it('should call `onClose` when clicked', async () => {
      // Arrange
      const mockFn = jest.fn();
      render(<Preview {...getProps({ onClose: mockFn })} />);
      const user = userEvent.setup();
      const btn = await screen.findByRole('button', { name: 'Close Popup' });

      jest
        .spyOn(HTMLDialogElement.prototype, 'close')
        .mockImplementation(function (this: HTMLDialogElement) {
          this.dispatchEvent(new Event('close'));
        });

      // Act
      await user.click(btn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation Buttons', () => {
    describe('Next Page', () => {
      it('should render two buttons "Next Page"', async () => {
        // Arrange & Act
        render(<Preview {...getProps()} />);

        // Assert
        const btns = await screen.findAllByRole('button', {
          name: 'Next Page',
        });

        expect(btns).toHaveLength(2);
        expect(btns[0]).toBeInTheDocument();
        expect(btns[1]).toBeInTheDocument();
      });

      it('should not render "Next Page" buttons when the opened page is the last page', async () => {
        // Arrange
        const restoreMock = mockWithNumPagesTemporary(1);

        try {
          render(<Preview {...getProps()} />);

          // Act: wait for document controls to settle
          await screen.findAllByRole('button', { name: 'Download' });

          // Assert
          expect(
            screen.queryByRole('button', { name: 'Next Page' }),
          ).not.toBeInTheDocument();
        } finally {
          restoreMock();
        }
      });

      it('should increment `openedPageIndex` on click', async () => {
        // Arrange
        render(<Preview {...getProps()} />);
        const user = userEvent.setup();

        const btns = await screen.findAllByRole('button', {
          name: 'Next Page',
        });

        // Act
        await user.dblClick(btns[0]);

        // Assert
        /**
         * Since there are only three pages (as defined in our mock), the
         * buttons must not render after two clicks.
         */
        expect(btns[0]).not.toBeInTheDocument();
        expect(btns[1]).not.toBeInTheDocument();
      });
    });

    describe('Previous Page', () => {
      it('should not render "Previous Page" buttons when the opened page is the first page', async () => {
        // Arrange & Act
        render(<Preview {...getProps()} />);

        // Wait for document controls to settle
        await screen.findAllByRole('button', { name: 'Download' });

        // Assert
        expect(
          screen.queryByRole('button', { name: 'Previous Page' }),
        ).not.toBeInTheDocument();
      });

      it('should render two buttons "Previous Page"', async () => {
        // Arrange
        render(<Preview {...getProps()} />);
        const user = userEvent.setup();

        const nextPageBtn = (
          await screen.findAllByRole('button', { name: 'Next Page' })
        )[0];

        /**
         * Navigating forwards is necessary because "Previous Page" buttons do
         * not render when the first page is opened.
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
        render(<Preview {...getProps()} />);
        const user = userEvent.setup();

        const nextPageBtn = (
          await screen.findAllByRole('button', { name: 'Next Page' })
        )[0];

        // Increment `openedPageIndex` to 2
        await user.click(nextPageBtn);

        const previousPageBtns = await screen.findAllByRole('button', {
          name: 'Previous Page',
        });

        // Act
        await user.click(previousPageBtns[0]);

        // Assert
        expect(previousPageBtns[0]).not.toBeInTheDocument();
        expect(previousPageBtns[1]).not.toBeInTheDocument();
      });
    });
  });

  describe('Document', () => {
    it('should render "Loading..." while the document is loading', async () => {
      // Arrange
      const restoreMock = mockInstanceStatusTemporary({ loading: true });

      try {
        render(<Preview {...getProps()} />);

        // Act
        const paragraph = await screen.findByText('Loading...');

        // Assert
        expect(paragraph).toBeInTheDocument();
      } finally {
        restoreMock();
      }
    });

    it('should render error message when an error occurs during document loading', async () => {
      // Arrange
      const restoreMock = mockInstanceStatusTemporary({
        error: 'Some error',
      });

      try {
        render(<Preview {...getProps()} />);

        // Act
        const paragraph = await screen.findByText(
          'Something went wrong. Try reloading the page.',
        );

        // Assert
        expect(paragraph).toBeInTheDocument();
      } finally {
        restoreMock();
      }
    });
  });
});
