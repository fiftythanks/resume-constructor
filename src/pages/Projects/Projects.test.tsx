/**
 * This rule doesn't allow me to use `crypto`, which is already an available
 * feature in Node.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */
import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

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
    firstTabbable: { current: null },
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
  it('should render as a tabpanel with an accessible name derived from an element with an ID "projects"', () => {
    render(<div aria-label="Projects" id="projects" />);
    render(<Projects {...getProps()} />);

    const projects = screen.getByRole('tabpanel', { name: 'Projects' });

    expect(projects).toBeInTheDocument();
  });

  it('should render a heading "Project [index + 1]"', () => {
    render(<div aria-label="Projects" id="projects" />);
    render(<Projects {...getProps()} />);

    const heading = screen.getByRole('heading', { name: 'Project 1' });

    expect(heading).toBeInTheDocument();
  });

  describe('"Show Previous / Next Project" buttons', () => {
    describe('"Show Previous Project" button', () => {
      it('should not render the button if the shown project is the first one', () => {
        render(<div aria-label="Projects" id="projects" />);
        render(<Projects {...getProps()} />);

        const btn = screen.queryByRole('button', {
          name: 'Show Previous Project',
        });

        expect(btn).not.toBeInTheDocument();
      });

      it("should render the button if the shown project isn't the first one", () => {
        render(<div aria-label="Projects" id="projects" />);
        let props = getProps();

        props = { ...props, data: { ...props.data, shownProjectIndex: 1 } };

        render(<Projects {...props} />);

        const btn = screen.getByRole('button', {
          name: 'Show Previous Project',
        });

        expect(btn).toBeInTheDocument();
      });

      it('should call `showProject(shownProjectIndex - 1)` when the button is clicked', async () => {
        render(<div aria-label="Projects" id="projects" />);
        const showProjectMock = jest.fn((_index: number) => {});
        let props = getProps();

        props = {
          ...props,
          data: { ...props.data, shownProjectIndex: 1 },
          functions: { ...props.functions, showProject: showProjectMock },
        };

        render(<Projects {...props} />);
        const user = userEvent.setup();

        const btn = screen.getByRole('button', {
          name: 'Show Previous Project',
        });

        await user.click(btn);

        expect(showProjectMock).toHaveBeenCalledTimes(1);
        expect(showProjectMock).toHaveBeenCalledWith(0);
      });
    });

    describe('"Show Next Project" button', () => {
      it('should not render the button if the shown project is the last one', () => {
        render(<div aria-label="Projects" id="projects" />);
        let props = getProps();

        props = {
          ...props,
          data: {
            ...props.data,
            shownProjectIndex: props.data.projects.length - 1,
          },
        };

        render(<Projects {...props} />);

        const btn = screen.queryByRole('button', {
          name: 'Show Next Project',
        });

        expect(btn).not.toBeInTheDocument();
      });

      it("should render the button if the shown project isn't the last one", () => {
        render(<div aria-label="Projects" id="projects" />);
        render(<Projects {...getProps()} />);

        const btn = screen.getByRole('button', {
          name: 'Show Next Project',
        });

        expect(btn).toBeInTheDocument();
      });

      it('should call `showProject(shownProjectIndex + 1)` when the button is clicked', async () => {
        render(<div aria-label="Projects" id="projects" />);
        const showProjectMock = jest.fn((_index: number) => {});
        let props = getProps();

        props = {
          ...props,
          functions: { ...props.functions, showProject: showProjectMock },
        };

        render(<Projects {...props} />);
        const user = userEvent.setup();

        const btn = screen.getByRole('button', {
          name: 'Show Next Project',
        });

        await user.click(btn);

        expect(showProjectMock).toHaveBeenCalledTimes(1);
        expect(showProjectMock).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('"Add Project" button', () => {
    it('should render a button "Add Project [number of projects + 1]', () => {
      render(<div aria-label="Projects" id="projects" />);
      const props = getProps();
      render(<Projects {...props} />);

      const btn = screen.getByRole('button', {
        name: `Add Project ${props.data.projects.length + 1}`,
      });

      expect(btn).toBeInTheDocument();
    });

    it('should call `addProject` when the button is clicked', async () => {
      render(<div aria-label="Projects" id="projects" />);
      const addProjectMock = jest.fn();
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addProject: addProjectMock },
      };

      render(<Projects {...props} />);
      const user = userEvent.setup();

      const btn = screen.getByRole('button', {
        name: `Add Project ${props.data.projects.length + 1}`,
      });

      await user.click(btn);

      expect(addProjectMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('"Delete Project" button', () => {
    it('should render a "Delete Project [shown project index + 1]" button if there is more than one project', () => {
      render(<div aria-label="Projects" id="projects" />);
      const props = getProps();
      render(<Projects {...props} />);

      const btn = screen.getByRole('button', {
        name: `Delete Project ${props.data.shownProjectIndex + 1}`,
      });

      expect(btn).toBeInTheDocument();
    });

    it("should not render the button if there's just one project", () => {
      render(<div aria-label="Projects" id="projects" />);
      let props = getProps();

      props = {
        ...props,
        data: { shownProjectIndex: 0, projects: [props.data.projects[0]] },
      };

      render(<Projects {...props} />);

      const btn = screen.queryByRole('button', {
        name: 'Delete Project 1',
      });

      expect(btn).not.toBeInTheDocument();
    });

    it('should call `deleteProject(shownProjectIndex)` when the button is called', async () => {
      render(<div aria-label="Projects" id="projects" />);
      const deleteProjectMock = jest.fn((_index: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, deleteProject: deleteProjectMock },
      };

      render(<Projects {...props} />);
      const user = userEvent.setup();

      const btn = screen.getByRole('button', {
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

    it('should have the correct data from `data`', () => {
      render(<div aria-label="Projects" id="projects" />);
      const props = getProps();
      render(<Projects {...props} />);

      const { shownProjectIndex } = props.data;

      const { bulletPoints, code, demo, projectName, stack } =
        props.data.projects[shownProjectIndex];

      const projectNameInput: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Project Name',
      });

      const stackInput: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Tech Stack',
      });

      const codeText: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Code (text)',
      });

      const codeUrl: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Code (link)',
      });

      const demoText: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Demo (text)',
      });

      const demoUrl: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Demo (link)',
      });

      expect(projectNameInput).toBeInTheDocument();
      expect(projectNameInput.value).toBe(projectName);
      expect(stackInput).toBeInTheDocument();
      expect(stackInput.value).toBe(stack);
      expect(codeText).toBeInTheDocument();
      expect(codeText.value).toBe(code.text);
      expect(codeUrl).toBeInTheDocument();
      expect(codeUrl.value).toBe(code.link);
      expect(demoText).toBeInTheDocument();
      expect(demoText.value).toBe(demo.text);
      expect(demoUrl).toBeInTheDocument();
      expect(demoUrl.value).toBe(demo.link);

      bulletPoints.forEach((bulletPoint, i) => {
        const textInput: HTMLInputElement = screen.getByRole('textbox', {
          name: `Bullet point ${i + 1}`,
        });

        expect(textInput).toBeInTheDocument();
        expect(textInput.id).toBe(bulletPoint.id);
        expect(textInput.value).toBe(bulletPoint.value);
      });
    });

    it('should call `addBulletPoint(projectIndex)` when a bullet point is added via the corresponding control', async () => {
      render(<div aria-label="Projects" id="projects" />);
      const addBulletPointMock = jest.fn((_projectIndex: number) => {});
      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, addBulletPoint: addBulletPointMock },
      };

      render(<Projects {...props} />);
      const user = userEvent.setup();

      const addBulletPointBtn = screen.getByRole('button', {
        name: 'Add bullet point',
      });

      await user.click(addBulletPointBtn);

      expect(addBulletPointMock).toHaveBeenCalledTimes(1);

      expect(addBulletPointMock).toHaveBeenCalledWith(
        props.data.shownProjectIndex,
      );
    });

    it('should call `deleteBulletPoint(projectIndex, itemIndex)` when a bullet point is deleted via the corresponding control', async () => {
      render(<div aria-label="Projects" id="projects" />);

      const deleteBulletPointMock = jest.fn(
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

      render(<Projects {...props} />);
      const user = userEvent.setup();

      const deleteBulletPointBtn = screen.getByRole('button', {
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
      render(<div aria-label="Projects" id="projects" />);

      const editBulletPointMock = jest.fn(
        (_projectIndex: number, _itemIndex: number, _value: string) => {},
      );

      let props = getProps();

      props = {
        ...props,
        functions: { ...props.functions, editBulletPoint: editBulletPointMock },
      };

      render(<Projects {...props} />);
      const user = userEvent.setup();

      const input = screen.getByRole('textbox', {
        name: 'Bullet point 1',
      });

      input.focus();

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
      render(<div aria-label="Projects" id="projects" />);

      const editProjectLinkMock = jest.fn(
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

      render(<Projects {...props} />);
      const user = userEvent.setup();

      const input = screen.getByRole('textbox', {
        name: 'Code (text)',
      });

      input.focus();

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
      render(<div aria-label="Projects" id="projects" />);

      const editProjectTextMock = jest.fn(
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

      render(<Projects {...props} />);
      const user = userEvent.setup();

      const input = screen.getByRole('textbox', {
        name: 'Project Name',
      });

      input.focus();

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

    // TODO: find a way to test `updateBulletPoints` as soon as or working around finding a way to test dragging over in the `BulletPoints` test suite.

    /**
     * For DnD announcements, `dnd-kit` has its own logic. If it ever changes,
     * the test's name should be changed.
     */
    it('should call `updateScreenReaderAnnouncement` when an important change is made to the project via its controls or text inputs (not DnD-related)', async () => {
      render(<div aria-label="Projects" id="projects" />);
      const implementation = (_announcement: string) => {};
      const updateScreenReaderAnnouncementMock = jest.fn(implementation);
      const props = getProps();
      props.updateScreenReaderAnnouncement = updateScreenReaderAnnouncementMock;
      render(<Projects {...props} />);
      const user = userEvent.setup();
      const name = 'Delete bullet point 1';
      const deleteBtn = screen.getByRole('button', { name });

      await user.click(deleteBtn);

      expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should pass the "Show Previous Project" button to `firstTabbable.current` when a non-first project is shown', () => {
    // Arrange
    const firstTabbable = { current: null };
    const props = getProps({ firstTabbable });
    props.data.shownProjectIndex = 1;

    render(<div aria-label="Projects" id="projects" />);
    render(<Projects {...props} />);

    // Act
    const firstTabbableNode = screen.getByRole('button', {
      name: 'Show Previous Project',
    });

    // Assert
    expect(firstTabbable.current).toBe(firstTabbableNode);
  });

  it('should pass the "Show Next Project" button to `firstTabbable.current` when the first project is shown and there are several projects', () => {
    // Arrange
    const firstTabbable = { current: null };
    const props = getProps({ firstTabbable });

    render(<div aria-label="Projects" id="projects" />);
    render(<Projects {...props} />);

    // Act
    const firstTabbableNode = screen.getByRole('button', {
      name: 'Show Next Project',
    });

    // Assert
    expect(firstTabbable.current).toBe(firstTabbableNode);
  });

  it("should pass the 'Add Project' button to `firstTabbable.current` when there's only one project", () => {
    // Arrange
    const firstTabbable = { current: null };
    const props = getProps({ firstTabbable });
    props.data.projects.splice(0, 2);

    render(<div aria-label="Projects" id="projects" />);
    render(<Projects {...props} />);

    // Act
    const firstTabbableNode = screen.getByRole('button', {
      name: 'Add Project 2',
    });

    // Assert
    expect(firstTabbable.current).toBe(firstTabbableNode);
  });
});
