/* eslint-disable @typescript-eslint/no-unused-vars */
// It disallowed using `crypto`, which is well supported.
/* eslint-disable n/no-unsupported-features/node-builtins */

import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import AppLayout from './AppLayout';

import type { AppLayoutProps } from './AppLayout';
import type {
  ResumeData,
  SectionId,
  SectionIds,
  SectionTitles,
} from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

const DATA: ResumeData = {
  certifications: {
    interests: 'Open Source Development, AI/ML, Technical Writing',
    skills: 'Cloud Architecture, Web Accessibility, Performance Optimization',
    certificates:
      'AWS Certified Solutions Architect, Meta Frontend Developer Certificate',
  },
  education: {
    shownDegreeIndex: 0,
    degrees: [
      {
        address: 'Berkeley, CA',
        degree: 'Bachelor of Science in Computer Science',
        graduation: 'May 2022',
        id: crypto.randomUUID(),
        uni: 'University of California, Berkeley',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value: 'GPA: 3.8/4.0',
          },
          {
            id: crypto.randomUUID(),
            value: "Dean's List: 2019–2022",
          },
          {
            id: crypto.randomUUID(),
            value: 'Senior Project: AI-powered Code Review Assistant',
          },
        ],
      },
    ],
  },
  experience: {
    shownJobIndex: 0,
    jobs: [
      {
        address: 'San Francisco, CA',
        companyName: 'TechCorp Inc.',
        duration: 'Jan 2023 – Present',
        id: crypto.randomUUID(),
        jobTitle: 'Senior Frontend Engineer',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value:
              'Led development of a high-performance React application serving 1M+ users',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Improved application load time by 40% through code splitting and lazy loading',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Mentored junior developers and conducted technical interviews',
          },
        ],
      },
    ],
  },
  links: {
    github: {
      link: 'https://github.com/johndoe',
      text: 'GitHub',
    },
    linkedin: {
      link: 'https://linkedin.com/in/johndoe',
      text: 'LinkedIn',
    },
    telegram: {
      link: 'https://t.me/johndoe',
      text: 'Telegram',
    },
    website: {
      link: 'https://johndoe.dev',
      text: 'Portfolio',
    },
  },
  personal: {
    fullName: 'John Doe',
    jobTitle: 'Frontend Engineer',
    email: 'john.doe@johndoe.com',
    phone: '+1 (555) 555-5555',
    address: '123 Main St, Anytown, CA 91234',
    summary:
      'A highly motivated and skilled frontend engineer with a passion for creating innovative and user-friendly web applications.',
  },
  projects: {
    shownProjectIndex: 0,
    projects: [
      {
        id: crypto.randomUUID(),
        projectName: 'E-commerce Platform',
        stack: 'React, Next.js, TypeScript, GraphQL',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value:
              'Built a scalable e-commerce platform with React and Next.js',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Implemented server-side rendering for optimal SEO performance',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Integrated Stripe payment processing and shopping cart functionality',
          },
        ],
        code: {
          text: 'View Code',
          link: 'https://github.com/johndoe/ecommerce',
        },
        demo: {
          text: 'Live Demo',
          link: 'https://ecommerce-demo.johndoe.dev',
        },
      },
    ],
  },
  skills: {
    frameworks: [
      {
        id: crypto.randomUUID(),
        value: 'React',
      },
      {
        id: crypto.randomUUID(),
        value: 'Next.js',
      },
      {
        id: crypto.randomUUID(),
        value: 'Node.js',
      },
    ],
    languages: [
      {
        id: crypto.randomUUID(),
        value: 'JavaScript',
      },
      {
        id: crypto.randomUUID(),
        value: 'TypeScript',
      },
      {
        id: crypto.randomUUID(),
        value: 'HTML/CSS',
      },
    ],
    tools: [
      {
        id: crypto.randomUUID(),
        value: 'Git',
      },
      {
        id: crypto.randomUUID(),
        value: 'Webpack',
      },
      {
        id: crypto.randomUUID(),
        value: 'Jest',
      },
    ],
  },
};

const POSSIBLE_SECTION_IDS: SectionIds = [
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
];

const SECTION_TITLES: SectionTitles = {
  certifications: 'Certifications',
  education: 'Education',
  experience: 'Work Experience',
  links: 'Links',
  personal: 'Personal Details',
  projects: 'Projects',
  skills: 'Technical Skills',
};

function Tabpanel({ sectionId }: { sectionId: SectionId }) {
  return (
    <div id={`${sectionId}-tabpanel`}>
      <input type="text" />
    </div>
  );
}

function getProps(
  overrides?: Partial<Omit<AppLayoutProps, 'children'>>,
): AppLayoutProps {
  const openedSectionId =
    overrides?.openedSectionId === undefined
      ? 'personal'
      : overrides.openedSectionId;

  return {
    activeSectionIds: structuredClone(POSSIBLE_SECTION_IDS),
    addSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
    children: <Tabpanel sectionId={openedSectionId} />,
    data: cloneDeep(DATA),
    deleteAll() {},
    deleteSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
    editorMode: false,
    fillAll() {},
    isNavbarExpanded: false,
    openedSectionId: 'personal',
    openSection(_sectionId: SectionId) {},
    possibleSectionIds: structuredClone(POSSIBLE_SECTION_IDS),
    reorderSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
    resetScreenReaderAnnouncement() {},
    sectionTitles: structuredClone(SECTION_TITLES),
    toggleEditorMode() {},
    toggleNavbar() {},
    ...overrides,
  };
}

function renderAppLayout(props?: AppLayoutProps) {
  // Necessary for the dialogs "Preview" and "Add Sections".
  render(<div id="popup-root" />);

  render(<AppLayout {...getProps(props)} />);
}

// TEST PLAN
// - [ ] should render
