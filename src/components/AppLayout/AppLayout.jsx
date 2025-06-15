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
}) {
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);

  function toggleNavbar() {
    setIsNavbarExpanded(!isNavbarExpanded);
  }

  let navbarModifier = 'AppLayout_navbar_';
  navbarModifier += isNavbarExpanded ? 'expanded' : 'hidden';

  return (
    <div className={`AppLayout ${navbarModifier}`}>
      <Navbar
        activeSectionIDs={activeSectionIDs}
        addSections={addSections}
        className="AppLayout-Navbar"
        deleteSections={deleteSections}
        isExpanded={isNavbarExpanded}
        openedSectionID={openedSectionID}
        possibleSectionIDs={possibleSectionIDs}
        reorderSections={reorderSections}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
        selectSection={selectSection}
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
