import React, { useState } from 'react';
import Navigation from '@components/Navigation';
import capitalize from '@utils/capitalize';

export default function App() {
  const [screenReaderAnouncement, setScreenReaderAnnouncement] = useState(null);
  const [openedSectionID, setOpenedSectionID] = useState(null);

  function resetScreenReaderAnnouncement() {
    setScreenReaderAnnouncement(null);
  }

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

      const areAllSectionsActive =
        newActiveSectionIDs.filter(
          (sectionID) => !possibleSectionIDs.includes(sectionID),
        ).length === 0;

      if (areAllSectionsActive) {
        if (sectionIDs.length === 1) {
          setScreenReaderAnnouncement(`${capitalize(sectionIDs[0])} added.`);
        } else {
          // The first item is omitted because its the "Personal" page.
          setScreenReaderAnnouncement(
            `${capitalize(sectionIDs[1])} ${sectionIDs.slice(2).join(', ')} added.`,
          );
        }
      }
    } else {
      throw new TypeError(
        'Incorrect argument! `addSections` accepts only arrays.',
      );
    }
  }

  function deleteSections(sectionIDs) {
    if (Array.isArray(sectionIDs)) {
      const newActiveSectionIDs = activeSectionIDs.slice();
      let newScreenReaderAnnouncement = '';
      let wasOpenedSectionDeleted = false;

      sectionIDs.forEach((sectionID, i) => {
        if (possibleSectionIDs.includes(sectionID)) {
          if (
            activeSectionIDs.includes(sectionID) &&
            sectionID !== 'personal'
          ) {
            newActiveSectionIDs.splice(
              newActiveSectionIDs.indexOf(sectionID),
              1,
            );

            newScreenReaderAnnouncement +=
              i === 0 ? capitalize(sectionID) : `, ${sectionID}`;

            if (openedSectionID === sectionID) {
              setOpenedSectionID(null);
              wasOpenedSectionDeleted = true;
            }
          }
        } else {
          throw new Error(
            'Incorrect section ID. Available section IDs: personal, links, skills, experience, projects, education, certifications',
          );
        }
      });

      setActiveSectionIDs(newActiveSectionIDs);

      if (newScreenReaderAnnouncement !== '') {
        newScreenReaderAnnouncement += ' deleted.';

        if (wasOpenedSectionDeleted) {
          newScreenReaderAnnouncement +=
            ' Opened section deleted. No section is opened currently.';
        }

        setScreenReaderAnnouncement(newScreenReaderAnnouncement);
      }
    } else {
      throw new TypeError(
        'Incorrect argument! `deleteSections` accepts only arrays.',
      );
    }
  }

  return (
    <>
      <span className="visually-hidden" aria-live="polite">
        {screenReaderAnouncement}
      </span>
      <Navigation
        activeSectionIDs={activeSectionIDs}
        openedSectionID={openedSectionID}
        selectSection={openSection}
        reorderSections={reorderSections}
        addSections={addSections}
        deleteSections={deleteSections}
        possibleSectionIDs={possibleSectionIDs}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
      />
    </>
  );
}
