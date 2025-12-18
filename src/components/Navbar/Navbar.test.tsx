import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clsx } from 'clsx';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import Navbar from './Navbar';

import type { NavbarProps } from './Navbar';
import type { SectionId, SectionTitle } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

const PROPS: NavbarProps = {
  activeSectionIds: possibleSectionIds,
  addSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
  canAddSections: true,
  deleteSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
  editorMode: false,
  isExpanded: true,
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

function renderComponents(navbarProps?: NavbarProps) {
  render(<PopupContainer />);
  render(<NavbarToggle />);

  if (navbarProps === undefined) {
    render(<Navbar {...getProps()} />);
  } else {
    render(<Navbar {...navbarProps} />);
  }
}

function getDeleteBtn(sectionId: SectionId) {
  if (sectionId === 'personal') return null;

  return screen.getByRole('button', {
    name: `Delete ${sectionTitles[sectionId]}`,
  });
}

describe('Navbar', () => {
  it('should render a navigation with an accessible name derived from an element with an ID "toggle-navbar" when `isExpanded === true`', () => {
    renderComponents();

    const nav = screen.getByRole('navigation', { name: 'Navigation' });

    expect(nav).toBeInTheDocument();
  });

  it('should not render a navigation with an accessible name derived from an element with an ID "toggle-navbar" when `isExpanded === false`', () => {
    renderComponents(getProps({ isExpanded: false }));

    const nav = screen.queryByRole('navigation', { name: 'Navigation' });

    // This class sets the `display: none` property.
    expect(nav).toHaveClass('Navbar_hidden');
  });

  it('should use the prop `className` in its class', () => {
    renderComponents(getProps({ className: 'bluh-bluh' }));
    const nav = screen.getByRole('navigation', { name: 'Navigation' });

    const classList = nav.classList;

    expect(classList).toContain('bluh-bluh');
  });

  describe('"Resume Sections" tablist', () => {
    /**
     * For `aria-orientation`, there's no need in testing it directly since
     * it's better tested via the keyboard navigation testing.
     */

    it('should render a tablist "Resume Sections"', () => {
      renderComponents();

      const tablist = screen.getByRole('tablist', { name: 'Resume Sections' });

      expect(tablist).toBeInTheDocument();
    });

    it('should have the correct `aria-owns` attribute for the tablist that specifies all section IDs', () => {
      renderComponents();
      const correctValue = clsx(possibleSectionIds);

      const tablist = screen.getByRole('tablist', { name: 'Resume Sections' });

      expect(tablist).toHaveAttribute('aria-owns', correctValue);
    });
  });

  describe('Sections', () => {
    it('should render tabs for all active sections', () => {
      renderComponents(getProps());

      let name: SectionTitle = sectionTitles.personal;
      const personalTab = screen.getByRole('tab', { name });
      name = sectionTitles.links;
      const linksTab = screen.getByRole('tab', { name });
      name = sectionTitles.skills;
      const skillsTab = screen.getByRole('tab', { name });
      name = sectionTitles.experience;
      const experienceTab = screen.getByRole('tab', { name });
      name = sectionTitles.projects;
      const projectsTab = screen.getByRole('tab', { name });
      name = sectionTitles.education;
      const educationTab = screen.getByRole('tab', { name });
      name = sectionTitles.certifications;
      const certificationsTab = screen.getByRole('tab', { name });

      expect(personalTab).toBeInTheDocument();
      expect(linksTab).toBeInTheDocument();
      expect(skillsTab).toBeInTheDocument();
      expect(experienceTab).toBeInTheDocument();
      expect(projectsTab).toBeInTheDocument();
      expect(educationTab).toBeInTheDocument();
      expect(certificationsTab).toBeInTheDocument();
    });

    it('should not render tabs for inactive sections', () => {
      const activeSectionIds: SectionId[] = ['personal', 'education'];
      renderComponents(getProps({ activeSectionIds }));

      let name: SectionTitle = sectionTitles['links'];
      const linksTab = screen.queryByRole('tab', { name });
      name = sectionTitles.skills;
      const skillsTab = screen.queryByRole('tab', { name });
      name = sectionTitles.experience;
      const experienceTab = screen.queryByRole('tab', { name });
      name = sectionTitles.projects;
      const projectsTab = screen.queryByRole('tab', { name });
      name = sectionTitles.certifications;
      const certificationsTab = screen.queryByRole('tab', { name });

      expect(linksTab).not.toBeInTheDocument();
      expect(skillsTab).not.toBeInTheDocument();
      expect(experienceTab).not.toBeInTheDocument();
      expect(projectsTab).not.toBeInTheDocument();
      expect(certificationsTab).not.toBeInTheDocument();
    });

    it('should call `selectSection(sectionId)` when a section is selected', async () => {
      const mockFn = jest.fn((_sectionId: SectionId) => {});
      renderComponents(getProps({ selectSection: mockFn }));
      const user = userEvent.setup();
      const tab = screen.getByRole('tab', { name: sectionTitles['skills'] });

      await user.click(tab);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('skills');
    });

    it('should not call `selectSection` when a section tab is clicked if the editor mode is on', async () => {
      // Arrange
      const mockFn = jest.fn((_sectionId: SectionId) => {});
      const props = getProps({ editorMode: true, selectSection: mockFn });

      renderComponents(props);
      const user = userEvent.setup();
      const tab = screen.getByRole('tab', { name: sectionTitles['skills'] });

      await user.click(tab);

      expect(mockFn).not.toHaveBeenCalled();
    });

    describe('Delete buttons', () => {
      it('should render delete buttons for deletable sections in editor mode', () => {
        renderComponents(getProps({ editorMode: true }));

        expect(getDeleteBtn('links')).toBeInTheDocument();
        expect(getDeleteBtn('skills')).toBeInTheDocument();
        expect(getDeleteBtn('experience')).toBeInTheDocument();
        expect(getDeleteBtn('projects')).toBeInTheDocument();
        expect(getDeleteBtn('education')).toBeInTheDocument();
        expect(getDeleteBtn('certifications')).toBeInTheDocument();
      });

      it('should not render a delete button for the "Personal Details" section in editor mode', () => {
        renderComponents(getProps({ editorMode: true }));

        expect(getDeleteBtn('personal')).not.toBeInTheDocument();
      });

      it('should call `deleteSections(sectionIds)` when a section is deleted', async () => {
        const mockFn = jest.fn((_sectionIds: ReadonlyDeep<SectionId[]>) => {});
        const props = getProps({ editorMode: true, deleteSections: mockFn });

        renderComponents(props);
        const user = userEvent.setup();
        const btn = getDeleteBtn('education')!;

        await user.click(btn);

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(['education']);
      });

      it('should focus "Toggle Editor Mode" if the deleted section is the only deletable section', async () => {
        // Arrange
        const props = getProps({
          activeSectionIds: ['personal', 'skills'],
          editorMode: true,
        });

        renderComponents(props);
        const user = userEvent.setup();

        const deleteBtn = getDeleteBtn('skills')!;
        deleteBtn.focus();

        const editSectionsBtn = screen.getByRole('button', {
          name: 'Toggle Editor Mode',
        });

        // Act
        await user.keyboard('{Enter}');

        // Assert
        expect(editSectionsBtn).toHaveFocus();
      });

      it("should focus the next deletable section's tab if the deleted section is neither the only deletable section nor the last deletable section", async () => {
        // Arrange
        const props = getProps({
          activeSectionIds: ['personal', 'skills', 'education'],
          editorMode: true,
        });

        renderComponents(props);
        const user = userEvent.setup();

        const deleteSkillsBtn = getDeleteBtn('skills')!;
        const deleteEducationBtn = getDeleteBtn('education')!;
        deleteSkillsBtn.focus();

        // Act
        await user.keyboard('{Enter}');

        // Assert
        expect(deleteEducationBtn).toHaveFocus();
      });

      it("should foucs the previous deletable section's tab if the deleted section isn't the only deletable section and is the last deletable section", async () => {
        // Arrange
        const props = getProps({
          activeSectionIds: ['personal', 'skills', 'education'],
          editorMode: true,
        });

        renderComponents(props);
        const user = userEvent.setup();

        const deleteSkillsBtn = getDeleteBtn('skills')!;
        const deleteEducationBtn = getDeleteBtn('education')!;
        deleteEducationBtn.focus();

        // Act
        await user.keyboard('{Enter}');

        // Assert
        expect(deleteSkillsBtn).toHaveFocus();
      });
    });
  });

  describe('Controls', () => {
    describe('"Add Sections" button', () => {
      it('should render an "Add Sections" button if `canAddSections === true`', () => {
        renderComponents(getProps({ activeSectionIds: ['personal', 'links'] }));

        const btn = screen.getByRole('button', { name: 'Add Sections' });

        expect(btn).toBeInTheDocument();
      });

      it('should not render an "Add Sections" button if `canAddSections === false`', () => {
        renderComponents(getProps({ canAddSections: false }));

        const btn = screen.queryByRole('button', { name: 'Add Sections' });

        expect(btn).not.toBeInTheDocument();
      });

      it('should show the "Add Sections" dialog when the "Add Sections" button is clicked', async () => {
        // Arrange
        renderComponents(getProps({ activeSectionIds: ['personal', 'links'] }));
        const user = userEvent.setup();
        const btn = screen.getByRole('button', { name: 'Add Sections' });

        // Act
        await user.click(btn);

        // Assert
        const dialog = screen.getByRole('dialog', { name: 'Add Sections' });
        expect(dialog).toBeInTheDocument();
      });
    });

    describe('"Toggle Editor Mode" button', () => {
      it('should render a "Toggle Editor Mode" button', () => {
        renderComponents();

        const btn = screen.getByRole('button', { name: 'Toggle Editor Mode' });

        expect(btn).toBeInTheDocument();
      });

      it('should call `toggleEditorMode` when "Toggle Editor Mode" is clicked', async () => {
        const mockFn = jest.fn();
        renderComponents(getProps({ toggleEditorMode: mockFn }));
        const user = userEvent.setup();
        const btn = screen.getByRole('button', { name: 'Toggle Editor Mode' });

        await user.click(btn);

        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('"Add Sections" dialog', () => {
    function getAddBtn(sectionId: SectionId) {
      return screen.queryByRole('button', {
        name: `Add ${sectionTitles[sectionId]}`,
      });
    }
    it('should render add-buttons for all inactive sections', async () => {
      // Arrange
      const activeSectionIds: SectionId[] = ['personal', 'links', 'projects'];
      renderComponents(getProps({ activeSectionIds }));
      const user = userEvent.setup();

      const name = 'Add Sections';
      const addSectionsBtn = screen.getByRole('button', { name });
      await user.click(addSectionsBtn);

      // Act
      const addSkills = getAddBtn('skills');
      const addExperience = getAddBtn('experience');
      const addEducation = getAddBtn('education');
      const addCertifications = getAddBtn('certifications');

      // Assert
      expect(addSkills).toBeInTheDocument();
      expect(addExperience).toBeInTheDocument();
      expect(addEducation).toBeInTheDocument();
      expect(addCertifications).toBeInTheDocument();
    });

    it('should not render add-buttons for active sections', async () => {
      // Arrange
      const activeSectionIds: SectionId[] = ['personal', 'links', 'projects'];
      renderComponents(getProps({ activeSectionIds }));
      const user = userEvent.setup();

      const name = 'Add Sections';
      const addSectionsBtn = screen.getByRole('button', { name });
      await user.click(addSectionsBtn);

      // Act
      const addPersonal = getAddBtn('personal');
      const addLinks = getAddBtn('links');
      const addProjects = getAddBtn('projects');

      // Assert
      expect(addPersonal).not.toBeInTheDocument();
      expect(addLinks).not.toBeInTheDocument();
      expect(addProjects).not.toBeInTheDocument();
    });

    it('should call `addSections` when a section is added', async () => {
      // Arrange
      const mockFn = jest.fn((_sectionIds: ReadonlyDeep<SectionId[]>) => {});
      const activeSectionIds: SectionId[] = ['personal', 'links', 'projects'];
      const props = getProps({ activeSectionIds, addSections: mockFn });

      renderComponents(props);
      const user = userEvent.setup();

      const name = 'Add Sections';
      const addSectionsBtn = screen.getByRole('button', { name });
      await user.click(addSectionsBtn);

      const addSkillsBtn = getAddBtn('skills')!;

      // Act
      await user.click(addSkillsBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(['skills']);
    });

    it("should close the 'Add Sections' popup when it's closed", async () => {
      // Arrange
      const activeSectionIds: SectionId[] = ['personal', 'links', 'projects'];
      renderComponents(getProps({ activeSectionIds }));
      const user = userEvent.setup();

      const name = 'Add Sections';
      const addSectionsBtn = screen.getByRole('button', { name });
      await user.click(addSectionsBtn);

      const closeBtn = screen.getByRole('button', { name: 'Close Popup' });

      // Act
      await user.click(closeBtn);

      // Assert
      const dialog = screen.queryByRole('dialog', { name: 'Add Sections' });
      expect(dialog).not.toBeInTheDocument();
    });
  });

  // DnD
  describe('DnD', () => {
    // TODO: find a way to test DnD itself. At the moment, it doesn't work in Jest.
    it('should provide draggable tabs with an accessible description for DnD behaviour in editor mode, "To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel."', () => {
      // Arrange
      const description =
        'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.';

      function cleanSting(string: string) {
        return string.replaceAll(/\s+/g, ' ').trim();
      }

      renderComponents(getProps({ editorMode: true }));

      // Act
      const name = sectionTitles['education'];
      const draggableTab = screen.getByRole('tab', { name });
      const descriptionNodeId = draggableTab.getAttribute('aria-describedBy');
      const descriptionNode = document.getElementById(descriptionNodeId!)!;

      // Assert
      expect(descriptionNode).toBeInTheDocument();
      const cleanedTextContent = cleanSting(descriptionNode.textContent);
      expect(cleanedTextContent).toBe(description);
    });

    it('should not provide tabs with an accessible description when the editor mode is off', () => {
      renderComponents();

      const name = sectionTitles['education'];
      const draggableTab = screen.getByRole('tab', { name });
      const descriptionNodeId = draggableTab.getAttribute('aria-describedBy');

      expect(descriptionNodeId).toBeNull();
    });

    it('should not provide undraggable tabs with an accessible description', () => {
      renderComponents(getProps({ editorMode: true }));

      const tab = screen.getByRole('tab', { name: sectionTitles['personal'] });
      const descriptionNodeId = tab.getAttribute('aria-describedBy');

      expect(descriptionNodeId).toBeNull();
    });
  });

  describe('Keyboard navigation', () => {
    describe("A section tab is focused and isn't dragged", () => {
      describe('The section corresponding to the tab is the only active section', () => {
        it('should focus the "Add Sections" button when Arrow Down is pressed', async () => {
          // Arrange
          const activeSectionIds: SectionId[] = ['personal'];
          renderComponents(getProps({ activeSectionIds }));
          const user = userEvent.setup();

          const name = sectionTitles['personal'];
          const tab = screen.getByRole('tab', { name });
          const btn = screen.getByRole('button', { name: 'Add Sections' });
          tab.focus();

          // Act
          await user.keyboard('{ArrowDown}');

          // Assert
          expect(btn).toHaveFocus();
        });

        it('should focus the "Toggle Editor Mode" button when Arrow Up is pressed', async () => {
          // Arrange
          const activeSectionIds: SectionId[] = ['personal'];
          renderComponents(getProps({ activeSectionIds }));
          const user = userEvent.setup();

          const name = sectionTitles['personal'];
          const tab = screen.getByRole('tab', { name });
          tab.focus();

          const btn = screen.getByRole('button', {
            name: 'Toggle Editor Mode',
          });

          // Act
          await user.keyboard('{ArrowUp}');

          // Assert
          expect(btn).toHaveFocus();
        });
      });

      describe("The section corresponding to the tab isn't the only active section", () => {
        it("should focus the next tab when Arrow Down is pressed if the focused tab isn't the last", async () => {
          // Arrange
          renderComponents();
          const user = userEvent.setup();

          let name: SectionTitle = sectionTitles['personal'];
          const personalTab = screen.getByRole('tab', { name });
          personalTab.focus();

          name = sectionTitles['links'];
          const linksTab = screen.getByRole('tab', { name });

          // Act
          await user.keyboard('{ArrowDown}');

          // Assert
          expect(linksTab).toHaveFocus();
        });

        it('should focus "Add Sections" when Arrow Down is pressed if the focused tab is the last and `canAddSections === true`', async () => {
          // Arrange
          renderComponents(
            getProps({ activeSectionIds: ['personal', 'links'] }),
          );
          const user = userEvent.setup();

          const tab = screen.getByRole('tab', {
            name: sectionTitles['links'],
          });
          const btn = screen.getByRole('button', { name: 'Add Sections' });
          tab.focus();

          // Act
          await user.keyboard('{ArrowDown}');

          // Assert
          expect(btn).toHaveFocus();
        });

        it('should focus "Toggle Editor Mode" when Arrow Down is pressed if the focused tab is the last and `canAddSections === false`', async () => {
          // Arrange
          const activeSectionIds: SectionId[] = ['personal', 'links'];
          renderComponents(
            getProps({ activeSectionIds, canAddSections: false }),
          );
          const user = userEvent.setup();

          const tab = screen.getByRole('tab', {
            name: sectionTitles['links'],
          });
          const btn = screen.getByRole('button', {
            name: 'Toggle Editor Mode',
          });
          tab.focus();

          // Act
          await user.keyboard('{ArrowDown}');

          // Assert
          expect(btn).toHaveFocus();
        });

        it("should focus the previous tab when Arrow Up is clicked if the focused tab isn't the first one", async () => {
          // Arrange
          renderComponents();
          const user = userEvent.setup();

          let name: SectionTitle = sectionTitles['education'];
          const educationTab = screen.getByRole('tab', { name });
          educationTab.focus();

          name = sectionTitles['projects'];
          const projectsTab = screen.getByRole('tab', { name });

          // Act
          await user.keyboard('{ArrowUp}');

          // Assert
          // "projects" goes before "education".
          expect(projectsTab).toHaveFocus();
        });

        it('should focus "Toggle Editor Mode" when Arrow Up is clicked if the focused tab is the first one', async () => {
          // Arrange
          renderComponents();
          const user = userEvent.setup();

          const tab = screen.getByRole('tab', {
            name: sectionTitles['personal'],
          });

          const btn = screen.getByRole('button', {
            name: 'Toggle Editor Mode',
          });

          tab.focus();

          // Act
          await user.keyboard('{ArrowUp}');

          // Assert
          expect(btn).toHaveFocus();
        });
      });
    });

    describe('A delete-section button is focused', () => {
      it("should focus the next delete button when Arrow Down is pressed if the focused delete button isn't the last one", async () => {
        // Arrange
        renderComponents(getProps({ editorMode: true }));
        const user = userEvent.setup();

        const deleteProjectsBtn = getDeleteBtn('projects')!;
        const deleteEducationBtn = getDeleteBtn('education')!;
        deleteProjectsBtn.focus();

        // Act
        await user.keyboard('{ArrowDown}');

        // Assert
        expect(deleteEducationBtn).toHaveFocus();
      });

      it('should focus the first delete button when Arrow Down is pressed if the focused delete button is the last one', async () => {
        renderComponents(getProps({ editorMode: true }));
        const user = userEvent.setup();

        const firstBtn = getDeleteBtn('links')!;
        const lastBtn = getDeleteBtn('certifications')!;
        lastBtn.focus();

        // Act
        await user.keyboard('{ArrowDown}');

        // Assert
        expect(firstBtn).toHaveFocus();
      });

      it("should focus the previous delete button when Arrow Up is pressed if the focused delete button isn't the last one", async () => {
        // Arrange
        renderComponents(getProps({ editorMode: true }));
        const user = userEvent.setup();

        const previousBtn = getDeleteBtn('projects')!;
        const btn = getDeleteBtn('education')!;
        btn.focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        expect(previousBtn).toHaveFocus();
      });

      it('should focus the last delete button when Arrow Up is pressed if the focused delete button is the last one', async () => {
        // Arrange
        renderComponents(getProps({ editorMode: true }));
        const user = userEvent.setup();

        const firstBtn = getDeleteBtn('links')!;
        const lastBtn = getDeleteBtn('certifications')!;
        firstBtn.focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        expect(lastBtn).toHaveFocus();
      });
    });

    describe('The "Add Sections" button is focused', () => {
      it('should focus "Toggle Editor Mode" when Arrow Down is pressed', async () => {
        // Arrange
        renderComponents(getProps({ activeSectionIds: ['personal'] }));
        const user = userEvent.setup();

        let name = 'Add Sections';
        const addSectionsBtn = screen.getByRole('button', { name });
        name = 'Toggle Editor Mode';
        const toggleEditorModeBtn = screen.getByRole('button', { name });

        addSectionsBtn.focus();

        // Act
        await user.keyboard('{ArrowDown}');

        // Assert
        expect(toggleEditorModeBtn).toHaveFocus();
      });

      it('should focus the last section tab when Arrow Up is pressed', async () => {
        // Arrange
        const activeSectionIds: SectionId[] = ['personal', 'projects'];
        renderComponents(getProps({ activeSectionIds }));
        const user = userEvent.setup();

        const name = sectionTitles['projects'];
        const tab = screen.getByRole('tab', { name });

        const btn = screen.getByRole('button', { name: 'Add Sections' });
        btn.focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        expect(tab).toHaveFocus();
      });
    });

    describe('The "Toggle Editor Mode" button is focused', () => {
      it('should focus the first tab when Arrow Down is pressed', async () => {
        // Arrange
        renderComponents();
        const user = userEvent.setup();

        let name: string = sectionTitles['personal'];
        const tab = screen.getByRole('tab', { name });
        name = 'Toggle Editor Mode';
        const btn = screen.getByRole('button', { name });

        btn.focus();

        // Act
        await user.keyboard('{ArrowDown}');

        // Assert
        expect(tab).toHaveFocus();
      });

      it('should focus "Add Sections" when Arrow Up is pressed if `canAddSections === true`', async () => {
        // Arrange
        renderComponents(getProps({ activeSectionIds: ['personal'] }));
        const user = userEvent.setup();

        let name = 'Add Sections';
        const addSectionsBtn = screen.getByRole('button', { name });
        name = 'Toggle Editor Mode';
        const toggleEditorModeBtn = screen.getByRole('button', { name });

        toggleEditorModeBtn.focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        expect(addSectionsBtn).toHaveFocus();
      });

      it('should focus the last tab when Arrow Up is pressed if `canAddSections === false`', async () => {
        // Arrange
        renderComponents(getProps({ canAddSections: false }));
        const user = userEvent.setup();

        let name: string = sectionTitles['certifications'];
        const tab = screen.getByRole('tab', { name });
        name = 'Toggle Editor Mode';
        const btn = screen.getByRole('button', { name });

        btn.focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        expect(tab).toHaveFocus();
      });
    });
  });
});
