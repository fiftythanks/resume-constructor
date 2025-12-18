import React, { act } from 'react';

import {
  ByRoleOptions,
  getAllByRole,
  getByRole,
  render,
  screen,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';

import getFilledData from '@/hooks/useResumeData/getFilledData';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import App from './App';

function renderApp() {
  render(<div id="popup-root" />);
  render(<App />);
}

async function renderAppWithNavbarExpanded() {
  renderApp();
  const user = userEvent.setup();

  const toggleNavbarBtn = screen.getByRole('button', {
    name: 'Navigation',
    expanded: false,
  });

  await user.click(toggleNavbarBtn);

  const navbar = screen.getByRole('navigation', { name: 'Navigation' });
  const initialTabs = getAllByRole(navbar, 'tab');
  const addSectionsBtn = screen.getByRole('button', { name: 'Add Sections' });

  const toggleEditorModeBtn = screen.getByRole('button', {
    name: 'Toggle Editor Mode',
  });

  return { addSectionsBtn, initialTabs, navbar, toggleEditorModeBtn, user };
}

async function renderAppWithNavbarAndControlsExpanded() {
  const renderAppWithNavbarExpandedReturn = await renderAppWithNavbarExpanded();

  const toggleControlsBtn = screen.getByRole('button', {
    name: 'Control Buttons',
    expanded: false,
  });

  await renderAppWithNavbarExpandedReturn.user.click(toggleControlsBtn);

  const clearAllBtn = screen.getByRole('menuitem', { name: 'Clear All' });
  const fillAllBtn = screen.getByRole('menuitem', { name: 'Fill All' });

  return {
    ...renderAppWithNavbarExpandedReturn,
    clearAllBtn,
    fillAllBtn,
    toggleControlsBtn,
  };
}

describe('App', () => {
  it('should announce to screen readers when a bullet point is deleted', async () => {
    // Arrange
    const result = await renderAppWithNavbarExpanded();
    const { addSectionsBtn, navbar, user } = result;

    // Show the "Add Sections" dialog.
    await user.click(addSectionsBtn);

    // Add the "Skills" section.
    const options: ByRoleOptions = { name: `Add ${sectionTitles.skills}` };
    const addSkillsBtn = screen.getByRole('button', options);
    await user.click(addSkillsBtn);

    // Close the dialog.
    options.name = 'Close Popup';
    const closeBtn = screen.getByRole('button', options);
    await user.click(closeBtn);

    // Select the "Skills" section.
    options.name = sectionTitles.skills;
    const tab = getByRole(navbar, 'tab', options);
    await user.click(tab);

    options.name = sectionTitles.skills;
    const panel = screen.getByRole('tabpanel', options);

    options.name = 'Delete bullet point 1';
    const [deleteBullet] = getAllByRole(panel, 'button', options);

    // Act
    await user.click(deleteBullet);

    // Assert
    const announcement = screen.getByTestId('screen-reader-announcement');
    expect(announcement).toHaveTextContent('Bullet point 1 was deleted.');
  });

  it('should render the correct tabpanel', async () => {
    // Arrange
    const result = await renderAppWithNavbarAndControlsExpanded();
    const { fillAllBtn, navbar, user } = result;

    await user.click(fillAllBtn);

    // Act

    // The default selected section is "Personal Details".
    const personalTabpanel = screen.getByRole('tabpanel', {
      name: sectionTitles.personal,
    });

    // Select "Education"
    const educationTab = getByRole(navbar, 'tab', { name: 'Education' });
    await user.click(educationTab);

    const educationTabpanel = screen.getByRole('tabpanel', {
      name: sectionTitles.education,
    });

    // Assert
    expect(personalTabpanel).not.toBeNull();
    expect(educationTabpanel).toBeInTheDocument();
  });

  it('should render `AppLayout`', () => {
    renderApp();

    const appLayout = screen.getByTestId('app-layout');

    expect(appLayout).toBeInTheDocument();
  });

  describe("Tabbing to tabpanels' first tabbable elements", () => {
    it(`should focus the tabpanel's first tabbable element when the user tabs from the selected ${sectionTitles.personal} tab`, async () => {
      // Arrange
      const { navbar, user } = await renderAppWithNavbarExpanded();

      const options: ByRoleOptions = { name: sectionTitles.personal };
      const personalTabpanel = screen.getByRole('tabpanel', options);
      const [firstTabbable] = getAllByRole(personalTabpanel, 'textbox');

      const personalTab = getByRole(navbar, 'tab', options);
      personalTab.focus();

      // Act
      await user.tab();

      // Assert
      expect(firstTabbable).toHaveFocus();
    });

    it(`should focus the tabpanel's first tabbable element when the user tabs from the selected ${sectionTitles.links} tab`, async () => {
      // Arrange
      const result = await renderAppWithNavbarExpanded();
      const { addSectionsBtn, navbar, user } = result;

      // Show the "Add Sections" dialog.
      await user.click(addSectionsBtn);

      // Add the section.
      const options: ByRoleOptions = { name: `Add ${sectionTitles.links}` };
      const addLinksBtn = screen.getByRole('button', options);
      await user.click(addLinksBtn);

      // Hide the dialog.
      options.name = 'Close Popup';
      const closeDialogBtn = screen.getByRole('button', options);
      await user.click(closeDialogBtn);

      // Select the section.
      options.name = sectionTitles.links;
      const tab = getByRole(navbar, 'tab', options);
      await user.click(tab);

      const panel = screen.getByRole('tabpanel', options);
      const [firstTabbable] = getAllByRole(panel, 'textbox');

      // Act
      await user.tab();

      // Assert
      expect(firstTabbable).toHaveFocus();
    });

    it(`should focus the tabpanel's first tabbable element when the user tabs from the selected ${sectionTitles.skills} tab`, async () => {
      // Arrange
      const result = await renderAppWithNavbarExpanded();
      const { addSectionsBtn, navbar, user } = result;

      // Show the "Add Sections" dialog.
      await user.click(addSectionsBtn);

      // Add the section.
      const options: ByRoleOptions = { name: `Add ${sectionTitles.skills}` };
      const addSkillsBtn = screen.getByRole('button', options);
      await user.click(addSkillsBtn);

      // Hide the dialog.
      options.name = 'Close Popup';
      const closeDialogBtn = screen.getByRole('button', options);
      await user.click(closeDialogBtn);

      // Select the section.
      options.name = sectionTitles.skills;
      const tab = getByRole(navbar, 'tab', options);
      await user.click(tab);

      const panel = screen.getByRole('tabpanel', options);
      const [firstTabbable] = getAllByRole(panel, 'button');

      // Act
      await user.tab();

      // Assert
      expect(firstTabbable).toHaveFocus();
    });

    it(`should focus the tabpanel's first tabbable element when the user tabs from the selected ${sectionTitles.experience} tab`, async () => {
      // Arrange
      const result = await renderAppWithNavbarExpanded();
      const { addSectionsBtn, navbar, user } = result;

      // Show the "Add Sections" dialog.
      await user.click(addSectionsBtn);

      // Add the section.
      let name = `Add ${sectionTitles.experience}`;
      const addExperienceBtn = screen.getByRole('button', { name });
      await user.click(addExperienceBtn);

      // Hide the dialog.
      name = 'Close Popup';
      const closeDialogBtn = screen.getByRole('button', { name });
      await user.click(closeDialogBtn);

      // Select the section.
      name = sectionTitles.experience;
      const tab = getByRole(navbar, 'tab', { name });
      await user.click(tab);

      const panel = screen.getByRole('tabpanel', { name });
      const [firstTabbable] = getAllByRole(panel, 'button');

      // Act
      await user.tab();

      // Assert
      expect(firstTabbable).toHaveFocus();
    });

    it(`should focus the tabpanel's first tabbable element when the user tabs from the selected ${sectionTitles.projects} tab`, async () => {
      // Arrange
      const result = await renderAppWithNavbarExpanded();
      const { addSectionsBtn, navbar, user } = result;

      // Show the "Add Sections" dialog.
      await user.click(addSectionsBtn);

      // Add the section.
      let name = `Add ${sectionTitles.projects}`;
      const addProjectsBtn = screen.getByRole('button', { name });
      await user.click(addProjectsBtn);

      // Hide the dialog.
      name = 'Close Popup';
      const closeDialogBtn = screen.getByRole('button', { name });
      await user.click(closeDialogBtn);

      // Select the section.
      name = sectionTitles.projects;
      const tab = getByRole(navbar, 'tab', { name });
      await user.click(tab);

      const panel = screen.getByRole('tabpanel', { name });
      const [firstTabbable] = getAllByRole(panel, 'button');

      // Act
      await user.tab();

      // Assert
      expect(firstTabbable).toHaveFocus();
    });

    it(`should focus the tabpanel's first tabbable element when the user tabs from the selected ${sectionTitles.education} tab`, async () => {
      // Arrange
      const result = await renderAppWithNavbarExpanded();
      const { addSectionsBtn, navbar, user } = result;

      // Show the "Add Sections" dialog.
      await user.click(addSectionsBtn);

      // Add the section.
      let name = `Add ${sectionTitles.education}`;
      const addEducationBtn = screen.getByRole('button', { name });
      await user.click(addEducationBtn);

      // Hide the dialog.
      name = 'Close Popup';
      const closeDialogBtn = screen.getByRole('button', { name });
      await user.click(closeDialogBtn);

      // Select the section.
      name = sectionTitles.education;
      const tab = getByRole(navbar, 'tab', { name });
      await user.click(tab);

      const panel = screen.getByRole('tabpanel', { name });
      const [firstTabbable] = getAllByRole(panel, 'button');

      // Act
      await user.tab();

      // Assert
      expect(firstTabbable).toHaveFocus();
    });

    it(`should focus the tabpanel's first tabbable element when the user tabs from the selected ${sectionTitles.certifications} tab`, async () => {
      // Arrange
      const result = await renderAppWithNavbarExpanded();
      const { addSectionsBtn, navbar, user } = result;

      // Show the "Add Sections" dialog.
      await user.click(addSectionsBtn);

      // Add the section.
      let name = `Add ${sectionTitles.certifications}`;
      const addCertificationsBtn = screen.getByRole('button', { name });
      await user.click(addCertificationsBtn);

      // Hide the dialog.
      name = 'Close Popup';
      const closeDialogBtn = screen.getByRole('button', { name });
      await user.click(closeDialogBtn);

      // Select the section.
      name = sectionTitles.certifications;
      const tab = getByRole(navbar, 'tab', { name });
      await user.click(tab);

      const panel = screen.getByRole('tabpanel', { name });
      const [firstTabbable] = getAllByRole(panel, 'textbox');

      // Act
      await user.tab();

      // Assert
      expect(firstTabbable).toHaveFocus();
    });
  });

  describe('AppLayout', () => {
    describe('"Toggle Navigation" button', () => {
      it('should toggle the navbar on', async () => {
        // Arrange
        renderApp();
        const user = userEvent.setup();

        const toggleNavbarBtn = screen.getByRole('button', {
          name: 'Navigation',
          expanded: false,
        });

        // Act
        await user.click(toggleNavbarBtn);

        // Assert
        expect(toggleNavbarBtn).toHaveAttribute('aria-expanded', 'true');
      });

      it('should toggle the navbar off', async () => {
        // Arrange
        renderApp();
        const user = userEvent.setup();

        const toggleNavbarBtn = screen.getByRole('button', {
          name: 'Navigation',
          expanded: false,
        });

        await user.click(toggleNavbarBtn);

        // Act
        await user.click(toggleNavbarBtn);

        // Assert
        expect(toggleNavbarBtn).toHaveAttribute('aria-expanded', 'false');
      });
    });

    describe('"Add Sections" button', () => {
      it('should add sections', async () => {
        // Arrange
        const { addSectionsBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarExpanded();

        await user.click(addSectionsBtn);

        const addSectionsDialog = screen.getByRole('dialog', {
          name: 'Add Sections',
        });

        const addBtns = getAllByRole(addSectionsDialog, 'button', {
          name: /^Add (?!All Sections).+/,
        });

        // Act
        // The ID has the form "add-[sectionId]".
        const firstAddBtnId = addBtns[0].id;
        const firstAddedSectionId = firstAddBtnId.slice(4);

        await user.click(addBtns[0]);

        const thirdAddBtnId = addBtns[2].id;
        const secondAddedSectionId = thirdAddBtnId.slice(4);

        await user.click(addBtns[2]);

        const closeDialogBtn = screen.getByRole('button', {
          name: 'Close Popup',
        });

        await user.click(closeDialogBtn);

        const tabs = getAllByRole(navbar, 'tab');
        const [_, secondTab, thirdTab] = tabs;
        const [{ id: secondTabId }, { id: thirdTabId }] = [secondTab, thirdTab];

        // Assert
        expect(tabs).not.toEqual(initialTabs);
        expect(secondTabId).toBe(firstAddedSectionId);
        expect(thirdTabId).toBe(secondAddedSectionId);
      });
    });

    describe('"Toggle Editor Mode" button', () => {
      it('should toggle editor mode on', async () => {
        // Arrange
        const { toggleEditorModeBtn, user } =
          await renderAppWithNavbarExpanded();

        // Act
        await user.click(toggleEditorModeBtn);

        // Assert
        expect(toggleEditorModeBtn).toHaveAttribute('aria-pressed', 'true');
      });

      it('should toggle editor mode off', async () => {
        // Arrange
        const { toggleEditorModeBtn, user } =
          await renderAppWithNavbarExpanded();

        await user.click(toggleEditorModeBtn);

        // Act
        await user.click(toggleEditorModeBtn);

        // Assert
        expect(toggleEditorModeBtn).toHaveAttribute('aria-pressed', 'false');
      });
    });

    describe('Delete buttons', () => {
      it('should delete sections', async () => {
        // Arrange
        const {
          addSectionsBtn,
          initialTabs,
          navbar,
          toggleEditorModeBtn,
          user,
        } = await renderAppWithNavbarExpanded();

        await user.click(addSectionsBtn);

        const addBtns = screen.getAllByRole('button', {
          name: /^Add (?!All Sections).+/,
        });

        await user.click(addBtns[0]);
        await user.click(addBtns[2]);
        await user.click(addBtns[4]);

        const closeAddSectionsDialogBtn = screen.getByRole('button', {
          name: 'Close Popup',
        });

        await user.click(closeAddSectionsDialogBtn);
        await user.click(toggleEditorModeBtn);

        const deleteBtns = getAllByRole(navbar, 'button', {
          name: /Delete .+/,
        });

        // Act
        await user.click(deleteBtns[0]);
        await user.click(deleteBtns[1]);
        await user.click(deleteBtns[2]);
        const tabs = getAllByRole(navbar, 'tab');

        // Assert
        expect(tabs).toHaveLength(initialTabs.length);
      });
    });

    describe('"Clear All" button', () => {
      it("should do nothing to the toolbar when there's just one section", async () => {
        // Arrange
        const { clearAllBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        // Act
        await user.click(clearAllBtn);
        const tabs = getAllByRole(navbar, 'tab');

        // Assert
        expect(tabs).toEqual(initialTabs);
      });

      it('should delete all sections but "Personal Details" when several sections are active but not all', async () => {
        // Arrange
        const { addSectionsBtn, clearAllBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(addSectionsBtn);

        const addBtns = screen.getAllByRole('button', {
          name: /^Add (?!All Sections).+/,
        });

        await user.click(addBtns[0]);
        await user.click(addBtns[4]);
        await user.click(addBtns[1]);
        await user.click(addBtns.at(-1)!);

        // Act
        await user.click(clearAllBtn);
        const tabs = getAllByRole(navbar, 'tab');

        // Assert
        expect(tabs).toEqual(initialTabs);
      });

      it('should delete all sections but "Personal Details" when all sections are active', async () => {
        // Arrange
        const { addSectionsBtn, clearAllBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(addSectionsBtn);

        const addAllBtn = screen.getByRole('button', {
          name: 'Add All Sections',
        });

        await user.click(addAllBtn);

        // Act
        await user.click(clearAllBtn);
        const tabs = getAllByRole(navbar, 'tab');

        // Assert
        expect(tabs).toEqual(initialTabs);
      });

      it('should clear "Personal Details"', async () => {
        // Arrange
        const { initialTabs, toggleControlsBtn, user } =
          await renderAppWithNavbarAndControlsExpanded();

        // Focus "Personal Details".
        await act(async () => initialTabs[0].focus());

        // Focus the first input field in the tabpanel.
        await user.tab();
        const firstInput = document.activeElement;

        await user.keyboard('Some data');

        // Focus the next input field.
        await user.tab();
        const secondInput = document.activeElement;

        await user.keyboard('Some other data');

        await user.click(toggleControlsBtn);
        const clearAllBtn = screen.getByRole('menuitem', { name: 'Clear All' });

        // Act
        await user.click(clearAllBtn);

        // Assert
        expect(firstInput).toHaveValue('');
        expect(secondInput).toHaveValue('');
      });

      it("should clear sections permanently, so they're empty when re-added", async () => {
        // Arrange
        const result = await renderAppWithNavbarAndControlsExpanded();
        const { navbar, toggleControlsBtn, user } = result;
        let addSectionsBtn = result.addSectionsBtn;

        await user.click(addSectionsBtn);

        let addAll = screen.getByRole('button', { name: 'Add All Sections' });
        await user.click(addAll);

        let tabs = getAllByRole(navbar, 'tab');

        // Select the fourth tab.
        tabs[2].focus();
        await user.keyboard('{Enter}');

        let tabpanel = screen.getByRole('tabpanel');

        let textboxes: (HTMLInputElement | HTMLTextAreaElement)[] =
          getAllByRole(tabpanel, 'textbox');

        textboxes[0].focus();
        await user.keyboard('some input');

        textboxes[1].focus();
        await user.keyboard('some other input');

        // Repeat with the sixth tab.
        tabs[4].focus();
        await user.keyboard('{Enter}');

        tabpanel = screen.getByRole('tabpanel');
        textboxes = getAllByRole(tabpanel, 'textbox');

        textboxes[0].focus();
        await user.keyboard('some input');

        textboxes[1].focus();
        await user.keyboard('some other input');

        await user.click(toggleControlsBtn);
        const clearAllBtn = screen.getByRole('menuitem', { name: 'Clear All' });

        // Act
        await user.click(clearAllBtn);

        addSectionsBtn = getByRole(navbar, 'button', { name: 'Add Sections' });
        await user.click(addSectionsBtn);

        addAll = screen.getByRole('button', { name: 'Add All Sections' });
        await user.click(addAll);

        tabs = getAllByRole(navbar, 'tab');

        // Select the fourth tab again.
        tabs[2].focus();
        await user.keyboard('{Enter}');

        tabpanel = screen.getByRole('tabpanel');
        textboxes = getAllByRole(tabpanel, 'textbox');

        const firstUsedTextboxValue = textboxes[0].value;
        const secondUsedTextboxValue = textboxes[1].value;

        // Repeat with the sixth tab.
        tabs[4].focus();
        await user.keyboard('{Enter}');

        tabpanel = screen.getByRole('tabpanel');
        textboxes = getAllByRole(tabpanel, 'textbox');

        const thirdUsedTextboxValue = textboxes[0].value;
        const fourthUsedTextboxValue = textboxes[1].value;

        // Assert
        expect(firstUsedTextboxValue).toBe('');
        expect(secondUsedTextboxValue).toBe('');
        expect(thirdUsedTextboxValue).toBe('');
        expect(fourthUsedTextboxValue).toBe('');
      });
    });

    describe('"Fill All" button', () => {
      const correctPlaceholderData = getFilledData();

      it('should add all possible sections when there are inactive sections', async () => {
        // Arrange
        const { fillAllBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        /**
         * If I change the initial tabs to be all possible tabs, assertion will
         * remind me to rewrite the test.
         */
        expect(initialTabs.length).toBeLessThan(possibleSectionIds.length);

        // Act
        await user.click(fillAllBtn);

        const tabs = getAllByRole(navbar, 'tab');

        // Assert
        expect(tabs).toHaveLength(possibleSectionIds.length);

        const allPossibleIds = structuredClone(possibleSectionIds);
        const allIds = tabs.map(({ id }) => id);
        expect(allIds).toEqual(allPossibleIds);
      });

      it('should do nothing to the navbar when all sections are already active', async () => {
        // Arrange
        const { fillAllBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        /**
         * If I change the initial tabs to be all possible tabs, assertion will
         * remind me to rewrite the test.
         */
        expect(initialTabs.length).toBeLessThan(possibleSectionIds.length);

        // Make all sections active.
        await user.click(fillAllBtn);

        // Act
        await user.click(fillAllBtn);

        const tabs = getAllByRole(navbar, 'tab');

        // Assert
        expect(tabs).toHaveLength(possibleSectionIds.length);
      });

      it('should fill "Personal Details" with placeholder data', async () => {
        // Arrange
        const { fillAllBtn, user } =
          await renderAppWithNavbarAndControlsExpanded();

        // Act
        await user.click(fillAllBtn);

        const personalTabpanel = screen.getByRole('tabpanel', {
          name: sectionTitles.personal,
        });

        const address: HTMLInputElement = getByRole(
          personalTabpanel,
          'textbox',
          {
            name: 'Address',
          },
        );

        const phone: HTMLInputElement = getByRole(personalTabpanel, 'textbox', {
          name: 'Phone',
        });

        const summary: HTMLTextAreaElement = getByRole(
          personalTabpanel,
          'textbox',
          {
            name: 'Summary',
          },
        );

        // Assert
        expect(address).toHaveValue(correctPlaceholderData.personal.address);
        expect(phone).toHaveValue(correctPlaceholderData.personal.phone);
        expect(summary).toHaveValue(correctPlaceholderData.personal.summary);
      });

      it('should rewrite previous input in "Personal Details"', async () => {
        // Arrange
        const { user } = await renderAppWithNavbarExpanded();

        const personalTabpanel = screen.getByRole('tabpanel', {
          name: sectionTitles.personal,
        });

        // Enter some email.
        let name = 'Email';
        const email = getByRole(personalTabpanel, 'textbox', { name });
        email.focus();
        await user.keyboard('some input');

        // Enter some name.
        name = 'Full Name';
        const fullName = getByRole(personalTabpanel, 'textbox', { name });
        fullName.focus();
        await user.keyboard('some name');

        // Enter some summary.
        name = 'Summary';
        const summary = getByRole(personalTabpanel, 'textbox', { name });
        summary.focus();
        await user.keyboard('some summary');

        // Expand the control buttons again.

        const toggleControlsBtn = screen.getByRole('button', {
          name: 'Control Buttons',
          expanded: false,
        });

        await user.click(toggleControlsBtn);

        const fillAllBtn = screen.getByRole('menuitem', { name: 'Fill All' });

        // Act
        await user.click(fillAllBtn);

        // Assert
        expect(email).toHaveValue(correctPlaceholderData.personal.email);
        expect(fullName).toHaveValue(correctPlaceholderData.personal.fullName);
        expect(summary).toHaveValue(correctPlaceholderData.personal.summary);
      });

      it('should fill "Education" with placeholder data', async () => {
        // Arrange
        const { fillAllBtn, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        // Act
        await user.click(fillAllBtn);

        const educationTab = getByRole(navbar, 'tab', {
          name: sectionTitles.education,
        });

        // Select the "Education" section.
        await user.click(educationTab);

        const educationTabpanel = screen.getByRole('tabpanel');

        const address: HTMLInputElement = getByRole(
          educationTabpanel,
          'textbox',
          {
            name: 'Address',
          },
        );

        const uni: HTMLInputElement = getByRole(educationTabpanel, 'textbox', {
          name: 'University Name',
        });

        const firstBulletPoint: HTMLInputElement = getByRole(
          educationTabpanel,
          'textbox',
          {
            name: 'Bullet point 1',
          },
        );

        // Assert

        // Placeholder degrees
        const degrees = correctPlaceholderData.education.degrees;

        const shownDegreeIndex = 0;
        const shownDegreeCorrectPlaceholderData = degrees[shownDegreeIndex];

        expect(address).toHaveValue(shownDegreeCorrectPlaceholderData.address);
        expect(uni).toHaveValue(shownDegreeCorrectPlaceholderData.uni);

        expect(firstBulletPoint).toHaveValue(
          shownDegreeCorrectPlaceholderData.bulletPoints[0].value,
        );
      });

      it('should rewrite previous input in "Education"', async () => {
        // Arrange
        const result = await renderAppWithNavbarAndControlsExpanded();
        const { navbar, user } = result;
        let fillAllBtn = result.fillAllBtn;

        // Fill all sections for the first time.
        await user.click(fillAllBtn);

        const educationTab = getByRole(navbar, 'tab', {
          name: sectionTitles.education,
        });

        // Select the "Education" section.
        await user.click(educationTab);

        const educationTabpanel = screen.getByRole('tabpanel');

        const address: HTMLInputElement = getByRole(
          educationTabpanel,
          'textbox',
          {
            name: 'Address',
          },
        );

        const uni: HTMLInputElement = getByRole(educationTabpanel, 'textbox', {
          name: 'University Name',
        });

        let firstBulletPoint: HTMLInputElement = getByRole(
          educationTabpanel,
          'textbox',
          {
            name: 'Bullet point 1',
          },
        );

        // Modify the fields' values.

        address.focus();
        await user.keyboard('some address');

        uni.focus();
        await user.keyboard('some uni');

        firstBulletPoint.focus();
        await user.keyboard('some bullet');

        // Expand the control buttons again.

        const toggleControlsBtn = screen.getByRole('button', {
          name: 'Control Buttons',
          expanded: false,
        });

        await user.click(toggleControlsBtn);

        fillAllBtn = screen.getByRole('menuitem', { name: 'Fill All' });

        // Act
        await user.click(fillAllBtn);

        // The previous node has been replaced at the current stage.
        firstBulletPoint = getByRole(educationTabpanel, 'textbox', {
          name: 'Bullet point 1',
        });

        // Assert

        // Placeholder degrees
        const degrees = correctPlaceholderData.education.degrees;

        const shownDegreeIndex = 0;
        const shownDegreeCorrectPlaceholderData = degrees[shownDegreeIndex];

        expect(address).toHaveValue(shownDegreeCorrectPlaceholderData.address);
        expect(uni).toHaveValue(shownDegreeCorrectPlaceholderData.uni);

        expect(firstBulletPoint).toHaveValue(
          shownDegreeCorrectPlaceholderData.bulletPoints[0].value,
        );
      });

      it('should not rearrange tabs', async () => {
        // Arrange
        const result = await renderAppWithNavbarAndControlsExpanded();
        const { navbar, user } = result;

        // Show the "Add Sections" dialog.
        const options: ByRoleOptions = { name: 'Add Sections' };
        const addSectionsBtn = getByRole(navbar, 'button', options);
        await user.click(addSectionsBtn);

        // To be added sections' names.
        const firstName = sectionTitles.projects;
        const secondName = sectionTitles.links;
        const thirdName = sectionTitles.education;

        options.name = `Add ${firstName}`;
        const firstAddBtn = screen.getByRole('button', options);

        options.name = `Add ${secondName}`;
        const secondAddBtn = screen.getByRole('button', options);

        options.name = `Add ${thirdName}`;
        const thirdAddBtn = screen.getByRole('button', options);

        // Add the three sections
        await user.click(firstAddBtn);
        await user.click(secondAddBtn);
        await user.click(thirdAddBtn);

        // Close the dialog.
        await user.keyboard('{Escape}');

        // Expand the control buttons again.
        options.name = 'Control Buttons';
        options.expanded = false;
        const toggleControlsBtn = screen.getByRole('button', options);
        await user.click(toggleControlsBtn);

        const fillAllBtn = screen.getByRole('menuitem', { name: 'Fill All' });

        // Act
        await user.click(fillAllBtn);

        const tabs = getAllByRole(navbar, 'tab');

        // Assert
        expect(tabs[1]).toHaveAccessibleName(firstName);
        expect(tabs[2]).toHaveAccessibleName(secondName);
        expect(tabs[3]).toHaveAccessibleName(thirdName);
      });
    });
  });

  describe('Section wiring', () => {
    const cases = [
      {
        sectionTitle: sectionTitles.personal,
        textboxName: 'Summary',
        testValue: "I'm great",
      },
      {
        sectionTitle: sectionTitles.links,
        textboxName: 'GitHub (link)',
        testValue: 'my-github.com',
      },
      {
        sectionTitle: sectionTitles.experience,
        textboxName: 'Job Title',
        testValue: 'Homeless General',
      },
      {
        sectionTitle: sectionTitles.projects,
        textboxName: 'Tech Stack',
        testValue: "It's a good stack, sir",
      },
      {
        sectionTitle: sectionTitles.education,
        textboxName: 'Address',
        testValue: 'Milky Way, Universe',
      },
      {
        sectionTitle: sectionTitles.certifications,
        textboxName: 'Skills',
        testValue: "I'm very very skillful",
      },
    ];

    it.each(cases)(
      'should correctly wire data for $sectionTitle',
      async ({ sectionTitle, textboxName, testValue }) => {
        // Arrange
        const result = await renderAppWithNavbarAndControlsExpanded();
        const { fillAllBtn, navbar, user } = result;

        await user.click(fillAllBtn);

        // Select the section.
        const tab = getByRole(navbar, 'tab', { name: sectionTitle });
        await user.click(tab);

        const panel = screen.getByRole('tabpanel', { name: sectionTitle });

        type Textbox = HTMLInputElement | HTMLTextAreaElement;
        const options = { name: textboxName };
        const textbox: Textbox = getByRole(panel, 'textbox', options);
        const initialValue = textbox.value;

        // Act
        await user.type(textbox, testValue);

        // Assert
        expect(textbox).toHaveValue(initialValue + testValue);
      },
    );

    it(`should correctly wire data for ${sectionTitles.skills}`, async () => {
      // Arrange
      const result = await renderAppWithNavbarAndControlsExpanded();
      const { fillAllBtn, navbar, user } = result;

      await user.click(fillAllBtn);

      // Select the section.
      const tab = getByRole(navbar, 'tab', { name: sectionTitles.skills });
      await user.click(tab);

      const opt: ByRoleOptions = { name: sectionTitles.skills };
      const panel = screen.getByRole('tabpanel', opt);

      opt.name = 'Languages';
      const languages = getByRole(panel, 'group', { name: 'Languages' });

      opt.name = 'Bullet point 1';
      const textbox: HTMLInputElement = getByRole(languages, 'textbox', opt);
      const initialValue = textbox.value;

      // Act
      await user.type(textbox, 'Spanish');

      // Assert
      expect(textbox).toHaveValue(initialValue + 'Spanish');
    });
  });
});
