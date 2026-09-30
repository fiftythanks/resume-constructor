// It disallowed using `crypto`, which is well supported.
/* eslint-disable n/no-unsupported-features/node-builtins */

import { act } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import possibleSectionIds from '@/utils/possibleSectionIds';

import Toolbar from './Toolbar';

import type { ToolbarProps } from './Toolbar';
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
    ...overrides,
  };
}

function renderToolbar(props?: Partial<ToolbarProps>) {
  render(<div id="popup-root" />);
  render(<Toolbar {...getProps(props)} />);
}

describe('Toolbar', () => {
  it('should render a toolbar', () => {
    renderToolbar();

    const toolbar = screen.getByRole('toolbar');

    expect(toolbar).toBeInTheDocument();
  });

  it("should use the `className` prop in the toolbar's class", () => {
    renderToolbar({ className: 'ToolbarClass' });
    const toolbar = screen.getByRole('toolbar');

    expect(toolbar).toHaveClass('ToolbarClass');
  });

  const deletableSectionIds: SectionIdsDeletable = possibleSectionIds.toSpliced(
    0,
    1,
  ) as ArraySplice<SectionIds, 0, 1>;

  type AppendSuffix<T extends SectionIds> = {
    [K in keyof T]: `${T[K]}-tabpanel`;
  };

  const tabpanelIds: TabpanelIds = possibleSectionIds.map(
    (sectionId) => `${sectionId}-tabpanel`,
  ) as AppendSuffix<SectionIds>;

  const allControlledIds = [...deletableSectionIds, ...tabpanelIds].join(' ');

  describe('Buttons', () => {
    describe('"Clear All" button', () => {
      it('should render with an accessible name "Clear All"', () => {
        renderToolbar();

        const btn = screen.getByRole('button', { name: 'Clear All' });

        expect(btn).toBeInTheDocument();
      });

      it('should control deletable section tabs and tabpanels', () => {
        renderToolbar();

        const btn = screen.getByRole('button', { name: 'Clear All' });

        expect(btn).toHaveAttribute('aria-controls', allControlledIds);
      });

      it('should call `deleteAll` when clicked', async () => {
        const deleteAllMock = jest.fn();
        renderToolbar({ deleteAll: deleteAllMock });
        const user = userEvent.setup();

        const btn = screen.getByRole('button', { name: 'Clear All' });
        await user.click(btn);

        expect(deleteAllMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('"Fill All" button', () => {
      it('should render with an accessible name "Fill All"', () => {
        renderToolbar();

        const btn = screen.getByRole('button', { name: 'Fill All' });

        expect(btn).toBeInTheDocument();
      });

      it('should control deletable section tabs and tabpanels', () => {
        renderToolbar();

        const btn = screen.getByRole('button', { name: 'Fill All' });

        expect(btn).toHaveAttribute('aria-controls', allControlledIds);
      });

      it('should call `fillAll` when clicked', async () => {
        const fillAllMock = jest.fn();
        renderToolbar({ fillAll: fillAllMock });
        const user = userEvent.setup();

        const btn = screen.getByRole('button', { name: 'Fill All' });
        await user.click(btn);

        expect(fillAllMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('"Open Preview" button', () => {
      it('should render with an accessible name "Open Preview"', () => {
        renderToolbar();

        const btn = screen.getByRole('button', { name: 'Open Preview' });

        expect(btn).toBeInTheDocument();
      });

      it('should show the preview dialog on click', async () => {
        renderToolbar();
        const user = userEvent.setup();

        const btn = screen.getByRole('button', { name: 'Open Preview' });

        expect(
          screen.queryByRole('dialog', { name: 'Preview' }),
        ).not.toBeInTheDocument();

        await user.click(btn);

        expect(
          screen.getByRole('dialog', { name: 'Preview' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard navigation', () => {
    describe('Arrow Left keypress', () => {
      it('should focus the rightmost button ("Open Preview") if "Clear All" is focused', async () => {
        renderToolbar();
        const user = userEvent.setup();

        const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });
        const previewBtn = screen.getByRole('button', { name: 'Open Preview' });

        act(() => {
          clearAllBtn.focus();
        });
        await user.keyboard('{ArrowLeft}');

        expect(previewBtn).toHaveFocus();
      });

      it('should focus "Clear All" if "Fill All" is focused', async () => {
        renderToolbar();
        const user = userEvent.setup();

        const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });
        const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });

        act(() => {
          fillAllBtn.focus();
        });
        await user.keyboard('{ArrowLeft}');

        expect(clearAllBtn).toHaveFocus();
      });

      it('should focus "Fill All" if "Open Preview" is focused', async () => {
        renderToolbar();
        const user = userEvent.setup();

        const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });
        const previewBtn = screen.getByRole('button', { name: 'Open Preview' });

        act(() => {
          previewBtn.focus();
        });
        await user.keyboard('{ArrowLeft}');

        expect(fillAllBtn).toHaveFocus();
      });
    });

    describe('Arrow Right keypress', () => {
      it('should focus "Fill All" if "Clear All" is focused', async () => {
        renderToolbar();
        const user = userEvent.setup();

        const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });
        const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });

        act(() => {
          clearAllBtn.focus();
        });
        await user.keyboard('{ArrowRight}');

        expect(fillAllBtn).toHaveFocus();
      });

      it('should focus "Open Preview" if "Fill All" is focused', async () => {
        renderToolbar();
        const user = userEvent.setup();

        const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });
        const previewBtn = screen.getByRole('button', { name: 'Open Preview' });

        act(() => {
          fillAllBtn.focus();
        });
        await user.keyboard('{ArrowRight}');

        expect(previewBtn).toHaveFocus();
      });

      it('should focus the leftmost button ("Clear All") if "Open Preview" is focused', async () => {
        renderToolbar();
        const user = userEvent.setup();

        const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });
        const previewBtn = screen.getByRole('button', { name: 'Open Preview' });

        act(() => {
          previewBtn.focus();
        });
        await user.keyboard('{ArrowRight}');

        expect(clearAllBtn).toHaveFocus();
      });
    });
  });

  describe('Roving tabindex', () => {
    it('should initially set tabIndex 0 to "Clear All" and -1 to others', () => {
      renderToolbar();

      const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });
      const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });
      const previewBtn = screen.getByRole('button', { name: 'Open Preview' });

      expect(clearAllBtn).toHaveAttribute('tabindex', '0');
      expect(fillAllBtn).toHaveAttribute('tabindex', '-1');
      expect(previewBtn).toHaveAttribute('tabindex', '-1');
    });

    it('should update tabIndex to 0 on "Fill All" when it is focused', async () => {
      renderToolbar();
      const user = userEvent.setup();

      const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });
      const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });
      const previewBtn = screen.getByRole('button', { name: 'Open Preview' });

      await user.click(fillAllBtn);

      expect(fillAllBtn).toHaveAttribute('tabindex', '0');
      expect(clearAllBtn).toHaveAttribute('tabindex', '-1');
      expect(previewBtn).toHaveAttribute('tabindex', '-1');
    });

    it('should update tabIndex to 0 on "Open Preview" when it is focused', async () => {
      renderToolbar();
      const user = userEvent.setup();

      const clearAllBtn = screen.getByRole('button', { name: 'Clear All' });
      const fillAllBtn = screen.getByRole('button', { name: 'Fill All' });
      const previewBtn = screen.getByRole('button', { name: 'Open Preview' });

      await user.click(previewBtn);

      expect(previewBtn).toHaveAttribute('tabindex', '0');
      expect(clearAllBtn).toHaveAttribute('tabindex', '-1');
      expect(fillAllBtn).toHaveAttribute('tabindex', '-1');
    });
  });
});
