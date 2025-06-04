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

  // eslint-disable-next-line no-unused-vars
  const [activeSections, setActiveSections] = useState([
    'personal',
    'links',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
  ]);

  const [openedSectionID, setOpenedSectionID] = useState(null);

  function openSection(sectionID) {
    setOpenedSectionID(sectionID);
  }

  return (
    <Navigation
      activeSections={activeSections}
      openedSectionID={openedSectionID}
      openSection={openSection}
    />
  );
}
