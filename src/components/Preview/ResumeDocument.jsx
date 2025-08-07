import React from 'react';

import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import Icon from './Icon';
import ResumeSection from './ResumeSection';

/**
 * They're of the TTF format by design. It brings much better performance
 * because WOFF is a compressed format, and the decompression takes a lot
 * of time for the `react-pdf`'s engine.
 *
 * Also, don't forget to implement some logic that will import a particular
 * font subset depending on the language of the resume. Or maybe just add
 * Russian letters to the subset by default. Anyway,
 * TODO: add Russian-language support.
 */
import garamondBold from '@/assets/fonts/EBGaramond-Bold-latin.ttf';
import garamondItalic from '@/assets/fonts/EBGaramond-Italic-latin.ttf';
import garamondRegular from '@/assets/fonts/EBGaramond-Regular-latin.ttf';

Font.register({
  family: 'EBGaramond',
  fonts: [
    {
      src: garamondRegular,
      fontStyle: 'normal',
      fontWeight: 'normal',
    },
    {
      src: garamondItalic,
      fontStyle: 'italic',
      fontWeight: 'normal',
    },
    // Bold normal.
    {
      src: garamondBold,
      fontStyle: 'normal',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'EBGaramond',
    fontSize: 12,
    paddingHorizontal: '1.25cm',
    paddingVertical: '1cm',
  },
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

// Using it by default for all sections and fields adds redundancy.
// TODO: examine where you need conditional rendering and where you don't. Refactor accordingly.
export default function ResumeDocument({ activeSectionIDs, data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          {data.personal.fullName && (
            <Text style={styles.fullName}>{data.personal.fullName}</Text>
          )}
          <View style={styles.headerInfo}>
            {data.personal.jobTitle && (
              <Text style={styles.jobTitle}>{data.personal.jobTitle}</Text>
            )}
            {(data.personal.phone || data.personal.address) && (
              <Text>
                {!activeSectionIDs.includes('links') && data.personal.email && (
                  <>
                    <Link
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
                          <Link href={item.link} src={item.link} wrap={false}>
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
  );
}
