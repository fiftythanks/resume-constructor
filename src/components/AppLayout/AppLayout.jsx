import React, { useState } from 'react';

import Navbar from '@/components/Navbar';
import Toolbar from '@/components/Toolbar';

import './AppLayout.scss';

export default function AppLayout({
  activeSectionIDs,
  addSections,
  children,
  clearAll,
  deleteSections,
  fillAll,
  openedSectionID,
  possibleSectionIDs,
  preview,
  reorderSections,
  resetScreenReaderAnnouncement,
  selectSection,
  updateScreenReaderAnnouncement,
}) {
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);

  /**
   * This state determines whether to allow DnD and render delete buttons
   * with `NavItem`s or not.
   */
  const [editorMode, setEditorMode] = useState(false);

  function toggleNavbar() {
    setIsNavbarExpanded(!isNavbarExpanded);

    if (editorMode) setEditorMode(false);
  }

  function toggleEditorMode() {
    setEditorMode(!editorMode);

    if (editorMode) {
      updateScreenReaderAnnouncement('Editor Mode off');
    } else {
      updateScreenReaderAnnouncement(
        'Editor Mode on. To move focus to tabs for editing, press Tab while holding Shift. If you collapse the navbar either by pressing Escape or pressing the "Toggle Navbar" button, the editor mode will be turned off automatically.',
      );
    }
  }

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
        e.preventDefault();

        // TODO: focus should move to the corresponding tabpanel
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
      <main className="AppLayout-Main">{children}</main>
    </div>
  );
}
