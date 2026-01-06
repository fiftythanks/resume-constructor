import React, { RefObject, useEffect, useRef, useState } from 'react';

import { SpeedInsights } from '@vercel/speed-insights/react';

import useAppState from '@/hooks/useAppState';
import useResumeData from '@/hooks/useResumeData/useResumeData';

import Certifications from '@/pages/Certifications';
import Education from '@/pages/Education';
import Experience from '@/pages/Experience';
import Links from '@/pages/Links';
import Personal from '@/pages/Personal';
import Projects from '@/pages/Projects';
import Skills from '@/pages/Skills';

import AppLayout from '@/components/AppLayout';

import neverReached from '@/utils/neverReached';

import loadFonts from './loadFonts';

// TODOs, FIXMEs and dilemmas

// ? `modifiers[]` props aren't convenient. Should I make them simple strings?
// ? Are tabulletPointanels controlled by tabs valid when the tabs are hidden? Should I conditionalise related ARIA attributes?

/**
 * So that you don't lose everything when the browser crashes abruply or
 * something else happens. And simply because it's more user-friendly.
 */
// TODO (application-wide): add local storage use for the data.

// TODO (application-wide): change all compile-time constants' names to UPPER_SNAKE_CASE.

/**
 * The app needs a Russian version, since I will be using it for my job search.
 * There needs to be a toggle or something like that. Russian language needs a
 * different typeface, and the style of the resume should be a bit different, I
 * think.
 */
// TODO (application-wide): add Russian version.

/**
 * I've just stumbled upon one great article about accessibility,
 * https://blog.logrocket.com/ux-design/wcag-3-vs-2-ux/.
 * I should go through it thoroughly, as well as through all basic WCAG
 * guidelines, and see what I should change in the app to reasonably
 * improve accessibility.
 */
// TODO (application-wide): fix color contrasts with APCA (https://apcacontrast.com/).
// TODO (application-wide): go through the article and change whatever needs a change.

// TODO (application-wide): determine which fields are those that aren't desirable in a software engineer's resume and add hints to their labels that explain that they aren't desirable.

/**
 * Maybe it should be a separate component that contains a guide on creating a
 * software engineer's resume. Maybe it should be in the form of small tips near
 * every field all around the application.
 *
 * The latter is what I've seen in all other similar projects. The former is a
 * much more interesting and impressive approach that would probably put the
 * project to a new level.
 */
// TODO (application-wide): add tips on how to fill each section properly, in which order sections should be, etc.

export default function App() {
  const firstTabbablePersonal = useRef<HTMLInputElement>(null);
  const firstTabbableLinks = useRef<HTMLInputElement>(null);
  const firstTabbableSkills = useRef<HTMLButtonElement>(null);
  const firstTabbableExperience = useRef<HTMLButtonElement>(null);
  const firstTabbableProjects = useRef<HTMLButtonElement>(null);
  const firstTabbableEducation = useRef<HTMLButtonElement>(null);
  const firstTabbableCertifications = useRef<HTMLTextAreaElement>(null);

  const [firstTabbable, setFirstTabbable] = useState<
    RefObject<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | null>
  >(firstTabbablePersonal);

  const {
    certificationsFunctions,
    clear,
    clearAll,
    data,
    educationFunctions,
    experienceFunctions,
    fillAll,
    linksFunctions,
    personalFunctions,
    projectsFunctions,
    skillsFunctions,
  } = useResumeData();

  // FIXME (application-wide): because they aren't properly imported, the functions' JSDoc comments aren't shared. Either there's some workaround or I should export all functions from the hook or somewhere else to see JSDoc.
  const {
    activeSectionIds,
    addAllSections,
    addSections,
    deleteAll,
    deleteSections,
    editorMode,
    isNavbarExpanded,
    openSection,
    openedSectionId,
    reorderSections,
    resetScreenReaderAnnouncement,
    screenReaderAnnouncement,
    toggleEditorMode,
    toggleNavbar,
    updateScreenReaderAnnouncement,
  } = useAppState();

  useEffect(() => {
    switch (openedSectionId) {
      case 'certifications':
        setFirstTabbable(firstTabbableCertifications);
        break;
      case 'education':
        setFirstTabbable(firstTabbableEducation);
        break;
      case 'experience':
        setFirstTabbable(firstTabbableExperience);
        break;
      case 'links':
        setFirstTabbable(firstTabbableLinks);
        break;
      case 'personal':
        setFirstTabbable(firstTabbablePersonal);
        break;
      case 'projects':
        setFirstTabbable(firstTabbableProjects);
        break;
      case 'skills':
        setFirstTabbable(firstTabbableSkills);
        break;
      default:
        neverReached(openedSectionId);
    }
  }, [openedSectionId]);

  /**
   * Load fonts for the preview when the app mounts to prevent any font-loading
   * issues.
   */
  loadFonts();

  // Section components.
  const sections = {
    personal: (
      <Personal
        data={data.personal}
        firstTabbable={firstTabbablePersonal}
        functions={personalFunctions}
      />
    ),
    links: (
      <Links
        data={data.links}
        firstTabbable={firstTabbableLinks}
        functions={linksFunctions}
      />
    ),
    skills: (
      <Skills
        data={data.skills}
        functions={skillsFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        setFirstTabbable={(node) => {
          if (node !== null) firstTabbableSkills.current = node;
        }}
      />
    ),
    experience: (
      <Experience
        data={data.experience}
        firstTabbable={firstTabbableExperience}
        functions={experienceFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    projects: (
      <Projects
        data={data.projects}
        firstTabbable={firstTabbableProjects}
        functions={projectsFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    education: (
      <Education
        data={data.education}
        firstTabbable={firstTabbableEducation}
        functions={educationFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    certifications: (
      <Certifications
        data={data.certifications}
        firstTabbable={firstTabbableCertifications}
        functions={certificationsFunctions}
      />
    ),
  };

  return (
    <>
      <span
        aria-live="polite"
        className="visually-hidden"
        data-testid="screen-reader-announcement"
      >
        {screenReaderAnnouncement}
      </span>
      <AppLayout
        activeSectionIds={activeSectionIds}
        addSections={addSections}
        data={data}
        editorMode={editorMode}
        firstTabbable={firstTabbable}
        isNavbarExpanded={isNavbarExpanded}
        openedSectionId={openedSectionId}
        openSection={openSection}
        reorderSections={reorderSections}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
        toggleEditorMode={toggleEditorMode}
        toggleNavbar={toggleNavbar}
        // TODO: Rename to not confuse clearing, deleting and doing both.
        deleteAll={() => {
          clearAll();
          deleteAll();
        }}
        // TODO: Rename to not confuse clearing, deleting and doing both.
        deleteSections={(sectionIds) => {
          clear(sectionIds);
          deleteSections(sectionIds);
        }}
        fillAll={() => {
          addAllSections();
          fillAll();
        }}
      >
        {sections[openedSectionId]}
      </AppLayout>
      <SpeedInsights />
    </>
  );
}
