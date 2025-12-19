// It disallowed using `crypto`, which is well supported.
/* eslint-disable n/no-unsupported-features/node-builtins */

import React from 'react';

import {
  getByAltText,
  getByRole,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import neverReached from '@/utils/neverReached';
import possibleSectionIds from '@/utils/possibleSectionIds';

import Toolbar from './Toolbar';

import type { ControlsIds, ToolbarProps } from './Toolbar';
import type {
  ResumeData,
  SectionIds,
  SectionIdsDeletable,
  TabpanelIds,
} from '@/types/resumeData';
import type { ArraySplice } from 'type-fest';

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

function getProps(overrides?: Partial<ToolbarProps>): ToolbarProps {
  return {
    activeSectionIds: structuredClone(possibleSectionIds),
    className: 'Toolbar',
    data: cloneDeep(DATA),
    deleteAll() {},
    fillAll() {},
    isNavbarExpanded: false,
    toggleNavbar() {},
    ...overrides,
  };
}

function renderToolbar(props?: ToolbarProps) {
  render(<div id="popup-root" />);
  render(<Toolbar {...getProps(props)} />);
}

// keyboard navigation (handleKeyDown)
// `handleBlur` behaviour

async function renderControls(props?: ToolbarProps) {
  renderToolbar(props);
  const user = userEvent.setup();

  const toolbar = screen.getByTestId('toolbar');
  const name = 'Control Buttons';
  const toggleControlsBtn = getByRole(toolbar, 'button', { name });

  await user.click(toggleControlsBtn);

  const controls = getByRole(toolbar, 'menu', { name });

  return { user, controls };
}

// TODO: assert that `Preview` gets correct `data` and `activeSectionIds`
describe('Toolbar', () => {
  it('should render a toolbar', () => {
    renderToolbar();

    const toolbar = screen.getByTestId('toolbar');

    expect(toolbar).toBeInTheDocument();
    expect(toolbar).toHaveRole('toolbar');
  });

  it("should use the `className` prop in the toolbar's class", () => {
    renderToolbar(getProps({ className: 'ToolbarClass' }));
    const toolbar = screen.getByTestId('toolbar');

    const className = toolbar.className;

    expect(className.includes('ToolbarClass')).toBeTruthy();
  });

  describe('Toggle Buttons', () => {
    describe('"Toggle Navigation" button', () => {
      it('should render with an accessible name "Navigation"', () => {
        renderToolbar();
        const toolbar = screen.getByTestId('toolbar');

        const btn = getByRole(toolbar, 'button', {
          name: 'Navigation',
          hidden: true,
        });

        expect(btn).toBeInTheDocument();
      });

      it('should have alternative text "Toggle Navigation"', () => {
        renderToolbar();
        const toolbar = screen.getByTestId('toolbar');

        const btn = getByAltText(toolbar, 'Toggle Navigation');

        expect(btn).toBeInTheDocument();
      });

      it('should call `toggleNavbar` when clicked', async () => {
        // Arrange
        const mockFn = jest.fn();
        const props = getProps({ toggleNavbar: mockFn });

        renderToolbar(props);
        const user = userEvent.setup();

        const toolbar = screen.getByTestId('toolbar');
        const btn = getByRole(toolbar, 'button', { name: 'Navigation' });

        // Act
        await user.click(btn);

        // Assert
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should be expanded when `isNavbarExpanded` is `true`', () => {
        renderToolbar(getProps({ isNavbarExpanded: true }));

        const btn = screen.getByRole('button', {
          name: 'Navigation',
          expanded: true,
        });

        expect(btn).toBeInTheDocument();
      });

      it('should control an element with an ID "navbar"', () => {
        renderToolbar();

        const btn = screen.getByRole('button', { name: 'Navigation' });

        expect(btn).toHaveAttribute('aria-controls', 'navbar');
      });
    });

    describe('"Toggle Control Buttons" button', () => {
      let toolbar: HTMLDivElement;

      beforeEach(() => {
        renderToolbar();
        toolbar = screen.getByTestId('toolbar');
      });

      it('should render with an accessible name "Control Buttons"', () => {
        const btn = getByRole(toolbar, 'button', {
          name: 'Control Buttons',
          hidden: true,
        });

        expect(btn).toBeInTheDocument();
      });

      it('should have alternative text "Toggle Controls"', () => {
        const btn = getByAltText(toolbar, 'Toggle Controls');

        expect(btn).toBeInTheDocument();
      });

      it('should control an element with an ID "control-btns"', () => {
        const btn = getByRole(toolbar, 'button', { name: 'Control Buttons' });

        expect(btn).toHaveAttribute('aria-controls', 'control-btns');
      });

      it('should have a popup of type "menu"', () => {
        const btn = getByRole(toolbar, 'button', { name: 'Control Buttons' });

        expect(btn).toHaveAttribute('aria-haspopup', 'menu');
      });

      it('should expand the control buttons when clicked if the buttons are hidden', async () => {
        // Arrange
        const user = userEvent.setup();

        const btn = getByRole(toolbar, 'button', {
          name: 'Control Buttons',
          hidden: true,
        });

        // Act
        await user.click(btn);

        // Assert
        expect(btn.ariaExpanded).toBe('true');
      });

      it('should hide the control buttons when clicked if the buttons are expanded', async () => {
        // Arrange
        const user = userEvent.setup();

        const btn = getByRole(toolbar, 'button', {
          name: 'Control Buttons',
          hidden: true,
        });

        // Act
        await user.dblClick(btn);

        // Assert
        expect(btn.ariaExpanded).toBe('false');
      });
    });
  });

  // TODO: refactor this rubbish.
  describe('Control Buttons menu', () => {
    it('should render with an accessible name "Control Buttons"', async () => {
      // Arrange
      renderToolbar();
      const user = userEvent.setup();

      const toolbar = screen.getByTestId('toolbar');
      const name = 'Control Buttons';
      const toggleControlsBtn = getByRole(toolbar, 'button', { name });

      await user.click(toggleControlsBtn);

      // Act
      const menu = getByRole(toolbar, 'menu', { name: 'Control Buttons' });

      // Assert
      expect(menu).toBeInTheDocument();
    });

    it('should be horizontally orientated', async () => {
      // Arrange
      renderToolbar();
      const user = userEvent.setup();

      const toolbar = screen.getByTestId('toolbar');
      const name = 'Control Buttons';
      const toggleControlsBtn = getByRole(toolbar, 'button', { name });

      await user.click(toggleControlsBtn);

      // Act
      const menu = getByRole(toolbar, 'menu', { name: 'Control Buttons' });

      // Assert
      expect(menu).toHaveAttribute('aria-orientation', 'horizontal');
    });

    /**
     * Define an array of IDs of elements that are controlled by "Clear All"
     * and "Fill All" buttons.
     */

    const deletableSectionIds: SectionIdsDeletable =
      possibleSectionIds.toSpliced(0, 1) as ArraySplice<SectionIds, 0, 1>;

    type AppendSuffix<T extends SectionIds> = {
      [K in keyof T]: `${T[K]}-tabpanel`;
    };

    const tabpanelIds: TabpanelIds = possibleSectionIds.map(
      (sectionId) => `${sectionId}-tabpanel`,
    ) as AppendSuffix<SectionIds>;

    const allNecessaryIds = [...deletableSectionIds, ...tabpanelIds] as const;

    describe('Clear All', () => {
      const name = 'Clear All';

      it('should render as a menuitem with an accessible name "Clear All"', async () => {
        const { controls } = await renderControls();

        const btn = getByRole(controls, 'menuitem', { name });

        expect(btn).toBeInTheDocument();
      });

      it('should control all elements that have IDs equal to deletable section IDs and control all tabpanels that represent sections', async () => {
        const { controls } = await renderControls();
        const btn = getByRole(controls, 'menuitem', { name });

        const attrValue = btn.getAttribute('aria-controls');

        allNecessaryIds.forEach((id) => {
          expect(attrValue).toContain(id);
        });
      });

      it('should call `deleteAll` on click', async () => {
        const mockFn = jest.fn();
        const props = getProps({ deleteAll: mockFn });
        const { controls, user } = await renderControls(props);
        const btn = getByRole(controls, 'menuitem', { name });

        await user.click(btn);

        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });

    describe('Fill All', () => {
      const name = 'Fill All';

      it('should render as a menuitem with an accessible name "Fill All"', async () => {
        const { controls } = await renderControls();

        const btn = getByRole(controls, 'menuitem', { name });

        expect(btn).toBeInTheDocument();
      });

      it('should control all elements that have IDs equal to deletable section IDs and control all tabpanels that represent sections', async () => {
        const { controls } = await renderControls();
        const btn = getByRole(controls, 'menuitem', { name });

        const attrValue = btn.getAttribute('aria-controls');

        allNecessaryIds.forEach((id) => {
          expect(attrValue).toContain(id);
        });
      });

      it('should call `fillAll` on click', async () => {
        const mockFn = jest.fn();
        const props = getProps({ fillAll: mockFn });
        const { controls, user } = await renderControls(props);
        const btn = getByRole(controls, 'menuitem', { name });

        await user.click(btn);

        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });

    describe('Open Preview', () => {
      const name = 'Open Preview';

      it('should render as a menuitem with an accessible name "Open Preview"', async () => {
        const { controls } = await renderControls();

        const btn = getByRole(controls, 'menuitem', { name });

        expect(btn).toBeInTheDocument();
      });

      it('should have an accessible name "Preview" for its icon', async () => {
        const { controls } = await renderControls();
        const btn = getByRole(controls, 'menuitem', { name });

        const icon = getByRole(btn, 'img', { name: 'Preview' });

        expect(icon).toBeInTheDocument();
      });

      it('should show the preview dialog on click', async () => {
        // Arrange
        const { controls, user } = await renderControls();
        const btn = getByRole(controls, 'menuitem', { name });

        // Make sure the dialog isn't in the document initially.
        let dialog = screen.queryByRole('dialog', { name: 'Preview' });
        expect(dialog).not.toBeInTheDocument();

        // Act
        await user.click(btn);
        dialog = screen.getByRole('dialog', { name: 'Preview' });

        // Assert
        expect(dialog).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard navigation', () => {
    describe('"Toggle Navigation" button', () => {
      it('should pass focus to the "Toggle Control Buttons" button when Arrow Left is pressed', async () => {
        // Arrange
        renderToolbar();
        const user = userEvent.setup();

        const toggleControlsBtn = screen.getByRole('button', {
          name: 'Control Buttons',
        });

        const toggleNavbarBtn = screen.getByRole('button', {
          name: 'Navigation',
        });

        toggleNavbarBtn.focus();

        // Act
        await user.keyboard('{ArrowLeft}');

        // Assert
        expect(toggleControlsBtn).toHaveFocus();
      });

      it('should pass focus to the "Toggle Control Buttons" button when Arrow Right is pressed', async () => {
        // Arrange
        renderToolbar();
        const user = userEvent.setup();

        const toggleControlsBtn = screen.getByRole('button', {
          name: 'Control Buttons',
        });

        const toggleNavbarBtn = screen.getByRole('button', {
          name: 'Navigation',
        });

        toggleNavbarBtn.focus();

        // Act
        await user.keyboard('{ArrowRight}');

        // Assert
        expect(toggleControlsBtn).toHaveFocus();
      });
    });

    describe('"Toggle Control Buttons" button', () => {
      it('should pass focus to the "Toggle Navigation" button when Arrow Left is pressed', async () => {
        // Arrange
        renderToolbar();
        const user = userEvent.setup();

        const toggleNavbarBtn = screen.getByRole('button', {
          name: 'Navigation',
        });

        const toggleControlsBtn = screen.getByRole('button', {
          name: 'Control Buttons',
        });

        toggleControlsBtn.focus();

        // Act
        await user.keyboard('{ArrowLeft}');

        // Assert
        expect(toggleNavbarBtn).toHaveFocus();
      });

      it('should pass focus to the "Toggle Control Buttons" button when Arrow Right is pressed', async () => {
        // Arrange
        renderToolbar();
        const user = userEvent.setup();

        const toggleNavbarBtn = screen.getByRole('button', {
          name: 'Navigation',
        });

        const toggleControlsBtn = screen.getByRole('button', {
          name: 'Control Buttons',
        });

        toggleControlsBtn.focus();

        // Act
        await user.keyboard('{ArrowRight}');

        // Assert
        expect(toggleNavbarBtn).toHaveFocus();
      });
    });

    describe('Control buttons', () => {
      const controlsIds: ControlsIds = ['delete-all', 'fill-all', 'preview'];

      const controlsNames = controlsIds.map((id) => {
        switch (id) {
          case 'delete-all':
            return 'Clear All';
          case 'fill-all':
            return 'Fill All';
          case 'preview':
            return 'Open Preview';
          default:
            neverReached(id);
        }
      });

      const leftMostBtnName = controlsNames[0];
      const rightMostBtnName = controlsNames.at(-1);

      describe('Arrow Left keypress', () => {
        it('shold focus the rightmost menuitem if the leftmost menuitem is focused', async () => {
          // Arrange
          const { user } = await renderControls();

          const rightmostMenuitem = screen.getByRole('menuitem', {
            name: rightMostBtnName,
          });

          const leftmostMenuitem = screen.getByRole('menuitem', {
            name: leftMostBtnName,
          });

          leftmostMenuitem.focus();

          // Act
          await user.keyboard('{ArrowLeft}');

          // Assert
          expect(rightmostMenuitem).toHaveFocus();
        });

        it("should focus the menuitem to the left if the focused menuitem isn't the leftmost", async () => {
          // Arrange
          const { user } = await renderControls();

          const menuitemToTheLeft = screen.getByRole('menuitem', {
            name: controlsNames[0],
          });

          const menuitem = screen.getByRole('menuitem', {
            name: controlsNames[1],
          });

          menuitem.focus();

          // Act
          await user.keyboard('{ArrowLeft}');

          // Assert
          expect(menuitemToTheLeft).toHaveFocus();
        });
      });

      describe('Arrow Right keypress', () => {
        it('shold focus the leftmost menuitem if the rightmost menuitem is focused', async () => {
          // Arrange
          const { user } = await renderControls();

          const leftmostMenuitem = screen.getByRole('menuitem', {
            name: leftMostBtnName,
          });

          const rightmostMenuitem = screen.getByRole('menuitem', {
            name: rightMostBtnName,
          });

          rightmostMenuitem.focus();

          // Act
          await user.keyboard('{ArrowRight}');

          // Assert
          expect(leftmostMenuitem).toHaveFocus();
        });

        it("should focus the menuitem to the right if the focused menuitem isn't the rightmost", async () => {
          // Arrange
          const { user } = await renderControls();

          const menuitemToTheRight = screen.getByRole('menuitem', {
            name: controlsNames[1],
          });

          const menuitem = screen.getByRole('menuitem', {
            name: controlsNames[0],
          });

          menuitem.focus();

          // Act
          await user.keyboard('{ArrowRight}');

          // Assert
          expect(menuitemToTheRight).toHaveFocus();
        });
      });

      describe('Escape keypress', () => {
        it('should hide the control buttons and focus the "Toggle Control Buttons" button', async () => {
          // Arrange
          const { user } = await renderControls();

          const toggleControlsBtn = screen.getByRole('button', {
            name: 'Control Buttons',
            expanded: true,
          });

          const menuitem = screen.getByRole('menuitem', {
            name: leftMostBtnName,
          });

          menuitem.focus();

          // Act
          await user.keyboard('{Escape}');

          // Assert
          expect(toggleControlsBtn).toHaveFocus();
          expect(toggleControlsBtn).toHaveAttribute('aria-expanded', 'false');
        });
      });

      describe('Shift + Tab keypress', () => {
        it('should hide the control buttons and focus the "Toggle Control Buttons" button', async () => {
          // Arrange
          const { user } = await renderControls();

          const toggleControlsBtn = screen.getByRole('button', {
            name: 'Control Buttons',
            expanded: true,
          });

          const menuitem = screen.getByRole('menuitem', {
            name: leftMostBtnName,
          });

          menuitem.focus();

          // Act
          await user.keyboard('{Shift>}{Tab}{/Shift}');

          // Assert
          expect(toggleControlsBtn).toHaveFocus();
          expect(toggleControlsBtn).toHaveAttribute('aria-expanded', 'false');
        });
      });
    });
  });

  describe('On-blur behaviour', () => {
    describe('Control buttons', () => {
      it('should hide on blur', async () => {
        // Arrange
        await renderControls();

        let toggleControls = screen.getByRole('button', {
          name: 'Control Buttons',
          expanded: true,
        });

        const controlBtn = screen.getByRole('menuitem', { name: 'Fill All' });
        controlBtn.focus();

        // Act
        controlBtn.blur();

        // Assert
        toggleControls = await screen.findByRole('button', {
          name: 'Control Buttons',
          expanded: false,
        });

        expect(toggleControls).toBeInTheDocument();
      });
    });
  });
});
