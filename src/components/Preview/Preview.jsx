import React, { useLayoutEffect, useRef, useState } from 'react';

import { PDFViewer } from '@react-pdf/renderer';

import useDebouncedWindowSize from '@/hooks/useDebouncedWindowSize';

import Popup from '@/components/Popup';

import ResumeDocument from './ResumeDocument';

import closeSrc from '@/assets/icons/cross.svg';

import './Preview.scss';

// TODO: render PDF as an image instead of an embedded PDF.
// TODO: add "Next Page" and "Previeous Page" buttons.
// TODO: add a download button.

// It's how the aspect ratio is defined in the `react-pdf` library.
// https://github.com/diegomura/react-pdf/blob/ee5c96b80326ba4441b71be4c7a85ba9f61d4174/packages/layout/src/page/getSize.ts
const A4_ASPECT_RATIO = 595.28 / 841.89;

export default function Preview({ activeSectionIDs, data, isShown, onClose }) {
  const [iframeHeight, setIframeHeight] = useState(0);
  const popupRef = useRef(null);
  const viewportWidth = useDebouncedWindowSize().innerWidth;

  useLayoutEffect(() => {
    if (isShown && popupRef.current !== null) {
      // Inline padding of the modal. Defined in Preview.scss.
      const paddingInline = parseFloat(
        getComputedStyle(popupRef.current).paddingInline,
      );

      /**
       * Width is calculated automatically. It simply takes up as much space as
       * it can. This is desired. This line calculates what height the iframe
       * should be to preserve the A4 paper aspect ratio in portrait mode.
       */
      setIframeHeight((viewportWidth - 2 * paddingInline) / A4_ASPECT_RATIO);
    }
  }, [isShown, viewportWidth]);

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
      {/* Conditional rendering for this component is necessary since PDF rendering takes a lot of time. But the parent `Popup` component is a different story. It isn't heavy and is implemented as the native `<dialog>` element under the hood. It would be redundant to conditionally render `Popup`. That's why only `PDFViewer` is rendered conditionally. */}
      {isShown && (
        <PDFViewer height={iframeHeight} showToolbar={false}>
          <ResumeDocument activeSectionIDs={activeSectionIDs} data={data} />
        </PDFViewer>
      )}
    </Popup>
  );
}
