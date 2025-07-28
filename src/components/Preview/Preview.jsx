/* eslint-disable jsx-a11y/anchor-is-valid */
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

import garamondBold from '@/assets/fonts/EBGaramond-Bold.woff';
import garamondItalic from '@/assets/fonts/EBGaramond-Italic.woff';
import garamondRegular from '@/assets/fonts/EBGaramond-Regular.woff';

import useDebouncedWindowSize from '@/hooks/useDebouncedWindowSize';

import './Preview.scss';

const data = {
  personal: {
    fullName: 'Jobby McJobface',
    jobTitle: 'Senior Frontend Engineer',
    email: 'hey@sheetsresume.com',
    phone: '+7 962 788-20-02',
    address: 'Novosibirsk, Russia',
    summary:
      'Experienced Frontend Engineer with a decade of crafting robust and user-friendly web applications. Specialising in React, I build performant, maintainable, and scalable interfaces. Passionate about clean code, best practices, and delivering exceptional user experiences. Proven ability to collaborate effectively in agile environments and contribute to successful project delivery.',
  },
  links: {
    website: {
      text: 'Portfolio',
      link: '#',
    },
    github: {
      text: 'GitHub',
      link: '#',
    },
    linkedin: {
      text: 'LinkedIn',
      link: '#',
    },
    telegram: {
      text: 'Telegram',
      link: '#',
    },
  },
  skills: {
    languages: [
      {
        id: crypto.randomUUID(),
        value: 'JavaScript',
      },
      {
        id: crypto.randomUUID(),
        value: 'Go',
      },
      {
        id: crypto.randomUUID(),
        value: 'Rust',
      },
    ],
    frameworks: [
      {
        id: crypto.randomUUID(),
        value: 'React',
      },
      {
        id: crypto.randomUUID(),
        value: 'Redux',
      },
      {
        id: crypto.randomUUID(),
        value: 'NextJS',
      },
    ],
    tools: [
      {
        id: crypto.randomUUID(),
        value: 'Git',
      },
      {
        id: crypto.randomUUID(),
        value: 'SVN',
      },
      {
        id: crypto.randomUUID(),
        value: 'AWS',
      },
    ],
  },
  experience: {
    jobs: [
      {
        address: 'LK-99 Valley, PA',
        companyName: 'Boogle',
        duration: 'Oct 2017 - Present',
        id: crypto.randomUUID(),
        jobTitle: 'Principal Software Engineer',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value:
              'Led a team of 10 developers in the successful design, development, and delivery of a scalable and high-performance SaaS platform, resulting in a 30% increase in user engagement and a 20% reduction in response time.',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Architected and implemented a microservices-based architecture using Node.js and Docker, resulting in a more flexible and maintainable system and enabling seamless integration with third-party services.',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Collaborated with cross-functional teams including product management, design, and QA to define project requirements, deliverables, and timelines, ensuring successful product launches.',
          },
        ],
      },
      {
        address: 'LK-99 Valley, PA',
        companyName: 'Nahoo',
        duration: 'Jan 2015 - Sep 2017',
        id: crypto.randomUUID(),
        jobTitle: 'SDE - III',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value:
              'Developed and maintained key features for a large-scale e-commerce platform using React and Redux, improving page load times by 15%.',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Implemented comprehensive unit and integration tests using Jest and Enzyme, increasing code coverage by 25% and reducing bug count by 10%.',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Participated in code reviews and mentored junior developers, fostering a culture of continuous learning and code quality.',
          },
        ],
      },
    ],
    shownJobIndex: 0,
  },
  projects: {
    projects: [
      {
        projectName: 'Resume Constructor',
        stack: 'React, Redux Toolkit, SCSS, @react-pdf/renderer',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value:
              'Developed a dynamic web application allowing users to build and customise professional resumes using a drag-and-drop interface.',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Implemented state management with Redux Toolkit for predictable data flow and efficient updates across the application.',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Integrated @react-pdf/renderer to enable client-side generation and download of PDF resumes directly from the browser.',
          },
        ],
        code: {
          text: 'GitHub Repo',
          link: 'https://github.com/your-username/resume-constructor',
        },
        demo: {
          text: 'Live Demo',
          link: 'https://resume-constructor.example.com',
        },
      },
    ],
    shownProjectIndex: 0,
  },
  education: {
    degrees: [
      {
        uni: 'University of Placeholder',
        degree: 'Bachelor of Science in Computer Science',
        graduation: 'May 2014',
        address: 'Placeholder City, PC',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value: 'Graduated with Honours, GPA: 3.8/4.0',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Completed capstone project: Developed a real-time chat application using Node.js and WebSockets.',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Relevant coursework included Data Structures and Algorithms, Operating Systems, and Software Engineering.',
          },
        ],
      },
    ],
    shownDegreeIndex: 0,
  },
  certifications: {
    certificates: 'If you have any relevant ones; otherwise leave blank',
    skills: 'Strategic Planning, Problem Solving, Leadership, Teamwork, etc',
    interests:
      'Reading, sleeping, yoga, fishing, traveling, Reddit, Bear, Football',
  },
};

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
  header: {
    fontSize: 12,
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
});

const activeSectionIDs = [
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
];

/* activeSectionIDs,
  data,
  isShown,
  possibleSectionIDs,
  onClose, */

export default function Preview({ isShown, onClose }) {
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
                              <Link src={item.link} wrap={false}>
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
          </Page>
        </Document>
      </PDFViewer>
    </Popup>
  );
}
