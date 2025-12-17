import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import possibleSectionIds from '@/utils/possibleSectionIds';

import AddSections from './AddSections';

import type { AddSectionsProps } from './AddSections';
import type { SectionId, SectionTitles } from '@/types/resumeData';

/**
 * Since `Popup` is portalled to `popup-root`, there must exist an
 * element with such an ID.
 */
function Container() {
  return <div id="popup-root" />;
}

//! It is important that there are more than two sections to add.
const ACTIVE_SECTION_IDS: SectionId[] = [
  'personal',
  'links',
  'education',
  'experience',
];

function getAddableSectionIds(): SectionId[] {
  return possibleSectionIds.filter(
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
    possibleSectionIds,
    activeSectionIds: ACTIVE_SECTION_IDS,
    addSections: () => {},
    isShown: true,
    onClose: () => {},
    sectionTitles: SECTION_TITLES,
    ...overrides,
  };
}

// TODO: should close when Escape is pressed.

describe('AddSections', () => {
  it('should render with an accessible name "Add Sections" when `isShown === true`', () => {
    render(<Container />);
    render(<AddSections {...getProps()} />);

    const popup = screen.getByRole('dialog', { name: 'Add Sections' });

    expect(popup).toBeInTheDocument();
  });

  it('should not render when `isShown === false`', () => {
    render(<Container />);
    render(<AddSections {...getProps({ isShown: false })} />);

    const popup = screen.queryByRole('dialog', { name: 'Add Sections' });

    expect(popup).not.toBeInTheDocument();
  });

  it('should call `onClose` on close', () => {
    const onCloseMock = jest.fn();
    render(<Container />);
    render(<AddSections {...getProps({ onClose: onCloseMock })} />);
    const popup = screen.getByRole('dialog', { name: 'Add Sections' });

    /**
     * JSDOM hasn't implemented HTMLDialogElement properly yet, so the `close`
     * event won't fire when the popup is closed. I had to come up with
     * a workaround in this test. This is the best thing I could've thought of
     * at the moment.
     */
    fireEvent(popup, new Event('close'));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should render a heading "Add Sections"', () => {
    render(<Container />);
    render(<AddSections {...getProps()} />);

    const heading = screen.getByRole('heading', { name: 'Add Sections' });

    expect(heading).toBeInTheDocument();
  });

  describe('add-buttons', () => {
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

    it('should call `addSections` when an "Add [section title]" button is clicked, with the corresponding ID passed to it', async () => {
      const addSectionsMock = jest.fn((_sectionIds: SectionId[]) => {});
      render(<Container />);
      render(<AddSections {...getProps({ addSections: addSectionsMock })} />);
      const user = userEvent.setup();
      const addableSectionIds = getAddableSectionIds();
      const sectionToAddId = addableSectionIds[0];

      const btn = screen.getByRole('button', {
        name: `Add ${SECTION_TITLES[sectionToAddId]}`,
      });

      await user.click(btn);

      expect(addSectionsMock).toHaveBeenCalledTimes(1);
      expect(addSectionsMock).toHaveBeenCalledWith([sectionToAddId]);
    });

    it("should focus the next section's add-button if the added section isn't the last one", async () => {
      render(<Container />);
      render(<AddSections {...getProps()} />);
      const user = userEvent.setup();
      const addableSectionIds = getAddableSectionIds();

      const firstAddBtn = screen.getByRole('button', {
        name: `Add ${SECTION_TITLES[addableSectionIds[0]]}`,
      });

      const secondAddBtn = screen.getByRole('button', {
        name: `Add ${SECTION_TITLES[addableSectionIds[1]]}`,
      });

      firstAddBtn.focus();

      await user.keyboard('{Enter}');

      expect(secondAddBtn).toHaveFocus();
    });

    it("should focus the previous section's add-button if the added section is the last and isn't the only addable section", async () => {
      render(<Container />);
      render(<AddSections {...getProps()} />);
      const user = userEvent.setup();
      const addableSectionIds = getAddableSectionIds();

      const lastAddBtn = screen.getByRole('button', {
        name: `Add ${SECTION_TITLES[addableSectionIds.at(-1)!]}`,
      });

      const oneBeforeLastAddBtn = screen.getByRole('button', {
        name: `Add ${SECTION_TITLES[addableSectionIds.at(-2)!]}`,
      });

      lastAddBtn.focus();

      await user.keyboard('{Enter}');

      expect(oneBeforeLastAddBtn).toHaveFocus();
    });

    it('should call `onClose` if the added section is the only addable section', async () => {
      const onCloseMock = jest.fn();
      const activeSectionIds = possibleSectionIds.toSpliced(-1, 1);
      const props = getProps({ activeSectionIds, onClose: onCloseMock });
      render(<Container />);
      render(<AddSections {...props} />);
      const user = userEvent.setup();
      const addableSectionId = possibleSectionIds.at(-1)!;
      const addableSectionTitle = SECTION_TITLES[addableSectionId];

      const addBtn = screen.getByRole('button', {
        name: `Add ${addableSectionTitle}`,
      });

      addBtn.focus();

      await user.keyboard('{Enter}');

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should render an "Add All Sections" button', () => {
      render(<Container />);
      render(<AddSections {...getProps()} />);

      const addAllSectionsBtn = screen.getByRole('button', {
        name: 'Add All Sections',
      });

      expect(addAllSectionsBtn).toBeInTheDocument();
    });
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
