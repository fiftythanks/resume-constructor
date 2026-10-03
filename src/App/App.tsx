import { RefObject, useCallback, useMemo, useRef } from 'react';

import { SpeedInsights } from '@vercel/speed-insights/react';
import { tabbable } from 'tabbable';

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

import loadFonts from './loadFonts';

import type { SectionId } from '@/types/resumeData';

// TODOs, FIXMEs and dilemmas

// DILEMMA: `modifiers[]` props aren't convenient. Should I make them simple strings?
// DILEMMA: Are tabulletPointanels controlled by tabs valid when the tabs are hidden? Should I conditionalise related ARIA attributes?

/**
 * So that you don't lose everything when the browser crashes abruply or
 * something else happens. And simply because it's more user-friendly.
 */
// TODO: add local storage use for the data.

// TODO: change all compile-time constants' names to UPPER_SNAKE_CASE.

/**
 * The app needs a Russian version, since I will be using it for my job search.
 * There needs to be a toggle or something like that. Russian language needs a
 * different typeface, and the style of the resume should be a bit different, I
 * think.
 */
// TODO: add Russian version.

/**
 * I've just stumbled upon one great article about accessibility,
 * https://blog.logrocket.com/ux-design/wcag-3-vs-2-ux/.
 * I should go through it thoroughly, as well as through all basic WCAG
 * guidelines, and see what I should change in the app to reasonably
 * improve accessibility.
 */
// TODO: fix color contrasts with APCA (https://apcacontrast.com/).
// TODO: go through the article and change whatever needs a change.

// TODO: determine which fields are those that aren't desirable in a software engineer's resume and add hints to their labels that explain that they aren't desirable.

/**
 * Maybe it should be a separate component that contains a guide on creating a
 * software engineer's resume. Maybe it should be in the form of small tips near
 * every field all around the application.
 *
 * The latter is what I've seen in all other similar projects. The former is a
 * much more interesting and impressive approach that would probably put the
 * project to a new level.
 */
// TODO: add tips on how to fill each section properly, in which order sections should be, etc.

export default function App() {
  const personal = useRef<HTMLElement>(null);
  const links = useRef<HTMLElement>(null);
  const skills = useRef<HTMLElement>(null);
  const experience = useRef<HTMLElement>(null);
  const projects = useRef<HTMLElement>(null);
  const education = useRef<HTMLElement>(null);
  const certifications = useRef<HTMLElement>(null);

  // TODO: Explain the purpose of this object.
  const sectionRefs: Record<SectionId, RefObject<HTMLElement | null>> = useMemo(
    () => ({
      personal,
      links,
      skills,
      experience,
      projects,
      education,
      certifications,
    }),
    [],
  );

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

  /**
   * FIXME: Because they aren't properly imported, the functions' JSDoc comments
   * aren't shared. Either there's some workaround or I should export all
   * functions from the hook or somewhere else to see JSDoc.
   */
  const {
    activeSectionIds,
    addAllSections,
    addSections,
    deleteAll,
    deleteSections,
    editorMode,
    openSection,
    openedSectionId,
    reorderSections,
    resetScreenReaderAnnouncement,
    screenReaderAnnouncement,
    toggleEditorMode,
    updateScreenReaderAnnouncement,
  } = useAppState();

  /**
   * Load fonts for the React-PDF preview when the app mounts to prevent any
   * font-loading issues.
   */
  loadFonts();

  // Section components.
  const sections = {
    personal: (
      <Personal
        data={data.personal}
        functions={personalFunctions}
        ref={personal}
      />
    ),
    links: <Links data={data.links} functions={linksFunctions} ref={links} />,
    skills: (
      <Skills
        data={data.skills}
        functions={skillsFunctions}
        ref={skills}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    experience: (
      <Experience
        data={data.experience}
        functions={experienceFunctions}
        ref={experience}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    projects: (
      <Projects
        data={data.projects}
        functions={projectsFunctions}
        ref={projects}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    education: (
      <Education
        data={data.education}
        functions={educationFunctions}
        ref={education}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    certifications: (
      <Certifications
        data={data.certifications}
        functions={certificationsFunctions}
        ref={certifications}
      />
    ),
  };

  /**
   * Moves focus to the first tabbable element of the corresponding tabpanel if
   * the active tab is focused at the moment of invocation.
   */
  const focusSection = useCallback(() => {
    if (sectionRefs[openedSectionId].current === null) return;

    /**
     * `tabbable` has no support for `jsdom`. Its documentation highly
     * recommends setting `displayCheck` to `none` for `jsdom`, therefore.
     *
     * TODO: A better solution might be to define a global mock like this:
     *
     * ```
     * // __mocks__/tabbable.js
     *
     * const lib = jest.requireActual('tabbable');
     *
     * const tabbable = {
     *    ...lib,
     *    tabbable: (node, options) => lib.tabbable(node, { ...options, displayCheck: 'none' }),
     *    focusable: (node, options) => lib.focusable(node, { ...options, displayCheck: 'none' }),
     *    isFocusable: (node, options) => lib.isFocusable(node, { ...options, displayCheck: 'none' }),
     *    isTabbable: (node, options) => lib.isTabbable(node, { ...options, displayCheck: 'none' }),
     * };
     *
     * module.exports = tabbable;
     * ```
     */
    // TODO: Verify `sectionRefs[openedSectionId].current.isConnected` and `allTabbable[0].isConnected` before invoking `.focus()`.
    const allTabbable = tabbable(sectionRefs[openedSectionId].current, {
      displayCheck: process.env.NODE_ENV === 'test' ? 'none' : 'full',
    });

    if (allTabbable.length > 0) allTabbable[0].focus();
  }, [openedSectionId, sectionRefs]);

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
        focusSection={focusSection}
        openedSectionId={openedSectionId}
        openSection={openSection}
        reorderSections={reorderSections}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
        toggleEditorMode={toggleEditorMode}
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
