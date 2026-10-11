import { Fragment } from 'react';
import type { ReactElement } from 'react';

import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import neverReached from '@/utils/neverReached';

import Icon from './Icon';
import ResumeSection from './ResumeSection';

import type { Links, ResumeData, SectionId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

const styles = StyleSheet.create({
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerInfo: {
    lineHeight: 1.05,
  },
  jobTitle: {
    marginTop: -4,
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
  page: {
    fontFamily: 'EBGaramond',
    fontSize: 12,
    paddingHorizontal: '1.25cm',
    paddingVertical: '1cm',
  },
  section: {
    borderTopColor: 'black',
    borderTopWidth: 0.8,
    paddingVertical: 5,
  },
});

interface ResumeDocumentProps {
  activeSectionIds: SectionId[];
  data: ResumeData;
}

/**
 * The entire PDF document template rendered by `@react-pdf/renderer`.
 */
export default function ResumeDocument({
  activeSectionIds,
  data,
}: ReadonlyDeep<ResumeDocumentProps>) {
  const hasLinksSection = activeSectionIds.includes('links');

  // ==========================================================================
  // CONTACT ELEMENTS
  // ==========================================================================

  const contactElements: ReactElement[] = [];

  // Email
  if (!hasLinksSection && data.personal.email !== '') {
    contactElements.push(
      <Link
        href={`mailto:${data.personal.email}`}
        key="email"
        src={`mailto:${data.personal.email}`}
      >
        {data.personal.email}
      </Link>,
    );
  }

  // Phone number.
  if (data.personal.phone !== '') {
    contactElements.push(<Text key="phone">{data.personal.phone}</Text>);
  }

  // Home address.
  if (data.personal.address !== '') {
    contactElements.push(<Text key="address">{data.personal.address}</Text>);
  }

  // ==========================================================================
  // CUSTOM LINKS
  // ==========================================================================

  const activeCustomLinks = Object.entries(data.links).filter(
    ([_, item]) => item.text !== '',
  );
  const hasVisibleLinks =
    hasLinksSection &&
    (data.personal.email !== '' || activeCustomLinks.length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          {data.personal.fullName !== '' && (
            <Text style={styles.fullName}>{data.personal.fullName}</Text>
          )}

          <View style={styles.headerInfo}>
            {data.personal.jobTitle !== '' && (
              <Text style={styles.jobTitle}>{data.personal.jobTitle}</Text>
            )}

            {contactElements.length > 0 && (
              <Text>
                {contactElements.map((element, index) => (
                  <Fragment key={index}>
                    {index > 0 && '  |  '}
                    {element}
                  </Fragment>
                ))}
              </Text>
            )}

            {hasVisibleLinks && (
              <View style={styles.links}>
                {data.personal.email !== '' && (
                  <View style={styles.linksItem}>
                    <Icon style={styles.linksIcon} type="email" />
                    <Link
                      href={`mailto:${data.personal.email}`}
                      src={`mailto:${data.personal.email}`}
                    >
                      {data.personal.email}
                    </Link>
                  </View>
                )}

                {activeCustomLinks.map(([type, item]) => (
                  <View key={type} style={styles.linksItem}>
                    <Icon style={styles.linksIcon} type={type as keyof Links} />
                    <Link href={item.link} src={item.link}>
                      {item.text}
                    </Link>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {data.personal.summary !== '' && (
          <View style={styles.section}>
            <Text>{data.personal.summary}</Text>
          </View>
        )}

        {activeSectionIds.map((sectionId) => {
          switch (sectionId) {
            case 'certifications':
              return (
                <ResumeSection
                  data={data.certifications}
                  key="certifications"
                  sectionName="certifications"
                  style={styles.section}
                />
              );

            case 'education':
              return (
                <ResumeSection
                  data={data.education}
                  key="education"
                  sectionName="education"
                  style={styles.section}
                />
              );

            case 'experience':
              return (
                <ResumeSection
                  data={data.experience}
                  key="experience"
                  sectionName="experience"
                  style={styles.section}
                />
              );

            case 'links':
              return null;

            case 'personal':
              return null;

            case 'projects':
              return (
                <ResumeSection
                  data={data.projects}
                  key="projects"
                  sectionName="projects"
                  style={styles.section}
                />
              );
            case 'skills':
              return (
                <ResumeSection
                  data={data.skills}
                  key="skills"
                  sectionName="skills"
                  style={styles.section}
                />
              );

            default:
              neverReached(sectionId);
          }
        })}
      </Page>
    </Document>
  );
}
