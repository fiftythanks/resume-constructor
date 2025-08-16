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
 */
import garamondBold from '@/assets/fonts/EBGaramond-Bold.ttf';
import garamondItalic from '@/assets/fonts/EBGaramond-Italic.ttf';
import garamondRegular from '@/assets/fonts/EBGaramond-Regular.ttf';

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

// TODO: centralise link items in the Links section.
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
// FIXME: if there are more than one page, components get squashed and the second page doesn't appear.
export default function ResumeDocument({ activeSectionIDs, data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          render={() => (
            <>
              <Text
                style={styles.fullName}
                render={() =>
                  data.personal.fullName !== '' && `${data.personal.fullName}`
                }
              />
              <View
                style={styles.headerInfo}
                render={() => (
                  <>
                    <Text
                      style={styles.jobTitle}
                      render={() =>
                        data.personal.jobTitle !== '' &&
                        `${data.personal.jobTitle}`
                      }
                    />
                    <Text
                      render={() =>
                        (data.personal.phone !== '' ||
                          data.personal.address !== '') && (
                          <>
                            {/* FIXME: it shouldn't be the `activeSectionIDs` check, since you can add a section and leave it empty. It should be a check of whether there are links present. */}
                            {!activeSectionIDs.includes('links') &&
                              data.personal.email !== '' && (
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

                            {data.personal.phone !== '' && (
                              <>
                                {data.personal.phone}
                                {data.personal.address !== '' && '  |  '}
                              </>
                            )}
                            {data.personal.address !== '' &&
                              data.personal.address}
                          </>
                        )
                      }
                    />

                    <View
                      style={styles.links}
                      render={() =>
                        // FIXME: it shouldn't be the `activeSectionIDs` check, since you can add a section and leave it empty. It should be a check of whether there are links present.
                        // TODO: change the Telegram link to a generic link in case something else needs to be added.
                        activeSectionIDs.includes('links') && (
                          <>
                            <View
                              style={styles.linksItem}
                              render={() =>
                                data.personal.email !== '' && (
                                  <>
                                    <Icon
                                      style={styles.linksIcon}
                                      type="email"
                                    />
                                    <Text
                                      render={() => (
                                        <Link
                                          href={`mailto:${data.personal.email}`}
                                          src={`mailto:${data.personal.email}`}
                                          wrap={false}
                                        >
                                          {data.personal.email}
                                        </Link>
                                      )}
                                    />
                                  </>
                                )
                              }
                            />
                            {Object.entries(data.links).map(([type, item]) => (
                              <View
                                key={type}
                                style={styles.linksItem}
                                render={() =>
                                  item.text !== '' && (
                                    <>
                                      <Icon
                                        style={styles.linksIcon}
                                        type={type}
                                      />
                                      <Text
                                        render={() => (
                                          <Link
                                            href={item.link}
                                            src={item.link}
                                            wrap={false}
                                          >
                                            {item.text}
                                          </Link>
                                        )}
                                      />
                                    </>
                                  )
                                }
                              />
                            ))}
                          </>
                        )
                      }
                    />
                  </>
                )}
              />
            </>
          )}
        />
        <View
          style={styles.section}
          render={() =>
            data.personal.summary !== '' && <Text>{data.personal.summary}</Text>
          }
        />
        <View
          render={() => (
            <>
              {activeSectionIDs.map(
                (sectionID) =>
                  sectionID !== 'personal' &&
                  sectionID !== 'links' && (
                    <ResumeSection
                      data={data[sectionID]}
                      key={sectionID}
                      sectionName={sectionID}
                      style={styles.section}
                    />
                  ),
              )}
            </>
          )}
        />
      </Page>
    </Document>
  );
}
