import React from 'react';

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

import capitalize from '@utils/capitalize';

import personalSrc from '@icons/personal.svg';
import linksSrc from '@icons/links.svg';
import skillsSrc from '@icons/skills.svg';
import experienceSrc from '@icons/experience.svg';
import projectsSrc from '@icons/projects.svg';
import educationSrc from '@icons/education.svg';
import certificationsSrc from '@icons/certifications.svg';
import optionsSrc from '@icons/options.svg';

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
};

export default function Navigation({
  activeSectionIDs,
  openedSectionID,
  selectSection,
  reorderSections,
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
          >
            {items}
          </ul>
        </SortableContext>
      </DndContext>
    </nav>
  );
}
