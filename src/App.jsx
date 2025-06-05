import React, { useState } from 'react';
// import Main from '@layout/Main';
// import Toolbar from '@components/Toolbar';
import Navigation from '@components/Navigation';

export default function App() {
  /* 
    <>
      <Toolbar className="Toolbar" />
      <Main className="Main" />
    </> 
  */

  const [activeSectionIDs, setActiveSectionIDs] = useState([
    'personal',
    'links',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
  ]);

  function reorderSections(newActiveSectionIDs) {
    setActiveSectionIDs(newActiveSectionIDs);
  }

  const [openedSectionID, setOpenedSectionID] = useState(null);

  function openSection(sectionID) {
    setOpenedSectionID(sectionID);
  }

  return (
    <Navigation
      activeSectionIDs={activeSectionIDs}
      openedSectionID={openedSectionID}
      selectSection={openSection}
      reorderSections={reorderSections}
    />
  );
}
