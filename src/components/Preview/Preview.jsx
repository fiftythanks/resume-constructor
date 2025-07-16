/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useLayoutEffect, useRef, useState } from 'react';

import {
  Document,
  Link,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import Popup from '@/components/Popup';

import './Preview.scss';

const data = {
  personal: {
    fullName: 'Jobby McJobface',
    jobTitle: 'Software Engineer',
    email: 'hey@sheetsresume.com',
    phone: '+1 (329) 802-9951',
    address: 'Denver, CO',
    summary:
      'Experienced Frontend Engineer with a decade of crafting robust and user-friendly web applications. Specialising in React, I build performant, maintainable, and scalable interfaces. Passionate about clean code, best practices, and delivering exceptional user experiences. Proven ability to collaborate effectively in agile environments and contribute to successful project delivery.',
  },
  links: {
    website: {
      text: 'Porfolio',
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

const styles = StyleSheet.create({
  iframe: {
    border: 0,
    padding: 0,
  },
  document: {},
  page: {},
  section: {},
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
       * should be to preserve the A4 paper aspect ratio in portrait mode
       * (which is 1:sqrt(2)).
       */
      setIframeHeight((window.innerWidth - 2 * paddingInline) * Math.sqrt(2));
    }
  }, [isShown]);

  return (
    <Popup
      block="Preview"
      externalRef={popupRef}
      id="preview-modal"
      //! TODO: Temporally reversed for convenience
      isShown={!isShown}
      title="Preview"
      onClose={onClose}
    >
      {/* TODO: don't forget a11y! */}
      <PDFViewer
        height={iframeHeight}
        showToolbar={false}
        style={styles.iframe}
      >
        {/* TODO: add close button. */}
        {/* TODO: add download button. */}
        <Document style={styles.document}>
          <Page className="Preview-Page" size="A4">
            <View className="Preview-Section">
              {data.personal.fullName !== '' && (
                <View className="Preview-Subsection Preview-Subsection_name">
                  <Text>{data.personal.fullName}</Text>
                </View>
              )}
              {data.personal.jobTitle !== '' && (
                <View className="Preview-Subsection Preview-Subsection_jobTitle">
                  <Text>{data.personal.jobTitle}</Text>
                </View>
              )}
              {(data.personal.phone !== '' || data.personal.address !== '') && (
                <View className="Preview-Subsection Preview-Subsection_contact">
                  {!activeSectionIDs.includes('links') &&
                    data.personal.email !== '' && (
                      <Text>
                        <Link
                          className="Preview-Link"
                          href={`mailto:${data.personal.email}`}
                          src={`mailto:${data.personal.email}`}
                          wrap={false}
                        >
                          {data.personal.email}
                        </Link>
                      </Text>
                    )}
                  {data.personal.phone !== '' && (
                    <Text>{data.personal.phone}</Text>
                  )}
                  {data.personal.address !== '' && (
                    <Text>{data.personal.address}</Text>
                  )}
                </View>
              )}
              <View>
                <Text>
                  <Link
                    className="Preview-Link"
                    src={`mailto:${data.personal.email}`}
                    wrap={false}
                  >
                    {data.personal.email}
                  </Link>
                </Text>
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </Popup>
  );
}
