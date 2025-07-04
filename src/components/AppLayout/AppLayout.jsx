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
  possibleSectionIDs,
  preview,
  reorderSections,
  resetScreenReaderAnnouncement,
  selectSection,
  toggleEditorMode,
  toggleNavbar,
}) {
  // For keyboard navigation.
  const lastFocusedElemIDRef = useRef('');

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

          lastFocusedElemIDRef.current = openedSectionID;
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

        lastFocusedElemIDRef.current = 'toggle-controls';
      }

      const firstFocusableTabpanelNode = document
        .querySelector('main')
        .querySelectorAll(focusableNodes)[0];

      if (
        e.target === firstFocusableTabpanelNode &&
        e.shiftKey &&
        isNavbarExpanded &&
        (lastFocusedElemIDRef.current === null ||
          lastFocusedElemIDRef.current === openedSectionID)
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
      <header className="AppLayout-Header">
        <h1 className="AppLayout-Title">{titles[`${openedSectionID}`]}</h1>
      </header>
      {children}
      {/* TODO: add "Previous" and "Next" buttons. */}
    </div>
  );
}
