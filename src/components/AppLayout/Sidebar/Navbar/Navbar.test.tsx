import { clsx } from 'clsx';
import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

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

function getDeleteBtn(sectionId: SectionId) {
  return page.getByRole('button', {
    name: `Delete ${sectionTitles[sectionId]}`,
  });
}

describe('Navbar', () => {
  it('should render a navigation with an accessible name derived from an element with an ID "toggle-navbar"', async () => {
    await renderComponents();

    const nav = page.getByRole('navigation', { name: 'Navigation' });

    await expect.element(nav).toBeInTheDocument();
  });

  it('should use the prop `className` in its class', async () => {
    await renderComponents(getProps({ className: 'bluh-bluh' }));
    const nav = page.getByRole('navigation', { name: 'Navigation' });

    await expect.element(nav).toHaveClass('bluh-bluh');
  });

  it('should apply the hidden modifier class when `hidden` is true', async () => {
    // Arrange
    const props = getProps({ hidden: true });

    // Act
    await renderComponents(props);

    // Assert
    const nav = page.getByRole('navigation', { includeHidden: true });

    await expect.element(nav).toHaveClass('Navbar_hidden');
  });

  it('should not apply the hidden modifier class when `hidden` is false', async () => {
    // Arrange
    const props = getProps({ hidden: false });

    // Act
    await renderComponents(props);

    // Assert
    const nav = page.getByRole('navigation', { name: 'Navigation' });

    await expect.element(nav).not.toHaveClass('Navbar_hidden');
  });

  describe('"Resume Sections" tablist', () => {
    /**
     * For `aria-orientation`, there's no need in testing it directly since
     * it's better tested via the keyboard navigation testing.
     */

    it('should render a tablist "Resume Sections"', async () => {
      await renderComponents();

      const tablist = page.getByRole('tablist', { name: 'Resume Sections' });

      await expect.element(tablist).toBeInTheDocument();
    });

    it('should have the correct `aria-owns` attribute for the tablist that specifies all section IDs', async () => {
      await renderComponents();
      const correctValue = clsx(possibleSectionIds);

      const tablist = page.getByRole('tablist', { name: 'Resume Sections' });

      await expect.element(tablist).toHaveAttribute('aria-owns', correctValue);
    });
  });

  describe('Sections', () => {
    it('should render tabs for all active sections', async () => {
      await renderComponents(getProps());

      let name: SectionTitle = sectionTitles.personal;
      const personalTab = page.getByRole('tab', { name });
      name = sectionTitles.links;
      const linksTab = page.getByRole('tab', { name });
      name = sectionTitles.skills;
      const skillsTab = page.getByRole('tab', { name });
      name = sectionTitles.experience;
      const experienceTab = page.getByRole('tab', { name });
      name = sectionTitles.projects;
      const projectsTab = page.getByRole('tab', { name });
      name = sectionTitles.education;
      const educationTab = page.getByRole('tab', { name });
      name = sectionTitles.certifications;
      const certificationsTab = page.getByRole('tab', { name });

      await expect.element(personalTab).toBeInTheDocument();
      await expect.element(linksTab).toBeInTheDocument();
      await expect.element(skillsTab).toBeInTheDocument();
      await expect.element(experienceTab).toBeInTheDocument();
      await expect.element(projectsTab).toBeInTheDocument();
      await expect.element(educationTab).toBeInTheDocument();
      await expect.element(certificationsTab).toBeInTheDocument();
    });

    it('should not render tabs for inactive sections', async () => {
      const activeSectionIds: SectionId[] = ['personal', 'education'];
      await renderComponents(getProps({ activeSectionIds }));

      let name: SectionTitle = sectionTitles['links'];
      const linksTab = page.getByRole('tab', { name });
      name = sectionTitles.skills;
      const skillsTab = page.getByRole('tab', { name });
      name = sectionTitles.experience;
      const experienceTab = page.getByRole('tab', { name });
      name = sectionTitles.projects;
      const projectsTab = page.getByRole('tab', { name });
      name = sectionTitles.certifications;
      const certificationsTab = page.getByRole('tab', { name });

      await expect.element(linksTab).not.toBeInTheDocument();
      await expect.element(skillsTab).not.toBeInTheDocument();
      await expect.element(experienceTab).not.toBeInTheDocument();
      await expect.element(projectsTab).not.toBeInTheDocument();
      await expect.element(certificationsTab).not.toBeInTheDocument();
    });

    it('should call `selectSection(sectionId)` when a section is selected', async () => {
      const mockFn = vi.fn((_sectionId: SectionId) => {});
      await renderComponents(getProps({ selectSection: mockFn }));
      const user = userEvent.setup();
      const tab = page.getByRole('tab', { name: sectionTitles['skills'] });

      await user.click(tab);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('skills');
    });

    it('should not call `selectSection` when a section tab is clicked if the editor mode is on', async () => {
      // Arrange
      const mockFn = vi.fn((_sectionId: SectionId) => {});
      const props = getProps({ editorMode: true, selectSection: mockFn });

      await renderComponents(props);
      const user = userEvent.setup();
      const tab = page.getByRole('tab', { name: sectionTitles['skills'] });

      /**
       * Draggable tabs run an infinite CSS shake animation in editor mode,
       * so Playwright's layout stability check must be bypassed via `force`.
       */
      await user.click(tab, { force: true });

      expect(mockFn).not.toHaveBeenCalled();
    });

    describe('Delete buttons', () => {
      it('should render delete buttons for deletable sections in editor mode', async () => {
        await renderComponents(getProps({ editorMode: true }));

        await expect.element(getDeleteBtn('links')).toBeInTheDocument();
        await expect.element(getDeleteBtn('skills')).toBeInTheDocument();
        await expect.element(getDeleteBtn('experience')).toBeInTheDocument();
        await expect.element(getDeleteBtn('projects')).toBeInTheDocument();
        await expect.element(getDeleteBtn('education')).toBeInTheDocument();
        await expect
          .element(getDeleteBtn('certifications'))
          .toBeInTheDocument();
      });

      it('should not render a delete button for the "Personal Details" section in editor mode', async () => {
        await renderComponents(getProps({ editorMode: true }));

        await expect.element(getDeleteBtn('personal')).not.toBeInTheDocument();
      });

      it('should call `deleteSections(sectionIds)` when a section is deleted', async () => {
        const mockFn = vi.fn((_sectionIds: ReadonlyDeep<SectionId[]>) => {});
        const props = getProps({ editorMode: true, deleteSections: mockFn });

        await renderComponents(props);
        const user = userEvent.setup();
        const btn = getDeleteBtn('education');

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

        await renderComponents(props);
        const user = userEvent.setup();

        const deleteBtn = getDeleteBtn('skills');
        deleteBtn.element().focus();

        const editSectionsBtn = page.getByRole('button', {
          name: 'Toggle Editor Mode',
        });

        // Act
        await user.keyboard('{Enter}');

        // Assert
        await expect.element(editSectionsBtn).toHaveFocus();
      });

      it("should focus the next deletable section's tab if the deleted section is neither the only deletable section nor the last deletable section", async () => {
        // Arrange
        const props = getProps({
          activeSectionIds: ['personal', 'skills', 'education'],
          editorMode: true,
        });

        await renderComponents(props);
        const user = userEvent.setup();

        const deleteSkillsBtn = getDeleteBtn('skills');
        const deleteEducationBtn = getDeleteBtn('education');
        deleteSkillsBtn.element().focus();

        // Act
        await user.keyboard('{Enter}');

        // Assert
        await expect.element(deleteEducationBtn).toHaveFocus();
      });

      it("should foucs the previous deletable section's tab if the deleted section isn't the only deletable section and is the last deletable section", async () => {
        // Arrange
        const props = getProps({
          activeSectionIds: ['personal', 'skills', 'education'],
          editorMode: true,
        });

        await renderComponents(props);
        const user = userEvent.setup();

        const deleteSkillsBtn = getDeleteBtn('skills');
        const deleteEducationBtn = getDeleteBtn('education');
        deleteEducationBtn.element().focus();

        // Act
        await user.keyboard('{Enter}');

        // Assert
        await expect.element(deleteSkillsBtn).toHaveFocus();
      });
    });
  });

  describe('Controls', () => {
    describe('"Add Sections" button', () => {
      it('should render an "Add Sections" button if `canAddSections === true`', async () => {
        await renderComponents(
          getProps({ activeSectionIds: ['personal', 'links'] }),
        );

        const btn = page.getByRole('button', { name: 'Add Sections' });

        await expect.element(btn).toBeInTheDocument();
      });

      it('should not render an "Add Sections" button if `canAddSections === false`', async () => {
        await renderComponents(getProps({ canAddSections: false }));

        const btn = page.getByRole('button', { name: 'Add Sections' });

        await expect.element(btn).not.toBeInTheDocument();
      });

      it('should show the "Add Sections" dialog when the "Add Sections" button is clicked', async () => {
        // Arrange
        await renderComponents(
          getProps({ activeSectionIds: ['personal', 'links'] }),
        );
        const user = userEvent.setup();
        const btn = page.getByRole('button', { name: 'Add Sections' });

        // Act
        await user.click(btn);

        // Assert
        const dialog = page.getByRole('dialog', { name: 'Add Sections' });
        await expect.element(dialog).toBeInTheDocument();
      });
    });

    describe('"Toggle Editor Mode" button', () => {
      it('should render a "Toggle Editor Mode" button', async () => {
        await renderComponents();

        const btn = page.getByRole('button', { name: 'Toggle Editor Mode' });

        await expect.element(btn).toBeInTheDocument();
      });

      it('should call `toggleEditorMode` when "Toggle Editor Mode" is clicked', async () => {
        const mockFn = vi.fn();
        await renderComponents(getProps({ toggleEditorMode: mockFn }));
        const user = userEvent.setup();
        const btn = page.getByRole('button', { name: 'Toggle Editor Mode' });

        await user.click(btn);

        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('"Add Sections" dialog', () => {
    function getAddBtn(sectionId: SectionId) {
      return page.getByRole('button', {
        name: `Add ${sectionTitles[sectionId]}`,
      });
    }
    it('should render add-buttons for all inactive sections', async () => {
      // Arrange
      const activeSectionIds: SectionId[] = ['personal', 'links', 'projects'];
      await renderComponents(getProps({ activeSectionIds }));
      const user = userEvent.setup();

      const name = 'Add Sections';
      const addSectionsBtn = page.getByRole('button', { name });
      await user.click(addSectionsBtn);

      // Act
      const addSkills = getAddBtn('skills');
      const addExperience = getAddBtn('experience');
      const addEducation = getAddBtn('education');
      const addCertifications = getAddBtn('certifications');

      // Assert
      await expect.element(addSkills).toBeInTheDocument();
      await expect.element(addExperience).toBeInTheDocument();
      await expect.element(addEducation).toBeInTheDocument();
      await expect.element(addCertifications).toBeInTheDocument();
    });

    it('should not render add-buttons for active sections', async () => {
      // Arrange
      const activeSectionIds: SectionId[] = ['personal', 'links', 'projects'];
      await renderComponents(getProps({ activeSectionIds }));
      const user = userEvent.setup();

      const name = 'Add Sections';
      const addSectionsBtn = page.getByRole('button', { name });
      await user.click(addSectionsBtn);

      // Act
      const addPersonal = getAddBtn('personal');
      const addLinks = getAddBtn('links');
      const addProjects = getAddBtn('projects');

      // Assert
      await expect.element(addPersonal).not.toBeInTheDocument();
      await expect.element(addLinks).not.toBeInTheDocument();
      await expect.element(addProjects).not.toBeInTheDocument();
    });

    it('should call `addSections` when a section is added', async () => {
      // Arrange
      const mockFn = vi.fn((_sectionIds: ReadonlyDeep<SectionId[]>) => {});
      const activeSectionIds: SectionId[] = ['personal', 'links', 'projects'];
      const props = getProps({ activeSectionIds, addSections: mockFn });

      await renderComponents(props);
      const user = userEvent.setup();

      const name = 'Add Sections';
      const addSectionsBtn = page.getByRole('button', { name });
      await user.click(addSectionsBtn);

      const addSkillsBtn = getAddBtn('skills');

      // Act
      await user.click(addSkillsBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(['skills']);
    });

    it("should close the 'Add Sections' popup when it's closed", async () => {
      // Arrange
      const activeSectionIds: SectionId[] = ['personal', 'links', 'projects'];
      await renderComponents(getProps({ activeSectionIds }));
      const user = userEvent.setup();

      const name = 'Add Sections';
      const addSectionsBtn = page.getByRole('button', { name });
      await user.click(addSectionsBtn);

      const closeBtn = page.getByRole('button', { name: 'Close Popup' });

      // Act
      await user.click(closeBtn);

      // Assert
      const dialog = page.getByRole('dialog', { name: 'Add Sections' });
      await expect.element(dialog).not.toBeInTheDocument();
    });
  });

  // DnD
  describe('DnD', () => {
    it('should provide draggable tabs with an accessible description for DnD behaviour in editor mode, "To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel."', async () => {
      // Arrange
      const description =
        'To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.';

      function cleanSting(string: string) {
        return string.replaceAll(/\s+/g, ' ').trim();
      }

      await renderComponents(getProps({ editorMode: true }));

      // Act
      const name = sectionTitles['education'];
      const draggableTab = page.getByRole('tab', { name });
      const descriptionNodeId = draggableTab
        .element()
        .getAttribute('aria-describedby');
      const descriptionNode = document.getElementById(descriptionNodeId!)!;

      // Assert
      expect(descriptionNode).toBeTruthy();
      const cleanedTextContent = cleanSting(descriptionNode.textContent);
      expect(cleanedTextContent).toBe(description);
    });

    it('should not provide tabs with an accessible description when the editor mode is off', async () => {
      await renderComponents();

      const name = sectionTitles['education'];
      const draggableTab = page.getByRole('tab', { name });
      const descriptionNodeId = draggableTab
        .element()
        .getAttribute('aria-describedby');

      expect(descriptionNodeId).toBeNull();
    });

    it('should not provide undraggable tabs with an accessible description', async () => {
      await renderComponents(getProps({ editorMode: true }));

      const tab = page.getByRole('tab', { name: sectionTitles['personal'] });
      const descriptionNodeId = tab.element().getAttribute('aria-describedby');

      expect(descriptionNodeId).toBeNull();
    });
  });

  describe('Keyboard navigation', () => {
    describe("A section tab is focused and isn't dragged", () => {
      describe('The section corresponding to the tab is the only active section', () => {
        it('should focus the "Add Sections" button when Arrow Down is pressed', async () => {
          // Arrange
          const activeSectionIds: SectionId[] = ['personal'];
          await renderComponents(getProps({ activeSectionIds }));
          const user = userEvent.setup();

          const name = sectionTitles['personal'];
          const tab = page.getByRole('tab', { name });
          const btn = page.getByRole('button', { name: 'Add Sections' });
          tab.element().focus();

          // Act
          await user.keyboard('{ArrowDown}');

          // Assert
          await expect.element(btn).toHaveFocus();
        });

        it('should focus the "Toggle Editor Mode" button when Arrow Up is pressed', async () => {
          // Arrange
          const activeSectionIds: SectionId[] = ['personal'];
          await renderComponents(getProps({ activeSectionIds }));
          const user = userEvent.setup();

          const name = sectionTitles['personal'];
          const tab = page.getByRole('tab', { name });
          tab.element().focus();

          const btn = page.getByRole('button', {
            name: 'Toggle Editor Mode',
          });

          // Act
          await user.keyboard('{ArrowUp}');

          // Assert
          await expect.element(btn).toHaveFocus();
        });
      });

      describe("The section corresponding to the tab isn't the only active section", () => {
        it("should focus the next tab when Arrow Down is pressed if the focused tab isn't the last", async () => {
          // Arrange
          await renderComponents();
          const user = userEvent.setup();

          let name: SectionTitle = sectionTitles['personal'];
          const personalTab = page.getByRole('tab', { name });
          personalTab.element().focus();

          name = sectionTitles['links'];
          const linksTab = page.getByRole('tab', { name });

          // Act
          await user.keyboard('{ArrowDown}');

          // Assert
          await expect.element(linksTab).toHaveFocus();
        });

        it('should focus "Add Sections" when Arrow Down is pressed if the focused tab is the last and `canAddSections === true`', async () => {
          // Arrange
          await renderComponents(
            getProps({ activeSectionIds: ['personal', 'links'] }),
          );
          const user = userEvent.setup();

          const tab = page.getByRole('tab', {
            name: sectionTitles['links'],
          });
          const btn = page.getByRole('button', { name: 'Add Sections' });
          tab.element().focus();

          // Act
          await user.keyboard('{ArrowDown}');

          // Assert
          await expect.element(btn).toHaveFocus();
        });

        it('should focus "Toggle Editor Mode" when Arrow Down is pressed if the focused tab is the last and `canAddSections === false`', async () => {
          // Arrange
          const activeSectionIds: SectionId[] = ['personal', 'links'];
          await renderComponents(
            getProps({ activeSectionIds, canAddSections: false }),
          );
          const user = userEvent.setup();

          const tab = page.getByRole('tab', {
            name: sectionTitles['links'],
          });
          const btn = page.getByRole('button', {
            name: 'Toggle Editor Mode',
          });
          tab.element().focus();

          // Act
          await user.keyboard('{ArrowDown}');

          // Assert
          await expect.element(btn).toHaveFocus();
        });

        it("should focus the previous tab when Arrow Up is clicked if the focused tab isn't the first one", async () => {
          // Arrange
          await renderComponents();
          const user = userEvent.setup();

          let name: SectionTitle = sectionTitles['education'];
          const educationTab = page.getByRole('tab', { name });
          educationTab.element().focus();

          name = sectionTitles['projects'];
          const projectsTab = page.getByRole('tab', { name });

          // Act
          await user.keyboard('{ArrowUp}');

          // Assert
          // "projects" goes before "education".
          await expect.element(projectsTab).toHaveFocus();
        });

        it('should focus "Toggle Editor Mode" when Arrow Up is clicked if the focused tab is the first one', async () => {
          // Arrange
          await renderComponents();
          const user = userEvent.setup();

          const tab = page.getByRole('tab', {
            name: sectionTitles['personal'],
          });

          const btn = page.getByRole('button', {
            name: 'Toggle Editor Mode',
          });

          tab.element().focus();

          // Act
          await user.keyboard('{ArrowUp}');

          // Assert
          await expect.element(btn).toHaveFocus();
        });
      });
    });

    describe('A delete-section button is focused', () => {
      it("should focus the next delete button when Arrow Down is pressed if the focused delete button isn't the last one", async () => {
        // Arrange
        await renderComponents(getProps({ editorMode: true }));
        const user = userEvent.setup();

        const deleteProjectsBtn = getDeleteBtn('projects');
        const deleteEducationBtn = getDeleteBtn('education');
        deleteProjectsBtn.element().focus();

        // Act
        await user.keyboard('{ArrowDown}');

        // Assert
        await expect.element(deleteEducationBtn).toHaveFocus();
      });

      it('should focus the first delete button when Arrow Down is pressed if the focused delete button is the last one', async () => {
        await renderComponents(getProps({ editorMode: true }));
        const user = userEvent.setup();

        const firstBtn = getDeleteBtn('links');
        const lastBtn = getDeleteBtn('certifications');
        lastBtn.element().focus();

        // Act
        await user.keyboard('{ArrowDown}');

        // Assert
        await expect.element(firstBtn).toHaveFocus();
      });

      it("should focus the previous delete button when Arrow Up is pressed if the focused delete button isn't the last one", async () => {
        // Arrange
        await renderComponents(getProps({ editorMode: true }));
        const user = userEvent.setup();

        const previousBtn = getDeleteBtn('projects');
        const btn = getDeleteBtn('education');
        btn.element().focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        await expect.element(previousBtn).toHaveFocus();
      });

      it('should focus the last delete button when Arrow Up is pressed if the focused delete button is the last one', async () => {
        // Arrange
        await renderComponents(getProps({ editorMode: true }));
        const user = userEvent.setup();

        const firstBtn = getDeleteBtn('links');
        const lastBtn = getDeleteBtn('certifications');
        firstBtn.element().focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        await expect.element(lastBtn).toHaveFocus();
      });
    });

    describe('The "Add Sections" button is focused', () => {
      it('should focus "Toggle Editor Mode" when Arrow Down is pressed', async () => {
        // Arrange
        await renderComponents(getProps({ activeSectionIds: ['personal'] }));
        const user = userEvent.setup();

        let name = 'Add Sections';
        const addSectionsBtn = page.getByRole('button', { name });
        name = 'Toggle Editor Mode';
        const toggleEditorModeBtn = page.getByRole('button', { name });

        addSectionsBtn.element().focus();

        // Act
        await user.keyboard('{ArrowDown}');

        // Assert
        await expect.element(toggleEditorModeBtn).toHaveFocus();
      });

      it('should focus the last section tab when Arrow Up is pressed', async () => {
        // Arrange
        const activeSectionIds: SectionId[] = ['personal', 'projects'];
        await renderComponents(getProps({ activeSectionIds }));
        const user = userEvent.setup();

        const name = sectionTitles['projects'];
        const tab = page.getByRole('tab', { name });

        const btn = page.getByRole('button', { name: 'Add Sections' });
        btn.element().focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        await expect.element(tab).toHaveFocus();
      });
    });

    describe('The "Toggle Editor Mode" button is focused', () => {
      it('should focus the first tab when Arrow Down is pressed', async () => {
        // Arrange
        await renderComponents();
        const user = userEvent.setup();

        let name: string = sectionTitles['personal'];
        const tab = page.getByRole('tab', { name });
        name = 'Toggle Editor Mode';
        const btn = page.getByRole('button', { name });

        btn.element().focus();

        // Act
        await user.keyboard('{ArrowDown}');

        // Assert
        await expect.element(tab).toHaveFocus();
      });

      it('should focus "Add Sections" when Arrow Up is pressed if `canAddSections === true`', async () => {
        // Arrange
        await renderComponents(getProps({ activeSectionIds: ['personal'] }));
        const user = userEvent.setup();

        let name = 'Add Sections';
        const addSectionsBtn = page.getByRole('button', { name });
        name = 'Toggle Editor Mode';
        const toggleEditorModeBtn = page.getByRole('button', { name });

        toggleEditorModeBtn.element().focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        await expect.element(addSectionsBtn).toHaveFocus();
      });

      it('should focus the last tab when Arrow Up is pressed if `canAddSections === false`', async () => {
        // Arrange
        await renderComponents(getProps({ canAddSections: false }));
        const user = userEvent.setup();

        let name: string = sectionTitles['certifications'];
        const tab = page.getByRole('tab', { name });
        name = 'Toggle Editor Mode';
        const btn = page.getByRole('button', { name });

        btn.element().focus();

        // Act
        await user.keyboard('{ArrowUp}');

        // Assert
        await expect.element(tab).toHaveFocus();
      });
    });
  });
});
