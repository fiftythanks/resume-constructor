import React, { useLayoutEffect, useRef, useState } from 'react';

import {
  Document,
  Font,
  Link,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import Popup from '@/components/Popup';

import Icon from './Icon';
import ResumeSection from './ResumeSection';

import garamondBold from '@/assets/fonts/EBGaramond-Bold.woff';
import garamondItalic from '@/assets/fonts/EBGaramond-Italic.woff';
import garamondRegular from '@/assets/fonts/EBGaramond-Regular.woff';

import useDebouncedWindowSize from '@/hooks/useDebouncedWindowSize';

import './Preview.scss';

//! TODO: why does it take so much time when loading? Something's wrong. Fix it.
Font.register({
  family: 'EBGaramond',
  fonts: [
    // Regular.
    {
      src: garamondRegular,
    },
    // Normal italic.
    {
      src: garamondItalic,
      fontStyle: 'italic',
    },
    // Bold normal.
    {
      src: garamondBold,
      fontWeight: 'bold',
    },
  ],
});

// It's how the aspect ratio is defined in the `react-pdf` library.
// https://github.com/diegomura/react-pdf/blob/ee5c96b80326ba4441b71be4c7a85ba9f61d4174/packages/layout/src/page/getSize.ts
const A4_ASPECT_RATIO = 595.28 / 841.89;

const styles = StyleSheet.create({
  iframe: {
    border: 0,
    padding: 0,
  },
  document: {},
  page: {
    fontFamily: 'EBGaramond',
    fontSize: 12,
    paddingHorizontal: '1.25cm',
    paddingVertical: '1cm',
  },
  header: {},
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerInfo: {
    lineHeight: 1.05,
  },
  jobTitle: {
    marginTop: '-4pt',
  },
  links: {
    display: 'flex',
    flexDirection: 'row',
    gap: 15,
  },
  linksIcon: {
    alignSelf: 'center',
  },
  linksItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: 3,
  },
  section: {
    borderTopWidth: 0.8,
    borderTopColor: 'black',
    paddingVertical: 5,
  },
});

export default function Preview({ activeSectionIDs, data, isShown, onClose }) {
  const [iframeHeight, setIframeHeight] = useState(0);
  const popupRef = useRef(null);
  const viewportWidth = useDebouncedWindowSize().innerWidth;

  useLayoutEffect(() => {
    //! TODO: isShown is temporarily reversed for convenience
    if (!isShown && popupRef.current !== null) {
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
      //! TODO: Temporarily reversed for convenience
      isShown={!isShown}
      title="Preview"
      onClose={onClose}
    >
      {/* TODO: don't forget a11y! */}
      <PDFViewer
        className="Preview-Iframe"
        height={iframeHeight}
        showToolbar={false}
        style={styles.iframe}
      >
        {/* TODO: add close button. */}
        {/* TODO: add download button. */}
        <Document style={styles.document}>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              {data.personal.fullName && (
                <Text style={styles.fullName}>{data.personal.fullName}</Text>
              )}
              <View style={styles.headerInfo}>
                {data.personal.jobTitle && (
                  <Text style={styles.jobTitle}>{data.personal.jobTitle}</Text>
                )}
                {(data.personal.phone || data.personal.address) && (
                  <Text>
                    {!activeSectionIDs.includes('links') &&
                      data.personal.email && (
                        <>
                          <Link
                            className="Preview-Link"
                            href={`mailto:${data.personal.email}`}
                            src={`mailto:${data.personal.email}`}
                            wrap={false}
                          >
                            {data.personal.email}
                          </Link>
                          {'  |  '}
                        </>
                      )}
                    {data.personal.phone && (
                      <>
                        {data.personal.phone}
                        {data.personal.address && '  |  '}
                      </>
                    )}
                    {data.personal.address && data.personal.address}
                  </Text>
                )}
                {activeSectionIDs.includes('links') && (
                  <View style={styles.links}>
                    {data.personal.email && (
                      <View style={styles.linksItem}>
                        <Icon style={styles.linksIcon} type="email" />
                        <Text>
                          <Link
                            href={`mailto:${data.personal.email}`}
                            src={`mailto:${data.personal.email}`}
                            wrap={false}
                          >
                            {data.personal.email}
                          </Link>
                        </Text>
                      </View>
                    )}
                    {Object.entries(data.links).map(
                      ([type, item]) =>
                        item.text && (
                          <View key={type} style={styles.linksItem}>
                            <Icon style={styles.linksIcon} type={type} />
                            <Text>
                              <Link
                                href={item.link}
                                src={item.link}
                                wrap={false}
                              >
                                {item.text}
                              </Link>
                            </Text>
                          </View>
                        ),
                    )}
                  </View>
                )}
              </View>
            </View>
            {data.personal.summary && (
              <View style={styles.section}>
                <Text>{data.personal.summary}</Text>
              </View>
            )}
            {activeSectionIDs.map((sectionID) => {
              if (sectionID !== 'personal' && sectionID !== 'links') {
                return (
                  <ResumeSection
                    data={data[sectionID]}
                    key={sectionID}
                    sectionName={sectionID}
                    style={styles.section}
                  />
                );
              }

              return null;
            })}
          </Page>
        </Document>
      </PDFViewer>
    </Popup>
  );
}
