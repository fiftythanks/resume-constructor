import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import AddSections from './AddSections';

import type { AddSectionsProps } from './AddSections';
import type { SectionId, SectionIds, SectionTitles } from '@/types/resumeData';

// TODO: "should close after the last addable section is added".

/**
 * Since `Popup` is portalled to `popup-root`, there must exist an
 * element with such an ID.
 */
function Container() {
  return <div id="popup-root" />;
}

const ACTIVE_SECTION_IDS: SectionId[] = [
  'personal',
  'links',
  'education',
  'experience',
];

const POSSIBLE_SECTION_IDS: SectionIds = [
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
];

function getAddableSectionIds(): SectionId[] {
  return POSSIBLE_SECTION_IDS.filter(
    (sectionId) => !ACTIVE_SECTION_IDS.includes(sectionId),
  );
}

const SECTION_TITLES: SectionTitles = {
  certifications: 'Certifications',
  education: 'Education',
  experience: 'Work Experience',
  links: 'Links',
  personal: 'Personal Details',
  projects: 'Projects',
  skills: 'Technical Skills',
};

function getProps(overrides?: Partial<AddSectionsProps>): AddSectionsProps {
  return {
    activeSectionIds: ACTIVE_SECTION_IDS,
    addSections: () => {},
    isShown: true,
    onClose: () => {},
    possibleSectionIds: POSSIBLE_SECTION_IDS,
    sectionTitles: SECTION_TITLES,
    ...overrides,
  };
}

describe('AddSections', () => {
  it('should render with an accessible name "Add Sections"', () => {
    render(<Container />);
    render(<AddSections {...getProps()} />);

    const popup = screen.getByRole('dialog', { name: 'Add Sections' });

    expect(popup).toBeInTheDocument();
  });

  it('should render add-buttons for all inactive sections', () => {
    render(<Container />);
    render(<AddSections {...getProps()} />);

    const addableSectionIds = getAddableSectionIds();

    addableSectionIds.forEach((sectionId) => {
      const addBtn = screen.getByRole('button', {
        name: `Add ${SECTION_TITLES[sectionId]}`,
      });

      expect(addBtn).toBeInTheDocument();
    });
  });

  it('should render add-buttons only for inactive sections', () => {
    render(<Container />);
    render(<AddSections {...getProps()} />);

    ACTIVE_SECTION_IDS.forEach((sectionId) => {
      const addBtn = screen.queryByRole('button', {
        name: `Add ${SECTION_TITLES[sectionId]}`,
      });

      expect(addBtn).not.toBeInTheDocument();
    });
  });

  it('should render an "Add All Sections" button', () => {
    render(<Container />);
    render(<AddSections {...getProps()} />);

    const addAllSectionsBtn = screen.getByRole('button', {
      name: 'Add All Sections',
    });

    expect(addAllSectionsBtn).toBeInTheDocument();
  });

  it('should call `onClose` when "Add All Sections" is clicked', async () => {
    const onCloseMock = jest.fn();
    render(<Container />);
    render(<AddSections {...getProps({ onClose: onCloseMock })} />);
    const user = userEvent.setup();

    const addAllSectionsBtn = screen.getByRole('button', {
      name: 'Add All Sections',
    });

    await user.click(addAllSectionsBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should render a close button', () => {
    render(<Container />);
    render(<AddSections {...getProps()} />);

    const closeBtn = screen.getByRole('button', { name: 'Close Popup' });

    expect(closeBtn).toBeInTheDocument();
  });

  it('should call `onClose` when the close button is clicked', async () => {
    const onCloseMock = jest.fn();
    render(<Container />);
    render(<AddSections {...getProps({ onClose: onCloseMock })} />);
    const user = userEvent.setup();
    const closeBtn = screen.getByRole('button', { name: 'Close Popup' });

    await user.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
