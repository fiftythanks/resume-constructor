import React from 'react';

import useAppState from '@/hooks/useAppState';
import useResumeData from '@/hooks/useResumeData';

import Certifications from '@/pages/Certifications';
import Education from '@/pages/Education';
import Experience from '@/pages/Experience';
import Links from '@/pages/Links';
import Personal from '@/pages/Personal';
import Projects from '@/pages/Projects';
import Skills from '@/pages/Skills';

import AppLayout from '@/components/AppLayout';

// --------- Application-wide TODOs, FIXMEs and dilemmas ---------

// ? `modifiers[]` props aren't convenient. Should I make them simple strings?

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

// ? Are tabpanels controlled by tabs valid when the tabs are hidden? Should I conditionalise related ARIA attributes?

// --------- Component-specific TODOs, FIXMEs and questions ---------

export default function App() {
  const {
    certificationsFunctions,
    clear,
    data,
    educationFunctions,
    experienceFunctions,
    linksFunctions,
    personalFunctions,
    projectFunctions,
    skillsFunctions,
  } = useResumeData();

  const {
    activeSectionIDs,
    addSections,
    deleteAll,
    deleteSections,
    editorMode,
    fillAll,
    isNavbarExpanded,
    openSection,
    openedSectionID,
    possibleSectionIDs,
    reorderSections,
    resetScreenReaderAnnouncement,
    screenReaderAnnouncement,
    toggleEditorMode,
    toggleNavbar,
    updateScreenReaderAnnouncement,
  } = useAppState();

  // Section components.
  const sections = {
    personal: <Personal data={data.personal} functions={personalFunctions} />,
    links: <Links data={data.links} functions={linksFunctions} />,
    skills: (
      <Skills
        data={data.skills}
        functions={skillsFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    experience: (
      <Experience
        data={data.experience}
        functions={experienceFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    projects: (
      <Projects
        data={data.projects}
        functions={projectFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    education: (
      <Education
        data={data.education}
        functions={educationFunctions}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    ),
    certifications: (
      <Certifications
        data={data.certifications}
        functions={certificationsFunctions}
      />
    ),
  };

  return (
    <>
      <span aria-live="polite" className="visually-hidden">
        {screenReaderAnnouncement}
      </span>
      <AppLayout
        activeSectionIDs={activeSectionIDs}
        addSections={addSections}
        data={data}
        // TODO (application-wide): do something with `deleteAll` and `deleteSections`. Functions from `useResumeData` and `useAppState` shouldn't be coupled. Should they?
        deleteAll={() => deleteAll(clear)}
        deleteSections={(sectionIDs) => deleteSections(sectionIDs, clear)}
        editorMode={editorMode}
        fillAll={fillAll}
        isNavbarExpanded={isNavbarExpanded}
        openedSectionID={openedSectionID}
        openSection={openSection}
        possibleSectionIDs={possibleSectionIDs}
        reorderSections={reorderSections}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
        selectSection={openSection}
        toggleEditorMode={toggleEditorMode}
        toggleNavbar={toggleNavbar}
      >
        {sections[openedSectionID]}
      </AppLayout>
    </>
  );
}
