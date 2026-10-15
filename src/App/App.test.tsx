import { render } from 'vitest-browser-react';
import { type Locator, page, userEvent } from 'vitest/browser';

import getFilledData from '@/hooks/useResumeData/getFilledData';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import App from './App';

function getTextboxValue(locator: Locator) {
  const el = locator.element();
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
    ? el.value
    : '';
}

async function renderApp() {
  await render(<div id="popup-root" />);
  await render(<App />);
}

async function renderAppWithNavbarExpanded() {
  await renderApp();
  const user = userEvent.setup();

  const toggleNavbarBtn = page.getByRole('button', {
    name: 'Navigation',
  });

  await user.click(toggleNavbarBtn);

  const navbar = page.getByRole('navigation', { name: 'Navigation' });
  const initialTabs = navbar
    .getByRole('tab')
    .all()
    .map((tab) => tab.element());
  const addSectionsBtn = page.getByRole('button', { name: 'Add Sections' });

  const toggleEditorModeBtn = page.getByRole('button', {
    name: 'Toggle Editor Mode',
  });

  return { addSectionsBtn, initialTabs, navbar, toggleEditorModeBtn, user };
}

async function renderAppWithNavbarAndControlsExpanded() {
  const renderAppWithNavbarExpandedReturn = await renderAppWithNavbarExpanded();

  const toggleControlsBtn = page.getByRole('button', {
    name: 'Toolbar',
  });

  await renderAppWithNavbarExpandedReturn.user.click(toggleControlsBtn);

  const clearAllBtn = page.getByRole('button', { name: 'Clear All' });
  const fillAllBtn = page.getByRole('button', { name: 'Fill All' });

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
    const addSkillsBtn = page.getByRole('button', {
      name: `Add ${sectionTitles.skills}`,
    });
    await user.click(addSkillsBtn);

    // Close the dialog.
    const closeBtn = page.getByRole('button', { name: 'Close Popup' });
    await user.click(closeBtn);

    // Select the "Skills" section.
    const tab = navbar.getByRole('tab', { name: sectionTitles.skills });
    await user.click(tab);

    const panel = page.getByRole('tabpanel', { name: sectionTitles.skills });

    const [deleteBullet] = panel
      .getByRole('button', { name: 'Delete bullet point 1' })
      .all();

    // Act
    await user.click(deleteBullet);

    // Assert
    const announcement = page.getByTestId('screen-reader-announcement');
    await expect
      .element(announcement)
      .toHaveTextContent('Bullet point 1 was deleted.');
  });

  it('should render the correct tabpanel', async () => {
    // Arrange
    const result = await renderAppWithNavbarAndControlsExpanded();
    const { fillAllBtn, navbar, user } = result;

    await user.click(fillAllBtn);

    // Act

    // The default selected section is "Personal Details".
    const personalTabpanel = page
      .getByRole('tabpanel', {
        name: sectionTitles.personal,
      })
      .element();

    // Select "Education"
    const educationTab = navbar.getByRole('tab', { name: 'Education' });
    await user.click(educationTab);

    const educationTabpanel = page.getByRole('tabpanel', {
      name: sectionTitles.education,
    });

    // Assert
    expect(personalTabpanel).not.toBeNull();
    await expect.element(educationTabpanel).toBeInTheDocument();
  });

  it('should render `AppLayout`', async () => {
    await renderApp();

    const appLayout = page.getByTestId('app-layout');

    await expect.element(appLayout).toBeInTheDocument();
  });

  describe('Focus retention', () => {
    const cases = [
      {
        itemName: 'Job',
        sectionTitle: sectionTitles.experience,
      },
      {
        itemName: 'Project',
        sectionTitle: sectionTitles.projects,
      },
      {
        itemName: 'Degree',
        sectionTitle: sectionTitles.education,
      },
    ];

    it.each(cases)(
      'should retain focus on the Add button when deleting an item down to one in $sectionTitle',
      async ({ itemName, sectionTitle }) => {
        const result = await renderAppWithNavbarExpanded();
        const { addSectionsBtn, navbar, user } = result;

        await user.click(addSectionsBtn);

        const addSectionBtn = page.getByRole('button', {
          name: `Add ${sectionTitle}`,
        });
        await user.click(addSectionBtn);

        const closeDialogBtn = page.getByRole('button', {
          name: 'Close Popup',
        });
        await user.click(closeDialogBtn);

        const tab = navbar.getByRole('tab', { name: sectionTitle });
        await user.click(tab);

        const addBtn = page.getByRole('button', {
          name: `Add ${itemName} 2`,
        });
        await user.click(addBtn);
        const deleteBtn = page.getByRole('button', {
          name: `Delete ${itemName} 2`,
        });

        await user.click(deleteBtn);

        await expect
          .element(page.getByRole('button', { name: `Add ${itemName} 2` }))
          .toHaveFocus();
      },
    );

    it.each(cases)(
      'should retain focus on the Previous button when navigating forward to the last item in $sectionTitle',
      async ({ itemName, sectionTitle }) => {
        const result = await renderAppWithNavbarExpanded();
        const { addSectionsBtn, navbar, user } = result;

        await user.click(addSectionsBtn);

        const addSectionBtn = page.getByRole('button', {
          name: `Add ${sectionTitle}`,
        });
        await user.click(addSectionBtn);

        const closeDialogBtn = page.getByRole('button', {
          name: 'Close Popup',
        });
        await user.click(closeDialogBtn);

        const tab = navbar.getByRole('tab', { name: sectionTitle });
        await user.click(tab);

        const addBtn = page.getByRole('button', {
          name: `Add ${itemName} 2`,
        });
        await user.click(addBtn);

        const prevBtn = page.getByRole('button', {
          name: `Show Previous ${itemName}`,
        });
        await user.click(prevBtn);

        const nextBtn = page.getByRole('button', {
          name: `Show Next ${itemName}`,
        });
        await user.click(nextBtn);

        await expect
          .element(
            page.getByRole('button', { name: `Show Previous ${itemName}` }),
          )
          .toHaveFocus();
      },
    );

    it.each(cases)(
      'should retain focus on the Next button when navigating back to the first item in $sectionTitle',
      async ({ itemName, sectionTitle }) => {
        const result = await renderAppWithNavbarExpanded();
        const { addSectionsBtn, navbar, user } = result;

        await user.click(addSectionsBtn);

        const addSectionBtn = page.getByRole('button', {
          name: `Add ${sectionTitle}`,
        });
        await user.click(addSectionBtn);

        const closeDialogBtn = page.getByRole('button', {
          name: 'Close Popup',
        });
        await user.click(closeDialogBtn);

        const tab = navbar.getByRole('tab', { name: sectionTitle });
        await user.click(tab);

        const addBtn = page.getByRole('button', {
          name: `Add ${itemName} 2`,
        });
        await user.click(addBtn);

        const prevBtn = page.getByRole('button', {
          name: `Show Previous ${itemName}`,
        });

        await user.click(prevBtn);

        await expect
          .element(page.getByRole('button', { name: `Show Next ${itemName}` }))
          .toHaveFocus();
      },
    );
  });

  describe('AppLayout', () => {
    describe('"Toggle Navigation" button', () => {
      it('should toggle the navbar on', async () => {
        // Arrange
        await renderApp();
        const user = userEvent.setup();

        const toggleNavbarBtn = page.getByRole('button', {
          name: 'Navigation',
        });

        // Act
        await user.click(toggleNavbarBtn);

        // Assert
        await expect
          .element(toggleNavbarBtn)
          .toHaveAttribute('aria-expanded', 'true');
      });

      it('should toggle the navbar off', async () => {
        // Arrange
        await renderApp();
        const user = userEvent.setup();

        const toggleNavbarBtn = page.getByRole('button', {
          name: 'Navigation',
        });

        await user.click(toggleNavbarBtn);

        // Act
        await user.click(toggleNavbarBtn);

        // Assert
        await expect
          .element(toggleNavbarBtn)
          .toHaveAttribute('aria-expanded', 'false');
      });
    });

    describe('"Add Sections" button', () => {
      it('should add sections', async () => {
        // Arrange
        const { addSectionsBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarExpanded();

        await user.click(addSectionsBtn);

        const addSectionsDialog = page.getByRole('dialog', {
          name: 'Add Sections',
        });

        const addBtns = addSectionsDialog
          .getByRole('button', {
            name: /^Add (?!All Sections).+/,
          })
          .all()
          .map((btn) => btn.element());

        // Act
        // The ID has the form "add-[sectionId]".
        const firstAddBtnId = addBtns[0].id;
        const firstAddedSectionId = firstAddBtnId.slice(4);

        await user.click(addBtns[0]);

        const thirdAddBtnId = addBtns[2].id;
        const secondAddedSectionId = thirdAddBtnId.slice(4);

        await user.click(addBtns[2]);

        const closeDialogBtn = page.getByRole('button', {
          name: 'Close Popup',
        });

        await user.click(closeDialogBtn);

        const tabs = navbar
          .getByRole('tab')
          .all()
          .map((tab) => tab.element());
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
        await expect
          .element(toggleEditorModeBtn)
          .toHaveAttribute('aria-pressed', 'true');
      });

      it('should toggle editor mode off', async () => {
        // Arrange
        const { toggleEditorModeBtn, user } =
          await renderAppWithNavbarExpanded();

        await user.click(toggleEditorModeBtn);

        // Act
        await user.click(toggleEditorModeBtn);

        // Assert
        await expect
          .element(toggleEditorModeBtn)
          .toHaveAttribute('aria-pressed', 'false');
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

        const addSectionsDialog = page.getByRole('dialog', {
          name: 'Add Sections',
        });

        const addBtns = addSectionsDialog
          .getByRole('button', {
            name: /^Add (?!All Sections).+/,
          })
          .all()
          .map((btn) => btn.element());

        await user.click(addBtns[0]);
        await user.click(addBtns[2]);
        await user.click(addBtns[4]);

        const closeAddSectionsDialogBtn = page.getByRole('button', {
          name: 'Close Popup',
        });

        await user.click(closeAddSectionsDialogBtn);
        await user.click(toggleEditorModeBtn);

        const deleteBtns = navbar
          .getByRole('button', {
            name: /Delete .+/,
          })
          .all()
          .map((btn) => btn.element());

        // Act
        await user.click(deleteBtns[0]);
        await user.click(deleteBtns[1]);
        await user.click(deleteBtns[2]);
        const tabs = navbar
          .getByRole('tab')
          .all()
          .map((tab) => tab.element());

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
        const tabs = navbar
          .getByRole('tab')
          .all()
          .map((tab) => tab.element());

        // Assert
        expect(tabs).toEqual(initialTabs);
      });

      it('should delete all sections but "Personal Details" when several sections are active but not all', async () => {
        // Arrange
        const { addSectionsBtn, clearAllBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(addSectionsBtn);

        const addSectionsDialog = page.getByRole('dialog', {
          name: 'Add Sections',
        });

        const addBtns = addSectionsDialog
          .getByRole('button', {
            name: /^Add (?!All Sections).+/,
          })
          .all()
          .map((btn) => btn.element());

        await user.click(addBtns[0]);
        await user.click(addBtns[4]);
        await user.click(addBtns[1]);
        await user.click(addBtns[addBtns.length - 1]);

        const closeAddSectionsDialogBtn = page.getByRole('button', {
          name: 'Close Popup',
        });
        await user.click(closeAddSectionsDialogBtn);

        // Act
        await user.click(clearAllBtn);
        const tabs = navbar
          .getByRole('tab')
          .all()
          .map((tab) => tab.element());

        // Assert
        expect(tabs).toEqual(initialTabs);
      });

      it('should delete all sections but "Personal Details" when all sections are active', async () => {
        // Arrange
        const { addSectionsBtn, clearAllBtn, initialTabs, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(addSectionsBtn);

        const addAllBtn = page.getByRole('button', {
          name: 'Add All Sections',
        });

        await user.click(addAllBtn);

        // Act
        await user.click(clearAllBtn);
        const tabs = navbar
          .getByRole('tab')
          .all()
          .map((tab) => tab.element());

        // Assert
        expect(tabs).toEqual(initialTabs);
      });

      it('should clear "Personal Details"', async () => {
        // Arrange
        const { initialTabs, user } =
          await renderAppWithNavbarAndControlsExpanded();

        // Focus "Personal Details".
        initialTabs[0].focus();

        // Focus the first input field in the tabpanel.
        await user.keyboard('{Tab}');
        const firstInput =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        await user.keyboard('Some data');

        // Focus the next input field.
        await user.keyboard('{Tab}');
        const secondInput =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        await user.keyboard('Some other data');

        const clearAllBtn = page.getByRole('button', { name: 'Clear All' });

        // Act
        await user.click(clearAllBtn);

        // Assert
        await expect.element(firstInput).toHaveValue('');
        await expect.element(secondInput).toHaveValue('');
      });

      it("should clear sections permanently, so they're empty when re-added", async () => {
        // Arrange
        const result = await renderAppWithNavbarAndControlsExpanded();
        const { navbar, user } = result;
        let addSectionsBtn = result.addSectionsBtn;

        await user.click(addSectionsBtn);

        let addAll = page.getByRole('button', { name: 'Add All Sections' });
        await user.click(addAll);

        let tabs = navbar
          .getByRole('tab')
          .all()
          .map((tab) => tab.element());

        // Select the fourth tab.
        tabs[2].focus();
        await user.keyboard('{Enter}');

        let tabpanel = page.getByRole('tabpanel');

        let textboxes = tabpanel
          .getByRole('textbox')
          .all()
          .map((textbox) => textbox.element());

        textboxes[0].focus();
        await user.keyboard('some input');

        textboxes[1].focus();
        await user.keyboard('some other input');

        // Repeat with the sixth tab.
        tabs[4].focus();
        await user.keyboard('{Enter}');

        tabpanel = page.getByRole('tabpanel');
        textboxes = tabpanel
          .getByRole('textbox')
          .all()
          .map((textbox) => textbox.element());

        textboxes[0].focus();
        await user.keyboard('some input');

        textboxes[1].focus();
        await user.keyboard('some other input');

        const clearAllBtn = page.getByRole('button', { name: 'Clear All' });

        // Act
        await user.click(clearAllBtn);

        addSectionsBtn = navbar.getByRole('button', { name: 'Add Sections' });
        await user.click(addSectionsBtn);

        addAll = page.getByRole('button', { name: 'Add All Sections' });
        await user.click(addAll);

        tabs = navbar
          .getByRole('tab')
          .all()
          .map((tab) => tab.element());

        // Select the fourth tab again.
        tabs[2].focus();
        await user.keyboard('{Enter}');

        tabpanel = page.getByRole('tabpanel');
        let textboxLocators = tabpanel.getByRole('textbox').all();

        const firstUsedTextboxValue = getTextboxValue(textboxLocators[0]);
        const secondUsedTextboxValue = getTextboxValue(textboxLocators[1]);

        // Repeat with the sixth tab.
        tabs[4].focus();
        await user.keyboard('{Enter}');

        tabpanel = page.getByRole('tabpanel');
        textboxLocators = tabpanel.getByRole('textbox').all();

        const thirdUsedTextboxValue = getTextboxValue(textboxLocators[0]);
        const fourthUsedTextboxValue = getTextboxValue(textboxLocators[1]);

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

        const tabs = navbar
          .getByRole('tab')
          .all()
          .map((tab) => tab.element());

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

        const tabs = navbar.getByRole('tab').all();

        // Assert
        expect(tabs).toHaveLength(possibleSectionIds.length);
      });

      it('should fill "Personal Details" with placeholder data', async () => {
        // Arrange
        const { fillAllBtn, user } =
          await renderAppWithNavbarAndControlsExpanded();

        // Act
        await user.click(fillAllBtn);

        const personalTabpanel = page.getByRole('tabpanel', {
          name: sectionTitles.personal,
        });

        const address = personalTabpanel.getByRole('textbox', {
          name: 'Address',
        });

        const phone = personalTabpanel.getByRole('textbox', {
          name: 'Phone',
        });

        const summary = personalTabpanel.getByRole('textbox', {
          name: 'Summary',
        });

        // Assert
        await expect
          .element(address)
          .toHaveValue(correctPlaceholderData.personal.address);
        await expect
          .element(phone)
          .toHaveValue(correctPlaceholderData.personal.phone);
        await expect
          .element(summary)
          .toHaveValue(correctPlaceholderData.personal.summary);
      });

      it('should rewrite previous input in "Personal Details"', async () => {
        // Arrange
        const { fillAllBtn, user } =
          await renderAppWithNavbarAndControlsExpanded();

        const personalTabpanel = page.getByRole('tabpanel', {
          name: sectionTitles.personal,
        });

        // Enter some email.
        const email = personalTabpanel.getByRole('textbox', { name: 'Email' });
        email.element().focus();
        await user.keyboard('some input');

        // Enter some name.
        const fullName = personalTabpanel.getByRole('textbox', {
          name: 'Full Name',
        });
        fullName.element().focus();
        await user.keyboard('some name');

        // Enter some summary.
        const summary = personalTabpanel.getByRole('textbox', {
          name: 'Summary',
        });
        summary.element().focus();
        await user.keyboard('some summary');

        // Act
        await user.click(fillAllBtn);

        // Assert
        await expect
          .element(email)
          .toHaveValue(correctPlaceholderData.personal.email);
        await expect
          .element(fullName)
          .toHaveValue(correctPlaceholderData.personal.fullName);
        await expect
          .element(summary)
          .toHaveValue(correctPlaceholderData.personal.summary);
      });

      it('should fill "Education" with placeholder data', async () => {
        // Arrange
        const { fillAllBtn, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        // Act
        await user.click(fillAllBtn);

        const educationTab = navbar.getByRole('tab', {
          name: sectionTitles.education,
        });

        // Select the "Education" section.
        await user.click(educationTab);

        const educationTabpanel = page.getByRole('tabpanel');

        const address = educationTabpanel.getByRole('textbox', {
          name: 'Address',
        });

        const uni = educationTabpanel.getByRole('textbox', {
          name: 'University Name',
        });

        const firstBulletPoint = educationTabpanel.getByRole('textbox', {
          name: 'Bullet point 1',
        });

        // Assert

        // Placeholder degrees
        const degrees = correctPlaceholderData.education.degrees;

        const shownDegreeIndex = 0;
        const shownDegreeCorrectPlaceholderData = degrees[shownDegreeIndex];

        await expect
          .element(address)
          .toHaveValue(shownDegreeCorrectPlaceholderData.address);
        await expect
          .element(uni)
          .toHaveValue(shownDegreeCorrectPlaceholderData.uni);

        await expect
          .element(firstBulletPoint)
          .toHaveValue(shownDegreeCorrectPlaceholderData.bulletPoints[0].value);
      });

      it('should rewrite previous input in "Education"', async () => {
        // Arrange
        const result = await renderAppWithNavbarAndControlsExpanded();
        const { navbar, user } = result;
        let fillAllBtn = result.fillAllBtn;

        // Fill all sections for the first time.
        await user.click(fillAllBtn);

        const educationTab = navbar.getByRole('tab', {
          name: sectionTitles.education,
        });

        // Select the "Education" section.
        await user.click(educationTab);

        const educationTabpanel = page.getByRole('tabpanel');

        const address = educationTabpanel.getByRole('textbox', {
          name: 'Address',
        });

        const uni = educationTabpanel.getByRole('textbox', {
          name: 'University Name',
        });

        let firstBulletPoint = educationTabpanel.getByRole('textbox', {
          name: 'Bullet point 1',
        });

        // Modify the fields' values.

        address.element().focus();
        await user.keyboard('some address');

        uni.element().focus();
        await user.keyboard('some uni');

        firstBulletPoint.element().focus();
        await user.keyboard('some bullet');

        fillAllBtn = page.getByRole('button', { name: 'Fill All' });

        // Act
        await user.click(fillAllBtn);

        // The previous node has been replaced at the current stage.
        firstBulletPoint = educationTabpanel.getByRole('textbox', {
          name: 'Bullet point 1',
        });

        // Assert

        // Placeholder degrees
        const degrees = correctPlaceholderData.education.degrees;

        const shownDegreeIndex = 0;
        const shownDegreeCorrectPlaceholderData = degrees[shownDegreeIndex];

        await expect
          .element(address)
          .toHaveValue(shownDegreeCorrectPlaceholderData.address);
        await expect
          .element(uni)
          .toHaveValue(shownDegreeCorrectPlaceholderData.uni);

        await expect
          .element(firstBulletPoint)
          .toHaveValue(shownDegreeCorrectPlaceholderData.bulletPoints[0].value);
      });

      it('should not rearrange tabs', async () => {
        // Arrange
        const result = await renderAppWithNavbarAndControlsExpanded();
        const { navbar, user } = result;

        // Show the "Add Sections" dialog.
        const addSectionsBtn = navbar.getByRole('button', {
          name: 'Add Sections',
        });
        await user.click(addSectionsBtn);

        // To be added sections' names.
        const firstName = sectionTitles.projects;
        const secondName = sectionTitles.links;
        const thirdName = sectionTitles.education;

        const firstAddBtn = page.getByRole('button', {
          name: `Add ${firstName}`,
        });

        const secondAddBtn = page.getByRole('button', {
          name: `Add ${secondName}`,
        });

        const thirdAddBtn = page.getByRole('button', {
          name: `Add ${thirdName}`,
        });

        // Add the three sections
        await user.click(firstAddBtn);
        await user.click(secondAddBtn);
        await user.click(thirdAddBtn);

        // Close the dialog.
        await user.keyboard('{Escape}');

        const fillAllBtn = page.getByRole('button', { name: 'Fill All' });

        // Act
        await user.click(fillAllBtn);

        const tabs = navbar.getByRole('tab').all();

        // Assert
        await expect.element(tabs[1]).toHaveAccessibleName(firstName);
        await expect.element(tabs[2]).toHaveAccessibleName(secondName);
        await expect.element(tabs[3]).toHaveAccessibleName(thirdName);
      });
    });

    describe('Section navigation buttons', () => {
      it('should retain focus on the Next Section button when navigating back to the first section via the Previous Section button', async () => {
        // Arrange
        const { fillAllBtn, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(fillAllBtn);

        const nextSectionBtn = page.getByRole('button', {
          name: 'Open Next Section',
        });
        await user.click(nextSectionBtn);

        const previousSectionBtn = page.getByRole('button', {
          name: 'Open Previous Section',
        });

        // Act
        await user.click(previousSectionBtn);

        // Assert
        const nextBtn = page.getByRole('button', {
          name: 'Open Next Section',
        });

        await expect.element(nextBtn).toHaveFocus();
      });

      it('should retain focus on the Previous Section button when navigating to the final section via the Next Section button', async () => {
        // Arrange
        const { addSectionsBtn, user } = await renderAppWithNavbarExpanded();

        await user.click(addSectionsBtn);

        const addLinksBtn = page.getByRole('button', {
          name: `Add ${sectionTitles.links}`,
        });
        await user.click(addLinksBtn);

        const closeDialogBtn = page.getByRole('button', {
          name: 'Close Popup',
        });
        await user.click(closeDialogBtn);

        const nextSectionBtn = page.getByRole('button', {
          name: 'Open Next Section',
        });

        // Act
        await user.click(nextSectionBtn);

        // Assert
        const previousBtn = page.getByRole('button', {
          name: 'Open Previous Section',
        });

        await expect.element(previousBtn).toHaveFocus();
      });

      it('should preserve focus on the Previous Section button when navigating between middle sections where it remains mounted', async () => {
        // Arrange
        const { fillAllBtn, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(fillAllBtn);

        const nextSectionBtn = page.getByRole('button', {
          name: 'Open Next Section',
        });
        await user.click(nextSectionBtn);
        await user.click(nextSectionBtn);

        const previousSectionBtn = page.getByRole('button', {
          name: 'Open Previous Section',
        });

        // Act
        await user.click(previousSectionBtn);

        // Assert
        const remainingPreviousBtn = page.getByRole('button', {
          name: 'Open Previous Section',
        });

        await expect.element(remainingPreviousBtn).toHaveFocus();
      });

      it('should preserve focus on the Next Section button when navigating between middle sections where it remains mounted', async () => {
        // Arrange
        const { fillAllBtn, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(fillAllBtn);

        const nextSectionBtn = page.getByRole('button', {
          name: 'Open Next Section',
        });

        // Act
        await user.click(nextSectionBtn);

        // Assert
        const remainingNextBtn = page.getByRole('button', {
          name: 'Open Next Section',
        });

        await expect.element(remainingNextBtn).toHaveFocus();
      });

      it('should not move focus to navigation buttons when a section is changed without focusing navigation buttons', async () => {
        // Arrange
        const { fillAllBtn, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(fillAllBtn);

        const linksTab = navbar.getByRole('tab', {
          name: sectionTitles.links,
        });

        // Act
        await user.click(linksTab);

        // Assert
        const previousSectionBtn = page.getByRole('button', {
          name: 'Open Previous Section',
        });

        await expect.element(previousSectionBtn).not.toHaveFocus();
      });

      it('should not retain focus if a pointer interaction occurred outside the navigation buttons', async () => {
        // Arrange
        const { fillAllBtn, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(fillAllBtn);

        const nextSectionBtn = page.getByRole('button', {
          name: 'Open Next Section',
        });
        await user.click(nextSectionBtn);

        const previousSectionBtn = page.getByRole('button', {
          name: 'Open Previous Section',
        });
        previousSectionBtn.element().focus();

        const personalTab = navbar.getByRole('tab', {
          name: sectionTitles.personal,
        });

        // Act
        await user.click(personalTab);

        // Assert
        const nextBtn = page.getByRole('button', {
          name: 'Open Next Section',
        });

        await expect.element(nextBtn).not.toHaveFocus();
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
        const { addSectionsBtn, navbar, user } =
          await renderAppWithNavbarExpanded();

        await user.click(addSectionsBtn);
        await user.click(
          page.getByRole('button', { name: 'Add All Sections' }),
        );

        // Select the section.
        const tab = navbar.getByRole('tab', { name: sectionTitle });
        await user.click(tab);

        const panel = page.getByRole('tabpanel', { name: sectionTitle });
        const textbox = panel.getByRole('textbox', { name: textboxName });

        // Act
        await user.type(textbox, testValue);

        // Assert
        await expect.element(textbox).toHaveValue(testValue);
      },
    );

    it(`should correctly wire data for ${sectionTitles.skills}`, async () => {
      // Arrange
      const { addSectionsBtn, navbar, user } =
        await renderAppWithNavbarExpanded();

      await user.click(addSectionsBtn);
      await user.click(page.getByRole('button', { name: 'Add All Sections' }));

      // Select the section.
      const tab = navbar.getByRole('tab', { name: sectionTitles.skills });
      await user.click(tab);

      const panel = page.getByRole('tabpanel', { name: sectionTitles.skills });
      const languages = panel.getByRole('group', { name: 'Languages' });
      const textbox = languages.getByRole('textbox', {
        name: 'Bullet point 1',
      });

      // Act
      await user.type(textbox, 'Spanish');

      // Assert
      await expect.element(textbox).toHaveValue('Spanish');
    });
  });
});
