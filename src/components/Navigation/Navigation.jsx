import React, { useState } from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

import NavItem from '@components/NavItem';
import ToolbarItem from '@components/ToolbarItem';

import capitalize from '@utils/capitalize';

import personalSrc from '@icons/personal.svg';
import linksSrc from '@icons/links.svg';
import skillsSrc from '@icons/skills.svg';
import experienceSrc from '@icons/experience.svg';
import projectsSrc from '@icons/projects.svg';
import educationSrc from '@icons/education.svg';
import certificationsSrc from '@icons/certifications.svg';
import optionsSrc from '@icons/options.svg';
import closeSrc from '@icons/close.svg';
import addSrc from '@icons/add.svg';
import deleteSrc from '@icons/delete.svg';

import './Navigation.scss';

const icons = {
  personal: personalSrc,
  links: linksSrc,
  skills: skillsSrc,
  experience: experienceSrc,
  projects: projectsSrc,
  education: educationSrc,
  certifications: certificationsSrc,
  options: optionsSrc,
  close: closeSrc,
  add: addSrc,
  delete: deleteSrc,
};

export default function Navigation({
  activeSectionIDs,
  openedSectionID,
  selectSection,
  reorderSections,
  addSections,
  deleteSections,
}) {
  // Drag and drop logic
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(e) {
    const { active, over } = e;

    if (active.id !== over.id) {
      const oldIndex = activeSectionIDs.indexOf(active.id);
      const newIndex = activeSectionIDs.indexOf(over.id);

      const newActiveSectionIDs = arrayMove(
        activeSectionIDs,
        oldIndex,
        newIndex,
      );

      reorderSections(newActiveSectionIDs);
    }
  }

  const items = activeSectionIDs.map((sectionID) => (
    <NavItem
      className="Navigation-NavItem"
      iconSrc={icons[sectionID]}
      alt={capitalize(sectionID)}
      isSelected={openedSectionID === sectionID}
      key={sectionID}
      id={sectionID}
      selectSection={() => selectSection(sectionID)}
    />
  ));

  // For navigation controls (add/delete section, reorder sections).
  const [areControlsShown, setAreControlsShown] = useState(false);

  function toggleControls() {
    setAreControlsShown(!areControlsShown);
  }

  const canAddSectionss = activeSectionIDs.length !== 7;
  const canDeleteSections = activeSectionIDs.length !== 1;

  return (
    <nav className="Navigation">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        /**
         * Since the navigation bar will always stay in the same position
         * (or at least won't move beyond the screen almost certainly),
         * there's no need for autoscroll. It also introduces strange behaviour
         * on mobile Firefox, so turning it off is for the best.
         */
        autoScroll={false}
      >
        <SortableContext
          items={activeSectionIDs}
          strategy={verticalListSortingStrategy}
        >
          <ul
            className="Navigation-Items"
            role="tablist"
            aria-label="Resume Sections"
            aria-orientation="vertical"
            aria-owns="personal links skills experience projects education certifications"
          >
            {items}
          </ul>
        </SortableContext>
      </DndContext>
      <div className="Navigation-ControlsWrapper">
        <ToolbarItem
          iconSrc={areControlsShown ? icons.close : icons.options}
          alt="Navigation Controls"
          className="Navigation-ToggleControls"
          attributes={{
            'arial-label': 'Navigation Controls',
            'aria-haspopup': 'menu',
            'aria-expanded': `${areControlsShown}`,
            'aria-controls': 'nav-controls',
            id: 'nav-controls-toggle',
          }}
          action={toggleControls}
        />
        {!areControlsShown ? null : (
          <ul
            className="Navigation-Controls"
            id="nav-controls"
            role="menu"
            aria-labelledby="nav-controls-toggle"
          >
            {!canAddSectionss ? null : (
              <ToolbarItem
                hasInner
                isListItem
                className="Navigation-Control"
                iconSrc={icons.add}
                alt="Add New Sections"
                innerAttributes={{ role: 'menuitem' }}
                action={() => {
                  addSections(['skills', 'personal']);
                  toggleControls();
                }}
              />
            )}
            {
              {
                /**
                 * Here will be a popup that lets users pick one or several
                 * sections to add.
                 */
              }
            }

            {
              {
                /**
                 * Maybe, instead of this delete button, I will add a button
                 * that will add to each navigation item a drag handle and a
                 * delete button; just like it is going to be on large screens
                 * by default.
                 */
              }
            }
            {!canDeleteSections ? null : (
              <ToolbarItem
                hasInner
                isListItem
                className="Navigation-Control"
                iconSrc={icons.delete}
                alt="Delete Sections"
                innerAttributes={{ role: 'menuitem' }}
                action={() => {
                  deleteSections(['skills', 'personal', 'projects']);
                  toggleControls();
                }}
              />
            )}
            {
              {
                /**
                 * If I do what's written above, there will be nothing. But
                 * if I do not, there will be a popup that lets you choose what
                 * section to delete.
                 *
                 * And a change-layout button that will add drag handles to the
                 * navigation items.
                 */
              }
            }
          </ul>
        )}
      </div>
    </nav>
  );
}
