import React from 'react';
import NavItem from '@components/NavItem';
import personalSrc from '@icons/personal.svg';
import linksSrc from '@icons/links.svg';
import skillsSrc from '@icons/skills.svg';
import experienceSrc from '@icons/experience.svg';
import projectsSrc from '@icons/projects.svg';
import educationSrc from '@icons/education.svg';
import certificationsSrc from '@icons/certifications.svg';
import capitalize from '@utils/capitalize';
import './Navigation.scss';

const icons = {
  personal: personalSrc,
  links: linksSrc,
  skills: skillsSrc,
  experience: experienceSrc,
  projects: projectsSrc,
  education: educationSrc,
  certifications: certificationsSrc,
};

export default function Navigation({
  activeSections,
  openedSectionID,
  openSection,
}) {
  const items = activeSections.map((sectionID) => (
    <NavItem
      className="Navigation-NavItem"
      iconSrc={icons[sectionID]}
      alt={capitalize(sectionID)}
      isOpened={openedSectionID === sectionID}
      key={sectionID}
      id={sectionID}
      openSection={() => openSection(sectionID)}
    />
  ));

  return <ul className="Navigation">{items}</ul>;
}
