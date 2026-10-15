import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import Navbar from './Navbar';

import type { NavbarProps } from './Navbar';
import type { SectionId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

const PROPS: NavbarProps = {
  activeSectionIds: possibleSectionIds,
  addSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
  canAddSections: true,
  deleteSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
  editorMode: false,
  reorderSections(_newActiveSectionIds: ReadonlyDeep<SectionId[]>) {},
  resetScreenReaderAnnouncement() {},
  selectedSectionId: 'personal',
  selectSection(_sectionId: SectionId) {},
  toggleEditorMode() {},
};

function getProps(overrides?: Partial<NavbarProps>): NavbarProps {
  return cloneDeep({ ...PROPS, ...overrides });
}

function PopupContainer() {
  return <div id="popup-root" />;
}

function NavbarToggle() {
  return <div aria-label="Navigation" id="toggle-navbar" />;
}

async function renderComponents(navbarProps?: NavbarProps) {
  await render(<PopupContainer />);
  await render(<NavbarToggle />);

  if (navbarProps === undefined) {
    await render(<Navbar {...getProps()} />);
  } else {
    await render(<Navbar {...navbarProps} />);
  }
}

describe('Navbar', () => {
  describe('DnD', () => {
    it('should call `reorderSections` with the reordered section IDs when a draggable tab is dragged and dropped onto another draggable tab in editor mode', async () => {
      // Arrange
      const reorderSectionsMock = vi.fn(
        (_newActiveSectionIds: ReadonlyDeep<SectionId[]>) => {},
      );
      await renderComponents(
        getProps({ editorMode: true, reorderSections: reorderSectionsMock }),
      );
      const user = userEvent.setup();

      const sourceTab = page.getByRole('tab', {
        name: sectionTitles.education,
      });
      const targetTab = page.getByRole('tab', {
        name: sectionTitles.skills,
      });

      // Act
      await user.dragAndDrop(sourceTab, targetTab, { force: true });

      // Assert
      expect(reorderSectionsMock).toHaveBeenCalledTimes(1);
      expect(reorderSectionsMock).toHaveBeenCalledWith([
        'personal',
        'links',
        'education',
        'skills',
        'experience',
        'projects',
        'certifications',
      ]);
    });

    it('should not call `reorderSections` when a tab is dragged and dropped while editor mode is off', async () => {
      // Arrange
      const reorderSectionsMock = vi.fn(
        (_newActiveSectionIds: ReadonlyDeep<SectionId[]>) => {},
      );
      await renderComponents(
        getProps({ editorMode: false, reorderSections: reorderSectionsMock }),
      );
      const user = userEvent.setup();

      const sourceTab = page.getByRole('tab', {
        name: sectionTitles.education,
      });
      const targetTab = page.getByRole('tab', {
        name: sectionTitles.skills,
      });

      // Act
      await user.dragAndDrop(sourceTab, targetTab);

      // Assert
      expect(reorderSectionsMock).not.toHaveBeenCalled();
    });

    it('should not allow dragging the "Personal Details" tab even in editor mode', async () => {
      // Arrange
      const reorderSectionsMock = vi.fn(
        (_newActiveSectionIds: ReadonlyDeep<SectionId[]>) => {},
      );
      await renderComponents(
        getProps({ editorMode: true, reorderSections: reorderSectionsMock }),
      );
      const user = userEvent.setup();

      const personalTab = page.getByRole('tab', {
        name: sectionTitles.personal,
      });
      const targetTab = page.getByRole('tab', {
        name: sectionTitles.skills,
      });

      // Act
      await user.dragAndDrop(personalTab, targetTab, { force: true });

      // Assert
      expect(reorderSectionsMock).not.toHaveBeenCalled();
    });
  });
});
