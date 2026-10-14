// It disallowed using `crypto`, which is well supported.
/* eslint-disable n/no-unsupported-features/node-builtins */

import cloneDeep from 'lodash/cloneDeep';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import AppLayout from './AppLayout';

import type { AppLayoutProps } from './AppLayout';
import type { ResumeData, SectionId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

const DATA: ResumeData = {
  certifications: {
    interests: 'Open Source Development, AI/ML, Technical Writing',
    skills: 'Cloud Architecture, Web Accessibility, Performance Optimization',
    certificates:
      'AWS Certified Solutions Architect, Meta Frontend Developer Certificate',
  },
  education: {
    shownDegreeIndex: 0,
    degrees: [
      {
        address: 'Berkeley, CA',
        degree: 'Bachelor of Science in Computer Science',
        graduation: 'May 2022',
        id: crypto.randomUUID(),
        uni: 'University of California, Berkeley',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value: 'GPA: 3.8/4.0',
          },
          {
            id: crypto.randomUUID(),
            value: "Dean's List: 2019–2022",
          },
          {
            id: crypto.randomUUID(),
            value: 'Senior Project: AI-powered Code Review Assistant',
          },
        ],
      },
    ],
  },
  experience: {
    shownJobIndex: 0,
    jobs: [
      {
        address: 'San Francisco, CA',
        companyName: 'TechCorp Inc.',
        duration: 'Jan 2023 – Present',
        id: crypto.randomUUID(),
        jobTitle: 'Senior Frontend Engineer',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value:
              'Led development of a high-performance React application serving 1M+ users',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Improved application load time by 40% through code splitting and lazy loading',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Mentored junior developers and conducted technical interviews',
          },
        ],
      },
    ],
  },
  links: {
    github: {
      link: 'https://github.com/johndoe',
      text: 'GitHub',
    },
    linkedin: {
      link: 'https://linkedin.com/in/johndoe',
      text: 'LinkedIn',
    },
    telegram: {
      link: 'https://t.me/johndoe',
      text: 'Telegram',
    },
    website: {
      link: 'https://johndoe.dev',
      text: 'Portfolio',
    },
  },
  personal: {
    fullName: 'John Doe',
    jobTitle: 'Frontend Engineer',
    email: 'john.doe@johndoe.com',
    phone: '+1 (555) 555-5555',
    address: '123 Main St, Anytown, CA 91234',
    summary:
      'A highly motivated and skilled frontend engineer with a passion for creating innovative and user-friendly web applications.',
  },
  projects: {
    shownProjectIndex: 0,
    projects: [
      {
        id: crypto.randomUUID(),
        projectName: 'E-commerce Platform',
        stack: 'React, Next.js, TypeScript, GraphQL',
        bulletPoints: [
          {
            id: crypto.randomUUID(),
            value:
              'Built a scalable e-commerce platform with React and Next.js',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Implemented server-side rendering for optimal SEO performance',
          },
          {
            id: crypto.randomUUID(),
            value:
              'Integrated Stripe payment processing and shopping cart functionality',
          },
        ],
        code: {
          text: 'View Code',
          link: 'https://github.com/johndoe/ecommerce',
        },
        demo: {
          text: 'Live Demo',
          link: 'https://ecommerce-demo.johndoe.dev',
        },
      },
    ],
  },
  skills: {
    frameworks: [
      {
        id: crypto.randomUUID(),
        value: 'React',
      },
      {
        id: crypto.randomUUID(),
        value: 'Next.js',
      },
      {
        id: crypto.randomUUID(),
        value: 'Node.js',
      },
    ],
    languages: [
      {
        id: crypto.randomUUID(),
        value: 'JavaScript',
      },
      {
        id: crypto.randomUUID(),
        value: 'TypeScript',
      },
      {
        id: crypto.randomUUID(),
        value: 'HTML/CSS',
      },
    ],
    tools: [
      {
        id: crypto.randomUUID(),
        value: 'Git',
      },
      {
        id: crypto.randomUUID(),
        value: 'Webpack',
      },
      {
        id: crypto.randomUUID(),
        value: 'Jest',
      },
    ],
  },
};

function Tabpanel({ sectionId }: { sectionId: SectionId }) {
  return (
    <div
      aria-label={sectionTitles[sectionId]}
      id={`${sectionId}-tabpanel`}
      role="tabpanel"
    >
      <input data-testid="first-tabbable" type="text" />
    </div>
  );
}

function getProps(
  overrides?: Partial<Omit<AppLayoutProps, 'children'>>,
): AppLayoutProps {
  const openedSectionId =
    overrides?.openedSectionId === undefined
      ? 'personal'
      : overrides.openedSectionId;

  return {
    activeSectionIds: structuredClone(possibleSectionIds),
    addSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
    children: <Tabpanel sectionId={openedSectionId} />,
    data: cloneDeep(DATA),
    deleteAll() {},
    deleteSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
    editorMode: false,
    fillAll() {},
    focusSection: vi.fn(),
    openedSectionId: 'personal',
    openSection(_sectionId: SectionId) {},
    reorderSections(_sectionIds: ReadonlyDeep<SectionId[]>) {},
    resetScreenReaderAnnouncement() {},
    toggleEditorMode() {},
    ...overrides,
  };
}

async function renderAppLayout(props?: Partial<AppLayoutProps>) {
  // Necessary for the dialogs "Preview" and "Add Sections".
  await render(<div id="popup-root" />);

  await render(<AppLayout {...getProps(props)} />);
}

// TODO: should call `reorderSections` when sections are reordered via DnD
// TODO: should have correct data for the preview dialog.

async function renderAppLayoutWithNavbarExpanded(
  props?: Partial<AppLayoutProps>,
) {
  await renderAppLayout(props);
  await userEvent.click(page.getByRole('button', { name: 'Navigation' }));
}

describe('AppLayout', () => {
  // Main section

  it('should render a main section', async () => {
    await renderAppLayout();

    const main = page.getByRole('main');

    await expect.element(main).toBeInTheDocument();
  });

  describe('Main section', () => {
    it("should render the opened section's title as heading", async () => {
      await renderAppLayout();

      const heading = page.getByRole('heading', {
        name: sectionTitles.personal,
      });

      await expect.element(heading).toBeInTheDocument();
    });

    it('should correctly render resume sections', async () => {
      await renderAppLayout();

      const children = page.getByRole('tabpanel', {
        name: sectionTitles.personal,
      });

      await expect.element(children).toBeInTheDocument();
    });

    // "Open Next Section" button

    it("should render an 'Open Next Section' button when the opened section isn't the last one", async () => {
      await renderAppLayout();

      const btn = page.getByRole('button', { name: 'Open Next Section' });

      await expect.element(btn).toBeInTheDocument();
    });

    it('should not render an "Open Next Section" button when the opened section is the last one', async () => {
      await renderAppLayout(
        getProps({ openedSectionId: possibleSectionIds.at(-1) }),
      );

      const btn = page.getByRole('button', { name: 'Open Next Section' });

      await expect.element(btn).not.toBeInTheDocument();
    });

    describe('"Open Next Section" button', () => {
      it("should call `openSection` passing the next section's ID to it when pressed", async () => {
        // Arrange
        const mockFn = vi.fn((_sectionId: SectionId) => {});
        const props = getProps({ openSection: mockFn });

        await renderAppLayout(props);
        const user = userEvent.setup();

        const btn = page.getByRole('button', { name: 'Open Next Section' });

        // Act
        await user.click(btn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(possibleSectionIds[1]);
      });
    });

    // "Open Previous Section" button

    it("should render an 'Open Previous Section' button when the opened section isn't the first one", async () => {
      await renderAppLayout(
        getProps({ openedSectionId: possibleSectionIds[3] }),
      );

      const btn = page.getByRole('button', { name: 'Open Previous Section' });

      await expect.element(btn).toBeInTheDocument();
    });

    it('should not render an "Open Previous Section" button when the opened section is the first one', async () => {
      await renderAppLayout();

      const btn = page.getByRole('button', {
        name: 'Open Previous Section',
      });

      await expect.element(btn).not.toBeInTheDocument();
    });

    describe('"Open Previous Section" button', () => {
      it("should call `openSection` passing the previous section's ID to it when pressed", async () => {
        // Arrange
        const openedSectionId = possibleSectionIds[3];
        const mockFn = vi.fn((_sectionId: SectionId) => {});
        const props = getProps({ openedSectionId, openSection: mockFn });

        await renderAppLayout(props);
        const user = userEvent.setup();

        const btn = page.getByRole('button', {
          name: 'Open Previous Section',
        });

        // Act
        await user.click(btn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(possibleSectionIds[2]);
      });
    });
  });

  describe('Navbar', () => {
    it('should contain tabs for all active sections', async () => {
      // Arrange
      const activeSectionIds = possibleSectionIds.slice(0, 4);
      const props = getProps({ activeSectionIds });

      await renderAppLayoutWithNavbarExpanded(props);

      // Act
      const tabMap = new Map();

      activeSectionIds.forEach((sectionId) => {
        const name = sectionTitles[sectionId];
        const tab = page.getByRole('tab', { name });
        tabMap.set(sectionId, tab);
      });

      // Assert
      await expect.element(tabMap.get(activeSectionIds[0])).toBeInTheDocument();
      await expect.element(tabMap.get(activeSectionIds[1])).toBeInTheDocument();
      await expect.element(tabMap.get(activeSectionIds[2])).toBeInTheDocument();
      await expect.element(tabMap.get(activeSectionIds[3])).toBeInTheDocument();
    });

    it('should not contain more tabs than there are active sections', async () => {
      // Arrange
      const activeSectionIds = possibleSectionIds.slice(0, 4);
      const props = getProps({ activeSectionIds });

      await renderAppLayoutWithNavbarExpanded(props);

      // Act
      const tabs = page.getByRole('tab').all();

      // Assert
      expect(tabs).toHaveLength(activeSectionIds.length);
    });

    it("should have the opened section's tab selected", async () => {
      await renderAppLayoutWithNavbarExpanded();

      const tab = page.getByRole('tab', {
        name: sectionTitles.personal,
        selected: true,
      });

      await expect.element(tab).toBeInTheDocument();
    });

    it('should call `openSection` with the correct section ID when a section is selected', async () => {
      // Arrange
      const mockFn = vi.fn((_sectionId: SectionId) => {});
      const props = getProps({ openSection: mockFn });

      await renderAppLayoutWithNavbarExpanded(props);
      const user = userEvent.setup();

      const tab = page.getByRole('tab', { name: sectionTitles.education });

      // Act
      await user.click(tab);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('education');
    });

    it('should contain the "Toggle Editor Mode" button', async () => {
      await renderAppLayoutWithNavbarExpanded();

      const btn = page.getByRole('button', { name: 'Toggle Editor Mode' });

      await expect.element(btn).toBeInTheDocument();
    });

    it('should call `deleteSections` with the correct section ID when a section is deleted', async () => {
      // Arrange
      const mockFn = vi.fn((_sectionIds: ReadonlyDeep<SectionId[]>) => {});
      const props = getProps({ deleteSections: mockFn, editorMode: true });

      await renderAppLayoutWithNavbarExpanded(props);
      const user = userEvent.setup();

      const deleteBtn = page.getByRole('button', {
        name: `Delete ${sectionTitles.education}`,
      });

      // Act
      await user.click(deleteBtn);

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(['education']);
    });

    describe('"Toggle Editor Mode" button', () => {
      it('should not be pressed when the editor mode is off', async () => {
        await renderAppLayoutWithNavbarExpanded();

        const btn = page.getByRole('button', {
          name: 'Toggle Editor Mode',
          pressed: false,
        });

        await expect.element(btn).toBeInTheDocument();
      });

      it('should be pressed when the editor mode is on', async () => {
        await renderAppLayoutWithNavbarExpanded(getProps({ editorMode: true }));

        const btn = page.getByRole('button', {
          name: 'Toggle Editor Mode',
          pressed: true,
        });

        await expect.element(btn).toBeInTheDocument();
      });

      it('should call `toggleEditorMode` when pressed', async () => {
        // Arrange
        const mockFn = vi.fn();
        const props = getProps({ toggleEditorMode: mockFn });

        await renderAppLayoutWithNavbarExpanded(props);
        const user = userEvent.setup();

        const btn = page.getByRole('button', { name: 'Toggle Editor Mode' });

        // Act
        await user.click(btn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });

    it("should not contain the 'Add Sections' button when all sections are active", async () => {
      await renderAppLayoutWithNavbarExpanded();

      const btn = page.getByRole('button', { name: 'Add Sections' });

      await expect.element(btn).not.toBeInTheDocument();
    });

    it('should contain the "Add Sections" button when there are inactive sections', async () => {
      // Arrange
      const activeSectionIds = possibleSectionIds.slice(0, 4);
      const props = getProps({ activeSectionIds });

      await renderAppLayoutWithNavbarExpanded(props);

      // Act
      const btn = page.getByRole('button', { name: 'Add Sections' });

      // Assert
      await expect.element(btn).toBeInTheDocument();
    });

    describe('"Add Sections" dialog', () => {
      it('should call `addSections` with the correct section ID when a section is added', async () => {
        // Arrange
        const activeSectionIds: SectionId[] = ['personal'];
        const mockFn = vi.fn((_sectionIds: ReadonlyDeep<SectionId[]>) => {});
        const props = getProps({ activeSectionIds, addSections: mockFn });

        await renderAppLayoutWithNavbarExpanded(props);
        const user = userEvent.setup();

        const addSectionsBtn = page.getByRole('button', {
          name: 'Add Sections',
        });

        await user.click(addSectionsBtn);

        const addBtn = page.getByRole('button', {
          name: `Add ${sectionTitles.education}`,
        });

        // Act
        await user.click(addBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(['education']);
      });

      it('should call `resetScreenReaderAnnouncement` when shown', async () => {
        // Arrange
        const mockFn = vi.fn();
        const activeSectionIds: SectionId[] = ['personal'];

        const props = getProps({
          activeSectionIds,
          resetScreenReaderAnnouncement: mockFn,
        });

        await renderAppLayoutWithNavbarExpanded(props);
        const user = userEvent.setup();

        const addSecitonsBtn = page.getByRole('button', {
          name: 'Add Sections',
        });

        // Act
        await user.click(addSecitonsBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Toolbar

  it('should render a complementary semantic wrapper for the sidebar', async () => {
    await renderAppLayout();

    const wrapper = page.getByRole('complementary');

    await expect.element(wrapper).toBeInTheDocument();
  });

  it('should render the toolbar', async () => {
    await renderAppLayout();
    const user = userEvent.setup();

    const toggleToolbarBtn = page.getByRole('button', {
      expanded: false,
      name: 'Toolbar',
    });

    await user.click(toggleToolbarBtn);

    const toolbar = page.getByRole('toolbar');

    await expect.element(toolbar).toBeInTheDocument();
  });

  describe('Toolbar', () => {
    describe('"Toggle Navigation" button', () => {
      it("shouldn't be expanded initially", async () => {
        await renderAppLayout();

        const btn = page.getByRole('button', {
          name: 'Navigation',
          expanded: false,
        });

        await expect.element(btn).toBeInTheDocument();
      });

      it('should be expanded when clicked', async () => {
        await renderAppLayout();
        const user = userEvent.setup();

        const btn = page.getByRole('button', {
          name: 'Navigation',
        });

        await user.click(btn);

        await expect.element(btn).toHaveAttribute('aria-expanded', 'true');
      });

      it('should toggle navbar expanded state when pressed', async () => {
        // Arrange
        await renderAppLayout();
        const user = userEvent.setup();

        const btn = page.getByRole('button', { name: 'Navigation' });
        await expect.element(btn).toHaveAttribute('aria-expanded', 'false');

        // Act & Assert
        await user.click(btn);
        await expect.element(btn).toHaveAttribute('aria-expanded', 'true');

        await user.click(btn);
        await expect.element(btn).toHaveAttribute('aria-expanded', 'false');
      });
    });

    describe('"Clear All" button', () => {
      it('should control all the undeletable tabs and all tabpanels', async () => {
        // Arrange
        await renderAppLayout();
        const user = userEvent.setup();

        const toggleToolbarBtn = page.getByRole('button', {
          name: 'Toolbar',
          expanded: false,
        });

        await user.click(toggleToolbarBtn);

        const clearAllBtn = page.getByRole('button', { name: 'Clear All' });

        // Act
        const controlledElementsIds = clearAllBtn
          .element()
          .getAttribute('aria-controls')
          ?.split(' ');

        // Assert
        expect(controlledElementsIds).toHaveLength(
          possibleSectionIds.length * 2 - 1,
        );

        expect(controlledElementsIds).toContain('links');
        expect(controlledElementsIds).toContain('skills');
        expect(controlledElementsIds).toContain('experience');
        expect(controlledElementsIds).toContain('projects');
        expect(controlledElementsIds).toContain('education');
        expect(controlledElementsIds).toContain('certifications');
        expect(controlledElementsIds).toContain('personal-tabpanel');
        expect(controlledElementsIds).toContain('links-tabpanel');
        expect(controlledElementsIds).toContain('skills-tabpanel');
        expect(controlledElementsIds).toContain('experience-tabpanel');
        expect(controlledElementsIds).toContain('projects-tabpanel');
        expect(controlledElementsIds).toContain('education-tabpanel');
        expect(controlledElementsIds).toContain('certifications-tabpanel');
      });

      it('should call `deleteAll` when pressed', async () => {
        // Arrange
        const mockFn = vi.fn();
        const props = getProps({ deleteAll: mockFn });

        await renderAppLayout(props);
        const user = userEvent.setup();

        const toggleToolbarBtn = page.getByRole('button', {
          name: 'Toolbar',
          expanded: false,
        });

        await user.click(toggleToolbarBtn);

        const clearAllBtn = page.getByRole('button', { name: 'Clear All' });

        // Act
        await user.click(clearAllBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });

    describe('"Fill All" button', () => {
      it('should call `fillAll` when pressed', async () => {
        // Arrange
        const mockFn = vi.fn();
        const props = getProps({ fillAll: mockFn });

        await renderAppLayout(props);
        const user = userEvent.setup();

        const toggleToolbarBtn = page.getByRole('button', {
          name: 'Toolbar',
          expanded: false,
        });

        await user.click(toggleToolbarBtn);

        const fillAllBtn = page.getByRole('button', { name: 'Fill All' });

        // Act
        await user.click(fillAllBtn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Keyboard navigation', () => {
    describe('Tab keypress', () => {
      describe('Section tab is focused', () => {
        describe("Opened section's tab is focused", () => {
          describe('Shift is pressed', () => {
            it('should focus the "Toggle Navigation" button', async () => {
              // Arrange
              await renderAppLayoutWithNavbarExpanded();
              const user = userEvent.setup();

              const tab = page.getByRole('tab', {
                name: sectionTitles.personal,
              });

              const toggleNavbarBtn = page.getByRole('button', {
                name: 'Navigation',
              });

              tab.element().focus();

              // Act
              await user.keyboard('{Shift>}{Tab}{/Shift}');

              // Assert
              await expect.element(toggleNavbarBtn).toHaveFocus();
            });
          });

          describe("Editor mode is off and shift isn't pressed", () => {
            it('should call focusSection', async () => {
              // Arrange
              const mockFocusSection = vi.fn();
              const props = getProps({ focusSection: mockFocusSection });

              await renderAppLayoutWithNavbarExpanded(props);
              const user = userEvent.setup();

              const tab = page.getByRole('tab', {
                name: sectionTitles.personal,
              });

              tab.element().focus();

              // Act
              await user.keyboard('{Tab}');

              // Assert
              expect(mockFocusSection).toHaveBeenCalledTimes(1);
            });
          });
        });

        describe("Not the opened section's tab is focused, Shift is pressed and the editor mode is off", () => {
          it('should focus the "Toggle Navigation" button if the focused tab is higher than the selected tab is', async () => {
            // Arrange
            const openedSectionId: SectionId = 'experience';
            const props = getProps({ openedSectionId });

            await renderAppLayoutWithNavbarExpanded(props);
            const user = userEvent.setup();

            let name: string = sectionTitles.personal;
            const focusedTab = page.getByRole('tab', { name });
            focusedTab.element().focus();

            name = 'Navigation';
            const toggleNavbarBtn = page.getByRole('button', { name });

            // Act
            await user.keyboard('{Shift>}{Tab}{/Shift}');

            // Assert
            await expect.element(toggleNavbarBtn).toHaveFocus();
          });

          it('should focus the selected tab if the focused tab is lower than it is', async () => {
            // Arrange
            await renderAppLayoutWithNavbarExpanded();
            const user = userEvent.setup();

            let name: string = sectionTitles.education;
            const focusedTab = page.getByRole('tab', { name });
            focusedTab.element().focus();

            name = sectionTitles.personal;
            const selectedTab = page.getByRole('tab', { name });

            // Act
            await user.keyboard('{Shift>}{Tab}{/Shift}');

            // Assert
            await expect.element(selectedTab).toHaveFocus();
          });
        });
      });

      describe('"Toggle Editor Mode" button is focused', () => {
        describe('Shift is pressed', () => {
          describe('There are inactive sections', () => {
            it('should focus the "Add Sections" button', async () => {
              // Arrange
              const props = getProps({
                activeSectionIds: possibleSectionIds.filter(
                  (_, index) => index !== 3,
                ),
              });

              await renderAppLayoutWithNavbarExpanded(props);
              const user = userEvent.setup();

              let name = 'Toggle Editor Mode';
              const toggleEditorModeBtn = page.getByRole('button', { name });
              toggleEditorModeBtn.element().focus();

              name = 'Add Sections';
              const addSectionsBtn = page.getByRole('button', { name });

              // Act
              await user.keyboard('{Shift>}{Tab}{/Shift}');

              // Assert
              await expect.element(addSectionsBtn).toHaveFocus();
            });
          });

          describe('Editor mode is on and all sections are active', () => {
            it("should focus the last tab's delete button", async () => {
              // Arrange
              const props = getProps({ editorMode: true });

              await renderAppLayoutWithNavbarExpanded(props);
              const user = userEvent.setup();

              let name = 'Toggle Editor Mode';
              const toggleEditorModeBtn = page.getByRole('button', { name });
              toggleEditorModeBtn.element().focus();

              name = `Delete ${sectionTitles[possibleSectionIds.at(-1)!]}`;
              const deleteBtn = page.getByRole('button', { name });

              // Act
              await user.keyboard('{Shift>}{Tab}{/Shift}');

              // Assert
              await expect.element(deleteBtn).toHaveFocus();
            });
          });

          describe('Editor mode is off and all sections are active', () => {
            it('should focus the selected tab', async () => {
              // Arrange
              await renderAppLayoutWithNavbarExpanded();
              const user = userEvent.setup();

              let name = 'Toggle Editor Mode';
              const toggleEditorModeBtn = page.getByRole('button', { name });
              toggleEditorModeBtn.element().focus();

              name = sectionTitles.personal;
              const selectedTab = page.getByRole('tab', { name });

              // Act
              await user.keyboard('{Shift>}{Tab}{/Shift}');

              // Assert
              await expect.element(selectedTab).toHaveFocus();
            });
          });
        });

        describe("Shift isn't pressed", () => {
          it('should focus the "Toolbar" button', async () => {
            // Arrange
            await renderAppLayoutWithNavbarExpanded();
            const user = userEvent.setup();

            let name = 'Toggle Editor Mode';
            const toggleEditorModeBtn = page.getByRole('button', { name });
            toggleEditorModeBtn.element().focus();

            name = 'Toolbar';
            const toggleToolbarBtn = page.getByRole('button', { name });

            // Act
            await user.keyboard('{Tab}');

            // Assert
            await expect.element(toggleToolbarBtn).toHaveFocus();
          });
        });
      });

      describe("'Toggle Navigation' button is focused and Shift isn't pressed", () => {
        describe('Editor mode is on', () => {
          it('should focus the "Personal Details" tab', async () => {
            // Arrange
            await renderAppLayoutWithNavbarExpanded();
            const user = userEvent.setup();

            let name = 'Navigation';
            const toggleNavbarBtn = page.getByRole('button', { name });
            toggleNavbarBtn.element().focus();

            name = sectionTitles.personal;
            const tab = page.getByRole('tab', { name });

            // Act
            await user.keyboard('{Tab}');

            // Assert
            await expect.element(tab).toHaveFocus();
          });
        });

        describe('Editor mode is off', () => {
          it("should focus the opened section's tab", async () => {
            // Arrange
            const props = getProps({ openedSectionId: 'education' });

            await renderAppLayoutWithNavbarExpanded(props);
            const user = userEvent.setup();

            let name = 'Navigation';
            const toggleNavbarBtn = page.getByRole('button', { name });
            toggleNavbarBtn.element().focus();

            name = sectionTitles.education;
            const tab = page.getByRole('tab', { name });

            // Act
            await user.keyboard('{Tab}');

            // Assert
            await expect.element(tab).toHaveFocus();
          });
        });
      });

      describe("A control button from the 'Toolbar' is focused and Shift isn't pressed", () => {
        it('should focus the first tabbable element of the tabpanel', async () => {
          // Arrange
          await renderAppLayoutWithNavbarExpanded();
          const user = userEvent.setup();

          const toggleToolbarBtn = page.getByRole('button', {
            name: 'Toolbar',
          });
          await user.click(toggleToolbarBtn);

          const controlBtn = page.getByRole('button', {
            name: 'Clear All',
          });
          controlBtn.element().focus();

          // Act
          await user.keyboard('{Tab}');

          // Assert
          await expect
            .element(page.getByTestId('first-tabbable'))
            .toHaveFocus();
        });
      });
    });

    describe("Escape keypress and the 'Add Sections', 'Toggle Editor Mode' button, a tab or a tab's delete button is focused", () => {
      describe('Editor mode is on', () => {
        it('should toggle editor mode', async () => {
          // Arrange
          const mockFn = vi.fn();
          const editorMode = true;
          const props = getProps({ editorMode, toggleEditorMode: mockFn });

          await renderAppLayoutWithNavbarExpanded(props);
          const user = userEvent.setup();

          const name = `Delete ${sectionTitles.education}`;
          const deleteBtn = page.getByRole('button', { name });
          deleteBtn.element().focus();

          // Act
          await user.keyboard('{Escape}');

          // Assert
          expect(mockFn).toHaveBeenCalledTimes(1);
        });

        describe('Delete button is focused', () => {
          it('should focus the corresponding tab', async () => {
            // Arrange
            await renderAppLayoutWithNavbarExpanded(
              getProps({ editorMode: true }),
            );
            const user = userEvent.setup();

            let name = `Delete ${sectionTitles.education}`;
            const deleteBtn = page.getByRole('button', { name });
            deleteBtn.element().focus();

            name = sectionTitles.education;
            const tab = page.getByRole('tab', { name });

            // Act
            await user.keyboard('{Escape}');

            // Assert
            await expect.element(tab).toHaveFocus();
          });
        });
      });
    });
  });
});
