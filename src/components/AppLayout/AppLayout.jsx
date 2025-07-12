import React, { useRef } from 'react';

import Navbar from '@/components/Navbar';
import Toolbar from '@/components/Toolbar';

import './AppLayout.scss';

const focusableNodes = ['button', 'input', 'textarea'];

const titles = {
  personal: 'Personal Details',
  links: 'Links',
  skills: 'Technical Skills',
  experience: 'Work Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications',
};

export default function AppLayout({
  activeSectionIDs,
  addSections,
  children,
  clearAll,
  deleteSections,
  editorMode,
  fillAll,
  isNavbarExpanded,
  openedSectionID,
  // eslint-disable-next-line no-unused-vars
  openSection,
  possibleSectionIDs,
  preview,
  reorderSections,
  resetScreenReaderAnnouncement,
  selectSection,
  toggleEditorMode,
  toggleNavbar,
}) {
  // For keyboard navigation.
  let wasToolbarLastFocusedElem = useRef(false);

  const canAddSections =
    possibleSectionIDs.filter(
      (sectionID) => !activeSectionIDs.includes(sectionID),
    ).length > 0;

  let navbarModifier = 'AppLayout_navbar_';
  navbarModifier += isNavbarExpanded ? 'expanded' : 'hidden';

  // Keyboard navigation.
  function handleKeyDown(e) {
    const { id } = e.target;

    if (e.key === 'Tab') {
      if (
        possibleSectionIDs.includes(id) &&
        id !== openedSectionID &&
        e.shiftKey &&
        !editorMode
      ) {
        e.preventDefault();

        if (
          activeSectionIDs.indexOf(id) <
          activeSectionIDs.indexOf(openedSectionID)
        ) {
          document.getElementById('toggle-navbar').focus();
        } else {
          document.getElementById(openedSectionID).focus();
        }
      }

      if (id === openedSectionID) {
        if (e.shiftKey) {
          e.preventDefault();

          document.getElementById('toggle-navbar').focus();
        } else if (!editorMode) {
          e.preventDefault();

          document
            .getElementById(`${openedSectionID}-tabpanel`)
            .querySelectorAll(focusableNodes)[0]
            .focus();

          wasToolbarLastFocusedElem = false;
        }
      }

      if (id === 'edit-sections') {
        e.preventDefault();

        if (!e.shiftKey) {
          document.getElementById('toggle-controls').focus();

          // `Shift+Tab` cases.
        } else if (!editorMode) {
          if (canAddSections) {
            document.getElementById('add-sections').focus();
          } else if (openedSectionID === null) {
            document.getElementById('personal').focus();
          } else {
            document.getElementById(openedSectionID).focus();
          }

          // Editor mode cases.
        } else if (canAddSections) {
          document.getElementById('add-sections').focus();
        } else {
          document.getElementById(`delete-${activeSectionIDs.at(-1)}`).focus();
        }
      }

      if (id === 'toggle-navbar') {
        if (isNavbarExpanded) {
          if (!e.shiftKey) {
            e.preventDefault();
            if (editorMode || openedSectionID === null) {
              document.getElementById('personal').focus();
            } else {
              document.getElementById(openedSectionID).focus();
            }
          }
        }
      }

      if (
        (id === 'toggle-controls' ||
          id === 'clear-all' ||
          id === 'fill-all' ||
          id === 'preview') &&
        !e.shiftKey
      ) {
        e.preventDefault();

        document
          .querySelector('main')
          .querySelectorAll(focusableNodes)[0]
          .focus();

        wasToolbarLastFocusedElem.current = true;
      }

      const firstFocusableTabpanelNode = document
        .querySelector('main')
        .querySelectorAll(focusableNodes)[0];

      if (
        e.target === firstFocusableTabpanelNode &&
        e.shiftKey &&
        isNavbarExpanded &&
        !wasToolbarLastFocusedElem.current
      ) {
        e.preventDefault();
        document.getElementById(openedSectionID).focus();
      }
    }

    if (e.key === 'Escape') {
      const deleteSectionBtns = possibleSectionIDs.map(
        (sectionID) => `delete-${sectionID}`,
      );

      const navbarChildrenIDs = [
        ...possibleSectionIDs,
        ...deleteSectionBtns,
        'add-sections',
        'edit-sections',
      ];

      if (navbarChildrenIDs.includes(id)) {
        if (editorMode) {
          toggleEditorMode();

          if (/^delete-/.test(id)) {
            const sectionID = id.replace('delete-', '');
            document.getElementById(sectionID).focus();
          }
        } else {
          toggleNavbar();
          document.getElementById('toggle-navbar').focus();
        }
      }
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={`AppLayout ${navbarModifier}`} onKeyDown={handleKeyDown}>
      <Navbar
        activeSectionIDs={activeSectionIDs}
        addSections={addSections}
        canAddSections={canAddSections}
        className="AppLayout-Navbar"
        deleteSections={deleteSections}
        editorMode={editorMode}
        isExpanded={isNavbarExpanded}
        possibleSectionIDs={possibleSectionIDs}
        reorderSections={reorderSections}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
        selectedSectionID={openedSectionID}
        selectSection={selectSection}
        titles={titles}
        toggleEditorMode={toggleEditorMode}
      />
      <Toolbar
        className="AppLayout-Toolbar"
        clearAll={clearAll}
        fillAll={fillAll}
        isNavbarExpanded={isNavbarExpanded}
        preview={preview}
        toggleNavbar={toggleNavbar}
      />
      {/* This heading is here intentionally for layout purposes. */}
      <h1 className="AppLayout-Title" id="app-layout-heading">
        {titles[`${openedSectionID}`]}
      </h1>
      {/* TODO: add navigation buttons to this `<main>` wrapper. */}
      <main
        aria-owns={`app-layout-heading ${openedSectionID}-tabpanel`}
        className={`AppLayout-Main ${isNavbarExpanded ? ` AppLayout-Main_navbar_expanded` : ''}`.trimEnd()}
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
