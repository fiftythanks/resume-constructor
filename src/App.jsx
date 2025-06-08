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

  const possibleSectionIDs = [
    'personal',
    'links',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
  ];

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

  function addSections(sectionIDs) {
    if (Array.isArray(sectionIDs)) {
      const newActiveSectionIDs = activeSectionIDs.slice();

      sectionIDs.forEach((sectionID) => {
        if (possibleSectionIDs.includes(sectionID)) {
          if (!activeSectionIDs.includes(sectionID)) {
            newActiveSectionIDs.push(sectionID);
          }
        } else {
          throw new Error(
            'Incorrect section ID. Available section IDs: personal, links, skills, experience, projects, education, certifications',
          );
        }
      });

      setActiveSectionIDs(newActiveSectionIDs);
    } else {
      throw new TypeError(
        'Incorrect argument! `addSections` accepts only arrays.',
      );
    }
  }

  function deleteSections(sectionIDs) {
    if (Array.isArray(sectionIDs)) {
      const newActiveSectionIDs = activeSectionIDs.slice();

      sectionIDs.forEach((sectionID) => {
        if (possibleSectionIDs.includes(sectionID)) {
          if (activeSectionIDs.includes(sectionID)) {
            newActiveSectionIDs.splice(
              newActiveSectionIDs.indexOf(sectionID),
              1,
            );
          }
        } else {
          throw new Error(
            'Incorrect section ID. Available section IDs: personal, links, skills, experience, projects, education, certifications',
          );
        }
      });

      setActiveSectionIDs(newActiveSectionIDs);
    } else {
      throw new TypeError(
        'Incorrect argument! `deleteSections` accepts only arrays.',
      );
    }
  }

  return (
    <Navigation
      activeSectionIDs={activeSectionIDs}
      openedSectionID={openedSectionID}
      selectSection={openSection}
      reorderSections={reorderSections}
      addSections={addSections}
      deleteSections={deleteSections}
      possibleSectionIDs={possibleSectionIDs}
    />
  );
}
