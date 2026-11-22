import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import sectionTitles from '@/utils/sectionTitles';

import App from './App';

async function renderApp() {
  await render(<div id="popup-root" />);
  await render(<App />);
}

async function renderAppWithNavbarAndControlsExpanded() {
  await renderApp();
  const user = userEvent.setup();

  const toggleNavbarBtn = page.getByRole('button', {
    name: 'Navigation',
  });

  await user.click(toggleNavbarBtn);

  const navbar = page.getByRole('navigation', { name: 'Navigation' });

  const toggleEditorModeBtn = page.getByRole('button', {
    name: 'Toggle Editor Mode',
  });

  const toggleControlsBtn = page.getByRole('button', {
    name: 'Toolbar',
  });

  await user.click(toggleControlsBtn);

  const fillAllBtn = page.getByRole('button', { name: 'Fill All' });

  return {
    fillAllBtn,
    navbar,
    toggleEditorModeBtn,
    user,
  };
}

describe('App', () => {
  describe("Tabbing to tabpanels' first tabbable elements", () => {
    it.each(Object.values(sectionTitles))(
      "should focus the %s tabpanel's first tabbable element when the user presses Tab while focused on the corresponding tab",
      async (sectionTitle) => {
        // ARRANGE
        const { fillAllBtn, navbar, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(fillAllBtn);
        const tab = navbar.getByRole('tab', { name: sectionTitle });
        await user.click(tab);

        // ACT
        await user.keyboard('{Tab}');

        // ASSERT
        const tabpanel = page.getByRole('tabpanel', { name: sectionTitle });
        const rawFirstTabbable = tabpanel
          .element()
          .querySelector('button, input, textarea');
        const firstTabbable =
          rawFirstTabbable instanceof HTMLElement ? rawFirstTabbable : null;
        await expect.element(firstTabbable).toHaveFocus();
      },
    );
  });

  describe('AppLayout', () => {
    describe('Section tab reordering', () => {
      it('should reorder section tabs when a draggable tab is dragged and dropped onto another draggable tab in editor mode', async () => {
        // ARRANGE
        const { fillAllBtn, navbar, toggleEditorModeBtn, user } =
          await renderAppWithNavbarAndControlsExpanded();

        await user.click(fillAllBtn);
        await user.click(toggleEditorModeBtn);

        const sourceTab = navbar.getByRole('tab', {
          name: sectionTitles.education,
        });
        const targetTab = navbar.getByRole('tab', {
          name: sectionTitles.skills,
        });

        // ACT
        // Wait for the navbar's slide-in transition to settle.
        await navbar.hover();
        // `force: true` skips Playwright's stability check while the tabs shake.
        await sourceTab.hover({ force: true });
        await user.pointer('[MouseLeft>]');
        try {
          await targetTab.hover({ force: true });
          // Wait for `dnd-kit` to recognise the target before releasing.
          await expect
            .element(
              page.getByText(
                'Draggable item education was moved over droppable area skills.',
              ),
            )
            .toBeInTheDocument();
        } finally {
          await user.pointer('[/MouseLeft]');
        }

        // ASSERT
        const tabIds = navbar
          .getByRole('tab')
          .all()
          .map((tab) => tab.element().id);

        expect(tabIds).toEqual([
          'personal',
          'links',
          'education',
          'skills',
          'experience',
          'projects',
          'certifications',
        ]);
      });
    });
  });
});
