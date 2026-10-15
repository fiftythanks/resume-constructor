/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Projects from './Projects';

import type { ProjectsProps } from './Projects';
import type { ItemWithId } from '@/types/resumeData';

function getProps(overrides?: Partial<ProjectsProps>): ProjectsProps {
  return {
    updateScreenReaderAnnouncement(_announcement: string) {},
    data: {
      shownProjectIndex: 0,
      projects: [
        {
          id: crypto.randomUUID(),
          projectName: 'Project 1 Name',
          stack: 'The best stack 1',
          bulletPoints: [
            {
              id: crypto.randomUUID(),
              value: 'Bullet point 1',
            },
            {
              id: crypto.randomUUID(),
              value: 'Bullet point 2',
            },
            {
              id: crypto.randomUUID(),
              value: 'Bullet point 3',
            },
          ],
          code: {
            link: 'Code 1 link URL',
            text: 'Code 1 link text',
          },
          demo: {
            link: 'Demo 1 link URL',
            text: 'Demo 1 link text',
          },
        },
        {
          id: crypto.randomUUID(),
          projectName: 'Project 2 Name',
          stack: 'The best stack 2',
          bulletPoints: [
            {
              id: crypto.randomUUID(),
              value: 'Bullet point 1',
            },
            {
              id: crypto.randomUUID(),
              value: 'Bullet point 2',
            },
            {
              id: crypto.randomUUID(),
              value: 'Bullet point 3',
            },
          ],
          code: {
            link: 'Code 2 link URL',
            text: 'Code 2 link text',
          },
          demo: {
            link: 'Demo 2 link URL',
            text: 'Demo 2 link text',
          },
        },
        {
          id: crypto.randomUUID(),
          projectName: 'Project 3 Name',
          stack: 'The best stack 3',
          bulletPoints: [
            {
              id: crypto.randomUUID(),
              value: 'Bullet point 1',
            },
            {
              id: crypto.randomUUID(),
              value: 'Bullet point 2',
            },
            {
              id: crypto.randomUUID(),
              value: 'Bullet point 3',
            },
          ],
          code: {
            link: 'Code 3 link URL',
            text: 'Code 3 link text',
          },
          demo: {
            link: 'Demo 3 link URL',
            text: 'Demo 3 link text',
          },
        },
      ],
    },
    ref: { current: null },
    functions: {
      addBulletPoint(_projectIndex: number) {},
      addProject() {},
      deleteProject(_index: number) {},
      deleteBulletPoint(_projectIndex: number, _itemIndex: number) {},
      showProject(_newShownProjectIndex: number) {},
      updateBulletPoints(_projectIndex: number, _value: ItemWithId[]) {},
      editBulletPoint(
        _projectIndex: number,
        _itemIndex: number,
        _value: string,
      ) {},
      editProjectLink(
        _index: number,
        _field: 'code' | 'demo',
        _type: 'link' | 'text',
        _value: string,
      ) {},
      editProjectText(
        _index: number,
        _field: 'projectName' | 'stack',
        _value: string,
      ) {},
    },
    ...overrides,
  };
}

describe('Projects', () => {
  it('should render as a tabpanel with an accessible name derived from an element with an ID "projects"', async () => {
    await render(<div aria-label="Projects" id="projects" />);
    await render(<Projects {...getProps()} />);

    const projects = page.getByRole('tabpanel', { name: 'Projects' });

    await expect.element(projects).toBeInTheDocument();
  });

  it('should render a heading "Project [index + 1]"', async () => {
    await render(<div aria-label="Projects" id="projects" />);
    await render(<Projects {...getProps()} />);

    const heading = page.getByRole('heading', { name: 'Project 1' });

    await expect.element(heading).toBeInTheDocument();
  });

  describe('"Show Previous / Next Project" buttons', () => {
    describe('"Show Previous Project" button', () => {
      it('should not render the button if the shown project is the first one', async () => {
        await render(<div aria-label="Projects" id="projects" />);
        await render(<Projects {...getProps()} />);

        const btn = page.getByRole('button', {
          name: 'Show Previous Project',
        });

        await expect.element(btn).not.toBeInTheDocument();
      });

      it("should render the button if the shown project isn't the first one", async () => {
        await render(<div aria-label="Projects" id="projects" />);
        let props = getProps();

        props = { ...props, data: { ...props.data, shownProjectIndex: 1 } };

        await render(<Projects {...props} />);

        const btn = page.getByRole('button', {
          name: 'Show Previous Project',
        });

        await expect.element(btn).toBeInTheDocument();
      });

      it('should call `showProject(shownProjectIndex - 1)` when the button is clicked', async () => {
        await render(<div aria-label="Projects" id="projects" />);
        const showProjectMock = vi.fn((_index: number) => {});
        let props = getProps();

        props = {
          ...props,
          data: { ...props.data, shownProjectIndex: 1 },
          functions: { ...props.functions, showProject: showProjectMock },
        };

        await render(<Projects {...props} />);
        const user = userEvent.setup();

        const btn = page.getByRole('button', {
          name: 'Show Previous Project',
        });

        await user.click(btn);

        expect(showProjectMock).toHaveBeenCalledTimes(1);
        expect(showProjectMock).toHaveBeenCalledWith(0);
      });
    });

    describe('"Show Next Project" button', () => {
      it('should not render the button if the shown project is the last one', async () => {
        await render(<div aria-label="Projects" id="projects" />);
        let props = getProps();

        props = {
          ...props,
          data: {
            ...props.data,
            shownProjectIndex: props.data.projects.length - 1,
          },
        };

        await render(<Projects {...props} />);

        const btn = page.getByRole('button', {
          name: 'Show Next Project',
        });

        await expect.element(btn).not.toBeInTheDocument();
      });

      it("should render the button if the shown project isn't the last one", async () => {
        await render(<div aria-label="Projects" id="projects" />);
        await render(<Projects {...getProps()} />);

        const btn = page.getByRole('button', {
          name: 'Show Next Project',
        });

        await expect.element(btn).toBeInTheDocument();
      });

      it('should call `showProject(shownProjectIndex + 1)` when the button is clicked', async () => {
        await render(<div aria-label="Projects" id="projects" />);
        const showProjectMock = vi.fn((_index: number) => {});
        let props = getProps();

        props = {
          ...props,
          functions: { ...props.functions, showProject: showProjectMock },
        };

        await render(<Projects {...props} />);
        const user = userEvent.setup();

        const btn = page.getByRole('button', {
          name: 'Show Next Project',
        });

        await user.click(btn);

        expect(showProjectMock).toHaveBeenCalledTimes(1);
        expect(showProjectMock).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('"Add Project" button', () => {
    it('should render a button "Add Project [number of projects + 1]', async () => {
      await render(<div aria-label="Projects" id="projects" />);
      const props = getProps();
      await render(<Projects {...props} />);

      const btn = page.getByRole('button', {
        name: `Add Project ${props.data.projects.length + 1}`,
      });

      await expect.element(btn).toBeInTheDocument();
    });

    it('should call `addProject` when the button is clicked', async () => {
      await render(<div aria-label="Projects" id="projects" />);
      const addProjectMock = vi.fn();
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addProject: addProjectMock },
      };

      await render(<Projects {...props} />);
      const user = userEvent.setup();

      const btn = page.getByRole('button', {
        name: `Add Project ${props.data.projects.length + 1}`,
      });

      await user.click(btn);

      expect(addProjectMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('"Delete Project" button', () => {
    it('should render a "Delete Project [shown project index + 1]" button if there is more than one project', async () => {
      await render(<div aria-label="Projects" id="projects" />);
      const props = getProps();
      await render(<Projects {...props} />);

      const btn = page.getByRole('button', {
        name: `Delete Project ${props.data.shownProjectIndex + 1}`,
      });

      await expect.element(btn).toBeInTheDocument();
    });

    it("should not render the button if there's just one project", async () => {
      await render(<div aria-label="Projects" id="projects" />);
      let props = getProps();

      props = {
        ...props,
        data: { shownProjectIndex: 0, projects: [props.data.projects[0]] },
      };

      await render(<Projects {...props} />);

      const btn = page.getByRole('button', {
        name: 'Delete Project 1',
      });

      await expect.element(btn).not.toBeInTheDocument();
    });

    it('should call `deleteProject(shownProjectIndex)` when the button is called', async () => {
      await render(<div aria-label="Projects" id="projects" />);
      const deleteProjectMock = vi.fn((_index: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, deleteProject: deleteProjectMock },
      };

      await render(<Projects {...props} />);
      const user = userEvent.setup();

      const btn = page.getByRole('button', {
        name: `Delete Project ${props.data.shownProjectIndex + 1}`,
      });

      await user.click(btn);

      expect(deleteProjectMock).toHaveBeenCalledTimes(1);

      expect(deleteProjectMock).toHaveBeenCalledWith(
        props.data.shownProjectIndex,
      );
    });
  });

  describe('Shown project', () => {
    // TODO: should render a project. (At the moment, the way `Projects` is structured, it's hard to come up with a proper way to write this test. The component needs a refactor.)

    it('should have the correct data from `data`', async () => {
      await render(<div aria-label="Projects" id="projects" />);
      const props = getProps();
      await render(<Projects {...props} />);

      const { shownProjectIndex } = props.data;

      const { bulletPoints, code, demo, projectName, stack } =
        props.data.projects[shownProjectIndex];

      const projectNameInput = page.getByRole('textbox', {
        name: 'Project Name',
      });

      const stackInput = page.getByRole('textbox', {
        name: 'Tech Stack',
      });

      const codeText = page.getByRole('textbox', {
        name: 'Code (text)',
      });

      const codeUrl = page.getByRole('textbox', {
        name: 'Code (link)',
      });

      const demoText = page.getByRole('textbox', {
        name: 'Demo (text)',
      });

      const demoUrl = page.getByRole('textbox', {
        name: 'Demo (link)',
      });

      await expect.element(projectNameInput).toBeInTheDocument();
      await expect.element(projectNameInput).toHaveValue(projectName);
      await expect.element(stackInput).toBeInTheDocument();
      await expect.element(stackInput).toHaveValue(stack);
      await expect.element(codeText).toBeInTheDocument();
      await expect.element(codeText).toHaveValue(code.text);
      await expect.element(codeUrl).toBeInTheDocument();
      await expect.element(codeUrl).toHaveValue(code.link);
      await expect.element(demoText).toBeInTheDocument();
      await expect.element(demoText).toHaveValue(demo.text);
      await expect.element(demoUrl).toBeInTheDocument();
      await expect.element(demoUrl).toHaveValue(demo.link);

      for (let i = 0; i < bulletPoints.length; i++) {
        const bulletPoint = bulletPoints[i];
        const textInput = page.getByRole('textbox', {
          name: `Bullet point ${i + 1}`,
        });

        await expect.element(textInput).toBeInTheDocument();
        await expect.element(textInput).toHaveAttribute('id', bulletPoint.id);
        await expect.element(textInput).toHaveValue(bulletPoint.value);
      }
    });

    it('should call `addBulletPoint(projectIndex)` when a bullet point is added via the corresponding control', async () => {
      await render(<div aria-label="Projects" id="projects" />);
      const addBulletPointMock = vi.fn((_projectIndex: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addBulletPoint: addBulletPointMock },
      };

      await render(<Projects {...props} />);
      const user = userEvent.setup();

      const addBulletPointBtn = page.getByRole('button', {
        name: 'Add bullet point',
      });

      await user.click(addBulletPointBtn);

      expect(addBulletPointMock).toHaveBeenCalledTimes(1);

      expect(addBulletPointMock).toHaveBeenCalledWith(
        props.data.shownProjectIndex,
      );
    });

    it('should call `deleteBulletPoint(projectIndex, itemIndex)` when a bullet point is deleted via the corresponding control', async () => {
      await render(<div aria-label="Projects" id="projects" />);

      const deleteBulletPointMock = vi.fn(
        (_projectIndex: number, _itemIndex: number) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: {
          ...props.functions,
          deleteBulletPoint: deleteBulletPointMock,
        },
      };

      await render(<Projects {...props} />);
      const user = userEvent.setup();

      const deleteBulletPointBtn = page.getByRole('button', {
        name: 'Delete bullet point 1',
      });

      await user.click(deleteBulletPointBtn);

      expect(deleteBulletPointMock).toHaveBeenCalledTimes(1);

      expect(deleteBulletPointMock).toHaveBeenCalledWith(
        props.data.shownProjectIndex,
        0,
      );
    });

    it('should call `editBulletPoint(projectIndex, itemIndex, value)` when a bullet point is edited via the corresponding text input', async () => {
      await render(<div aria-label="Projects" id="projects" />);

      const editBulletPointMock = vi.fn(
        (_projectIndex: number, _itemIndex: number, _value: string) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editBulletPoint: editBulletPointMock },
      };

      await render(<Projects {...props} />);
      const user = userEvent.setup();

      const input = page.getByRole('textbox', {
        name: 'Bullet point 1',
      });

      input.element().focus();

      await user.keyboard('s');

      expect(editBulletPointMock).toHaveBeenCalledTimes(1);

      const { shownProjectIndex } = props.data;
      const shownProject = props.data.projects[shownProjectIndex];
      const { value: bulletValue } = shownProject.bulletPoints[0];

      expect(editBulletPointMock).toHaveBeenCalledWith(
        shownProjectIndex,
        0,
        `${bulletValue}s`,
      );
    });

    it('should call `editProjectLink(projectIndex, field, type, value)` when a link is edited via the corresponding text input', async () => {
      await render(<div aria-label="Projects" id="projects" />);

      const editProjectLinkMock = vi.fn(
        (
          _projectIndex: number,
          _field: 'code' | 'demo',
          _type: 'link' | 'text',
          _value: string,
        ) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editProjectLink: editProjectLinkMock },
      };

      await render(<Projects {...props} />);
      const user = userEvent.setup();

      const input = page.getByRole('textbox', {
        name: 'Code (text)',
      });

      input.element().focus();

      await user.keyboard('s');

      expect(editProjectLinkMock).toHaveBeenCalledTimes(1);

      const { shownProjectIndex } = props.data;
      const shownProject = props.data.projects[shownProjectIndex];
      const { text: initialValue } = shownProject.code;

      expect(editProjectLinkMock).toHaveBeenCalledWith(
        shownProjectIndex,
        'code',
        'text',
        `${initialValue}s`,
      );
    });

    it('should call `editProjectText(projectIndex, field, value)` when a text field of a project is changed via the corresponding text input', async () => {
      await render(<div aria-label="Projects" id="projects" />);

      const editProjectTextMock = vi.fn(
        (
          _projectIndex: number,
          _field: 'projectName' | 'stack',
          _value: string,
        ) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editProjectText: editProjectTextMock },
      };

      await render(<Projects {...props} />);
      const user = userEvent.setup();

      const input = page.getByRole('textbox', {
        name: 'Project Name',
      });

      input.element().focus();

      await user.keyboard('s');

      expect(editProjectTextMock).toHaveBeenCalledTimes(1);

      const { shownProjectIndex } = props.data;
      const shownProject = props.data.projects[shownProjectIndex];
      const { projectName: initialValue } = shownProject;

      expect(editProjectTextMock).toHaveBeenCalledWith(
        shownProjectIndex,
        'projectName',
        `${initialValue}s`,
      );
    });

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to the project via its controls or text inputs (not DnD-related)', async () => {
      await render(<div aria-label="Projects" id="projects" />);
      const implementation = (_announcement: string) => {};
      const updateScreenReaderAnnouncementMock = vi.fn(implementation);
      const props = getProps();
      props.updateScreenReaderAnnouncement = updateScreenReaderAnnouncementMock;
      await render(<Projects {...props} />);
      const user = userEvent.setup();
      const name = 'Delete bullet point 1';
      const deleteBtn = page.getByRole('button', { name });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should pass the section element to `ref.current`', async () => {
    const ref = { current: null };
    await render(<Projects {...getProps({ ref })} />);

    const projects = page.getByRole('tabpanel');

    expect(ref.current).toBe(projects.element());
  });
});
