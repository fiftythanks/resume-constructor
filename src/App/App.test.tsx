import {
  getAllByRole,
  getByRole,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import getFilledData from '@/hooks/useResumeData/getFilledData';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import App from './App';

import type { ByRoleOptions } from '@testing-library/react';

function renderApp() {
  render(<App />);
}

async function renderAppWithNavbarExpanded() {
  renderApp();
  const user = userEvent.setup();

  const toggleNavbarBtn = screen.getByRole('button', {
    expanded: false,
    name: 'Navigation',
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
    expanded: false,
    name: 'Toolbar',
  });

  await renderAppWithNavbarExpandedReturn.user.click(toggleControlsBtn);

  const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });
  const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });

  return {
    ...renderAppWithNavbarExpandedReturn,
    clearAllBtn,
    fillAllBtn,
    toggleControlsBtn,
  };
}

describe('App', () => {
  beforeEach(() => {
    const popupRoot = document.createElement('div');
    popupRoot.id = 'popup-root';
    document.body.appendChild(popupRoot);
  });

  afterEach(() => {
    document.getElementById('popup-root')?.remove();
  });

  it('should announce to screen readers when a bullet point is deleted', async () => {
    // Arrange
    const result = await renderAppWithNavbarExpanded();
    const { addSectionsBtn, navbar, user } = result;

    // Show the "Add Sections" dialog
    await user.click(addSectionsBtn);

    // Add the "Skills" section
    const addSkillsBtn = screen.getByRole('button', {
      name: `Add ${sectionTitles.skills}`,
    });
    await user.click(addSkillsBtn);

    // Close the dialog
    const closeBtn = screen.getByRole('button', { name: 'Close Popup' });
    await user.click(closeBtn);

    // Select the "Skills" section
    const tab = getByRole(navbar, 'tab', { name: sectionTitles.skills });
    await user.click(tab);

    const panel = screen.getByRole('tabpanel', { name: sectionTitles.skills });
    const [deleteBullet] = getAllByRole(panel, 'button', {
      name: 'Delete bullet point 1',
    });

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

    // Act & Assert
    // The default selected section is "Personal Details"
    expect(
      screen.getByRole('tabpanel', { name: sectionTitles.personal }),
    ).toBeInTheDocument();

    // Select "Education"
    const educationTab = getByRole(navbar, 'tab', { name: 'Education' });
    await user.click(educationTab);

    expect(
      screen.getByRole('tabpanel', { name: sectionTitles.education }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('tabpanel', { name: sectionTitles.personal }),
    ).not.toBeInTheDocument();
  });

  it('should render `AppLayout`', () => {
    // Arrange & Act
    renderApp();

    const appLayout = screen.getByTestId('app-layout');

    // Assert
    expect(appLayout).toBeInTheDocument();
  });

  describe("Tabbing to tabpanels' first tabbable elements", () => {
    const cases = [
      {
        isInitial: true,
        role: 'textbox' as const,
        title: sectionTitles.personal,
      },
      {
        isInitial: false,
        role: 'textbox' as const,
        title: sectionTitles.links,
      },
      {
        isInitial: false,
        role: 'button' as const,
        title: sectionTitles.skills,
      },
      {
        isInitial: false,
        role: 'button' as const,
        title: sectionTitles.experience,
      },
      {
        isInitial: false,
        role: 'button' as const,
        title: sectionTitles.projects,
      },
      {
        isInitial: false,
        role: 'button' as const,
        title: sectionTitles.education,
      },
      {
        isInitial: false,
        role: 'textbox' as const,
        title: sectionTitles.certifications,
      },
    ];

    it.each(cases)(
      "should focus the tabpanel's first tabbable element when the user tabs from the selected $title tab",
      async ({ isInitial, role, title }) => {
        // Arrange
        const { addSectionsBtn, navbar, user } =
          await renderAppWithNavbarExpanded();

        if (!isInitial) {
          await user.click(addSectionsBtn);
          const addBtn = screen.getByRole('button', {
            name: `Add ${title}`,
          });
          await user.click(addBtn);

          const closeDialogBtn = screen.getByRole('button', {
            name: 'Close Popup',
          });
          await user.click(closeDialogBtn);
        }

        const tab = getByRole(navbar, 'tab', { name: title });
        await user.click(tab);

        const panel = screen.getByRole('tabpanel', { name: title });
        const [firstTabbable] = getAllByRole(panel, role);

        tab.focus();

        // Act
        await user.tab();

        // Assert
        expect(firstTabbable).toHaveFocus();
      },
    );
  });

  describe('AppLayout', () => {
    describe('"Toggle Navigation" button', () => {
      it('should toggle the navbar on', async () => {
        // Arrange
        renderApp();
        const user = userEvent.setup();

        const toggleNavbarBtn = screen.getByRole('button', {
          expanded: false,
          name: 'Navigation',
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
          expanded: false,
          name: 'Navigation',
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
        // The ID has the form "add-[sectionId]"
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
        const [, secondTab, thirdTab] = tabs;

        // Assert
        expect(tabs).not.toEqual(initialTabs);
        expect(secondTab).toHaveAttribute('id', firstAddedSectionId);
        expect(thirdTab).toHaveAttribute('id', secondAddedSectionId);
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
        const { initialTabs, user } =
          await renderAppWithNavbarAndControlsExpanded();

        // Focus "Personal Details"
        initialTabs[0].focus();

        // Focus the first input field in the tabpanel
        await user.tab();
        const firstInput = document.activeElement;

        await user.keyboard('Some data');

        // Focus the next input field
        await user.tab();
        const secondInput = document.activeElement;

        await user.keyboard('Some other data');

        const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });

        // Act
        await user.click(clearAllBtn);

        // Assert
        expect(firstInput).toHaveValue('');
        expect(secondInput).toHaveValue('');
      });

      it("should clear sections permanently, so they're empty when re-added", async () => {
        // Arrange
        const result = await renderAppWithNavbarAndControlsExpanded();
        const { navbar, user } = result;
        let addSectionsBtn = result.addSectionsBtn;

        await user.click(addSectionsBtn);

        let addAll = screen.getByRole('button', { name: 'Add All Sections' });
        await user.click(addAll);

        let tabs = getAllByRole(navbar, 'tab');

        // Select the fourth tab
        tabs[2].focus();
        await user.keyboard('{Enter}');

        let tabpanel = screen.getByRole('tabpanel');

        let textboxes: (HTMLInputElement | HTMLTextAreaElement)[] =
          getAllByRole(tabpanel, 'textbox');

        textboxes[0].focus();
        await user.keyboard('some input');

        textboxes[1].focus();
        await user.keyboard('some other input');

        // Repeat with the sixth tab
        tabs[4].focus();
        await user.keyboard('{Enter}');

        tabpanel = screen.getByRole('tabpanel');
        textboxes = getAllByRole(tabpanel, 'textbox');

        textboxes[0].focus();
        await user.keyboard('some input');

        textboxes[1].focus();
        await user.keyboard('some other input');

        const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });

        // Act
        await user.click(clearAllBtn);

        addSectionsBtn = getByRole(navbar, 'button', { name: 'Add Sections' });
        await user.click(addSectionsBtn);

        addAll = screen.getByRole('button', { name: 'Add All Sections' });
        await user.click(addAll);

        tabs = getAllByRole(navbar, 'tab');

        // Select the fourth tab again
        tabs[2].focus();
        await user.keyboard('{Enter}');

        tabpanel = screen.getByRole('tabpanel');
        textboxes = getAllByRole(tabpanel, 'textbox');

        // Assert fourth tab textboxes are cleared
        expect(textboxes[0]).toHaveValue('');
        expect(textboxes[1]).toHaveValue('');

        // Repeat with the sixth tab
        tabs[4].focus();
        await user.keyboard('{Enter}');

        tabpanel = screen.getByRole('tabpanel');
        textboxes = getAllByRole(tabpanel, 'textbox');

        // Assert sixth tab textboxes are cleared
        expect(textboxes[0]).toHaveValue('');
        expect(textboxes[1]).toHaveValue('');
      });
    });

    describe('"Fill All" button', () => {
      const correctPlaceholderData = getFilledData();

      it('should add all possible sections when there are inactive sections', async () => {
        // Arrange
        const { fillAllBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        /**
         * If the initial tabs are changed to all possible tabs, assertion will
         * remind us to update the test.
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

        expect(initialTabs.length).toBeLessThan(possibleSectionIds.length);

        // Make all sections active
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

        const address = getByRole(personalTabpanel, 'textbox', {
          name: 'Address',
        });

        const phone = getByRole(personalTabpanel, 'textbox', {
          name: 'Phone',
        });

        const summary = getByRole(personalTabpanel, 'textbox', {
          name: 'Summary',
        });

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

        // Enter some email
        const email = getByRole(personalTabpanel, 'textbox', { name: 'Email' });
        email.focus();
        await user.keyboard('some input');

        // Enter some name
        const fullName = getByRole(personalTabpanel, 'textbox', {
          name: 'Full Name',
        });
        fullName.focus();
        await user.keyboard('some name');

        // Enter some summary
        const summary = getByRole(personalTabpanel, 'textbox', {
          name: 'Summary',
        });
        summary.focus();
        await user.keyboard('some summary');

        const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });

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

        // Select the "Education" section
        await user.click(educationTab);

        const educationTabpanel = screen.getByRole('tabpanel');

        const address = getByRole(educationTabpanel, 'textbox', {
          name: 'Address',
        });

        const uni = getByRole(educationTabpanel, 'textbox', {
          name: 'University Name',
        });

        const firstBulletPoint = getByRole(educationTabpanel, 'textbox', {
          name: 'Bullet point 1',
        });

        // Assert
        const degrees = correctPlaceholderData.education.degrees;
        const shownDegreeCorrectPlaceholderData = degrees[0];

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

        // Fill all sections for the first time
        await user.click(fillAllBtn);

        const educationTab = getByRole(navbar, 'tab', {
          name: sectionTitles.education,
        });

        // Select the "Education" section
        await user.click(educationTab);

        const educationTabpanel = screen.getByRole('tabpanel');

        const address = getByRole(educationTabpanel, 'textbox', {
          name: 'Address',
        });

        const uni = getByRole(educationTabpanel, 'textbox', {
          name: 'University Name',
        });

        let firstBulletPoint = getByRole(educationTabpanel, 'textbox', {
          name: 'Bullet point 1',
        });

        // Modify the fields' values
        address.focus();
        await user.keyboard('some address');

        uni.focus();
        await user.keyboard('some uni');

        firstBulletPoint.focus();
        await user.keyboard('some bullet');

        fillAllBtn = screen.getByRole('button', { name: 'Fill All' });

        // Act
        await user.click(fillAllBtn);

        // The previous node has been replaced at the current stage
        firstBulletPoint = getByRole(educationTabpanel, 'textbox', {
          name: 'Bullet point 1',
        });

        // Assert
        const degrees = correctPlaceholderData.education.degrees;
        const shownDegreeCorrectPlaceholderData = degrees[0];

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

        // Show the "Add Sections" dialog
        const options: ByRoleOptions = { name: 'Add Sections' };
        const addSectionsBtn = getByRole(navbar, 'button', options);
        await user.click(addSectionsBtn);

        // To be added sections' names
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

        // Close the dialog
        await user.keyboard('{Escape}');

        const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });

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
        testValue: "I'm great",
        textboxName: 'Summary',
      },
      {
        sectionTitle: sectionTitles.links,
        testValue: 'my-github.com',
        textboxName: 'GitHub (link)',
      },
      {
        sectionTitle: sectionTitles.experience,
        testValue: 'Homeless General',
        textboxName: 'Job Title',
      },
      {
        sectionTitle: sectionTitles.projects,
        testValue: "It's a good stack, sir",
        textboxName: 'Tech Stack',
      },
      {
        sectionTitle: sectionTitles.education,
        testValue: 'Milky Way, Universe',
        textboxName: 'Address',
      },
      {
        sectionTitle: sectionTitles.certifications,
        testValue: "I'm very very skillful",
        textboxName: 'Skills',
      },
      {
        groupName: 'Languages',
        sectionTitle: sectionTitles.skills,
        testValue: 'Spanish',
        textboxName: 'Bullet point 1',
      },
    ];

    it.each(cases)(
      'should correctly wire data for $sectionTitle',
      async ({ groupName, sectionTitle, testValue, textboxName }) => {
        // Arrange
        const result = await renderAppWithNavbarAndControlsExpanded();
        const { fillAllBtn, navbar, user } = result;

        await user.click(fillAllBtn);

        // Select the section
        const tab = getByRole(navbar, 'tab', { name: sectionTitle });
        await user.click(tab);

        const panel = screen.getByRole('tabpanel', { name: sectionTitle });
        const container = groupName
          ? getByRole(panel, 'group', { name: groupName })
          : panel;
        const textbox = getByRole(container, 'textbox', { name: textboxName });
        const initialValue = (textbox as HTMLInputElement | HTMLTextAreaElement)
          .value;

        // Act
        await user.type(textbox, testValue);

        // Assert
        expect(textbox).toHaveValue(initialValue + testValue);
      },
    );
  });
});
