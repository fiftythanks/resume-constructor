import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Projects from './Projects';

import type { ProjectsProps } from './Projects';
import type { ItemWithId, Projects as ProjectsType } from '@/types/resumeData';

const DATA: ProjectsType = {
  shownProjectIndex: 0,
  projects: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      projectName: 'Project 1 Name',
      stack: 'The best stack 1',
      bulletPoints: [
        {
          id: '00000000-0000-0000-0000-000000000002',
          value: 'Bullet point 1',
        },
        {
          id: '00000000-0000-0000-0000-000000000003',
          value: 'Bullet point 2',
        },
        {
          id: '00000000-0000-0000-0000-000000000004',
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
      id: '00000000-0000-0000-0000-000000000005',
      projectName: 'Project 2 Name',
      stack: 'The best stack 2',
      bulletPoints: [
        {
          id: '00000000-0000-0000-0000-000000000006',
          value: 'Bullet point 1',
        },
        {
          id: '00000000-0000-0000-0000-000000000007',
          value: 'Bullet point 2',
        },
        {
          id: '00000000-0000-0000-0000-000000000008',
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
      id: '00000000-0000-0000-0000-000000000009',
      projectName: 'Project 3 Name',
      stack: 'The best stack 3',
      bulletPoints: [
        {
          id: '00000000-0000-0000-0000-000000000010',
          value: 'Bullet point 1',
        },
        {
          id: '00000000-0000-0000-0000-000000000011',
          value: 'Bullet point 2',
        },
        {
          id: '00000000-0000-0000-0000-000000000012',
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
};

const FUNCTIONS: ProjectsProps['functions'] = {
  addBulletPoint(_projectIndex: number) {},
  addProject() {},
  deleteBulletPoint(_projectIndex: number, _itemIndex: number) {},
  deleteProject(_index: number) {},
  editBulletPoint(_projectIndex: number, _itemIndex: number, _value: string) {},
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
  showProject(_newShownProjectIndex: number) {},
  updateBulletPoints(_projectIndex: number, _value: ItemWithId[]) {},
};

function getProps(overrides?: Partial<ProjectsProps>): ProjectsProps {
  return {
    data: structuredClone(DATA),
    ref: { current: null },
    functions: cloneDeep(FUNCTIONS),
    updateScreenReaderAnnouncement(_announcement: string) {},
    ...overrides,
  };
}

describe('Projects', () => {
  beforeEach(() => {
    const labelledElement = document.createElement('div');
    labelledElement.id = 'projects';
    labelledElement.setAttribute('aria-label', 'Projects');
    document.body.appendChild(labelledElement);
  });

  afterEach(() => {
    document.getElementById('projects')?.remove();
  });

  it('should render as a tabpanel with an accessible name derived from an element with an ID "projects"', () => {
    render(<Projects {...getProps()} />);

    const projects = screen.getByRole('tabpanel', { name: 'Projects' });

    expect(projects).toBeInTheDocument();
  });

  it('should render a heading "Project [index + 1]"', () => {
    render(<Projects {...getProps()} />);

    const heading = screen.getByRole('heading', { name: 'Project 1' });

    expect(heading).toBeInTheDocument();
  });

  describe('"Show Previous / Next Project" buttons', () => {
    describe('"Show Previous Project" button', () => {
      it('should not render the button if the shown project is the first one', () => {
        render(<Projects {...getProps()} />);

        const btn = screen.queryByRole('button', {
          name: 'Show Previous Project',
        });

        expect(btn).not.toBeInTheDocument();
      });

      it("should render the button if the shown project isn't the first one", () => {
        const data = structuredClone({ ...DATA, shownProjectIndex: 1 });
        render(<Projects {...getProps({ data })} />);

        const btn = screen.getByRole('button', {
          name: 'Show Previous Project',
        });

        expect(btn).toBeInTheDocument();
      });

      it('should call `showProject(shownProjectIndex - 1)` when the button is clicked', async () => {
        // Arrange
        const data = structuredClone({ ...DATA, shownProjectIndex: 1 });
        const showProjectMock = jest.fn<void, [number]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          showProject: showProjectMock,
        });

        render(<Projects {...getProps({ data, functions })} />);
        const user = userEvent.setup();

        const btn = screen.getByRole('button', {
          name: 'Show Previous Project',
        });

        // Act
        await user.click(btn);

        // Assert
        expect(showProjectMock).toHaveBeenCalledTimes(1);
        expect(showProjectMock).toHaveBeenCalledWith(0);
      });
    });

    describe('"Show Next Project" button', () => {
      it('should not render the button if the shown project is the last one', () => {
        const data = structuredClone({
          ...DATA,
          shownProjectIndex: DATA.projects.length - 1,
        });
        render(<Projects {...getProps({ data })} />);

        const btn = screen.queryByRole('button', {
          name: 'Show Next Project',
        });

        expect(btn).not.toBeInTheDocument();
      });

      it("should render the button if the shown project isn't the last one", () => {
        render(<Projects {...getProps()} />);

        const btn = screen.getByRole('button', {
          name: 'Show Next Project',
        });

        expect(btn).toBeInTheDocument();
      });

      it('should call `showProject(shownProjectIndex + 1)` when the button is clicked', async () => {
        // Arrange
        const showProjectMock = jest.fn<void, [number]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          showProject: showProjectMock,
        });

        render(<Projects {...getProps({ functions })} />);
        const user = userEvent.setup();

        const btn = screen.getByRole('button', {
          name: 'Show Next Project',
        });

        // Act
        await user.click(btn);

        // Assert
        expect(showProjectMock).toHaveBeenCalledTimes(1);
        expect(showProjectMock).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('"Add Project" button', () => {
    it('should render a button "Add Project [number of projects + 1]', () => {
      render(<Projects {...getProps()} />);

      const btn = screen.getByRole('button', {
        name: `Add Project ${DATA.projects.length + 1}`,
      });

      expect(btn).toBeInTheDocument();
    });

    it('should call `addProject` when the button is clicked', async () => {
      // Arrange
      const addProjectMock = jest.fn();
      const functions = cloneDeep({
        ...FUNCTIONS,
        addProject: addProjectMock,
      });

      render(<Projects {...getProps({ functions })} />);
      const user = userEvent.setup();

      const btn = screen.getByRole('button', {
        name: `Add Project ${DATA.projects.length + 1}`,
      });

      // Act
      await user.click(btn);

      // Assert
      expect(addProjectMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('"Delete Project" button', () => {
    it('should render a "Delete Project [shown project index + 1]" button if there is more than one project', () => {
      render(<Projects {...getProps()} />);

      const btn = screen.getByRole('button', {
        name: `Delete Project ${DATA.shownProjectIndex + 1}`,
      });

      expect(btn).toBeInTheDocument();
    });

    it("should not render the button if there's just one project", () => {
      const data = structuredClone({
        ...DATA,
        shownProjectIndex: 0,
        projects: [DATA.projects[0]],
      });

      render(<Projects {...getProps({ data })} />);

      const btn = screen.queryByRole('button', {
        name: 'Delete Project 1',
      });

      expect(btn).not.toBeInTheDocument();
    });

    it('should call `deleteProject(shownProjectIndex)` when the button is clicked', async () => {
      // Arrange
      const deleteProjectMock = jest.fn<void, [number]>();
      const functions = cloneDeep({
        ...FUNCTIONS,
        deleteProject: deleteProjectMock,
      });

      render(<Projects {...getProps({ functions })} />);
      const user = userEvent.setup();

      const btn = screen.getByRole('button', {
        name: `Delete Project ${DATA.shownProjectIndex + 1}`,
      });

      // Act
      await user.click(btn);

      // Assert
      expect(deleteProjectMock).toHaveBeenCalledTimes(1);
      expect(deleteProjectMock).toHaveBeenCalledWith(DATA.shownProjectIndex);
    });
  });

  describe('Shown project', () => {
    describe('Data', () => {
      const shownProject = DATA.projects[DATA.shownProjectIndex];

      it.each([
        ['Project Name', shownProject.projectName],
        ['Tech Stack', shownProject.stack],
        ['Code (text)', shownProject.code.text],
        ['Code (link)', shownProject.code.link],
        ['Demo (text)', shownProject.demo.text],
        ['Demo (link)', shownProject.demo.link],
      ] as const)('should have the correct %s', (name, expectedValue) => {
        render(<Projects {...getProps()} />);
        const input = screen.getByRole('textbox', { name });

        expect(input).toBeInTheDocument();
        expect(input).toHaveValue(expectedValue);
      });

      it.each([
        [1, shownProject.bulletPoints[0]],
        [2, shownProject.bulletPoints[1]],
        [3, shownProject.bulletPoints[2]],
      ] as const)(
        'should have the correct value and ID for bullet point %i',
        (index, expected) => {
          render(<Projects {...getProps()} />);
          const input = screen.getByRole('textbox', {
            name: `Bullet point ${index}`,
          });

          expect(input).toBeInTheDocument();
          expect(input).toHaveAttribute('id', expected.id);
          expect(input).toHaveValue(expected.value);
        },
      );
    });

    describe('Functions', () => {
      it('should call `addBulletPoint(projectIndex)` when a bullet point is added via the corresponding control', async () => {
        // Arrange
        const addBulletPointMock = jest.fn<void, [number]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          addBulletPoint: addBulletPointMock,
        });

        render(<Projects {...getProps({ functions })} />);
        const user = userEvent.setup();

        const addBulletPointBtn = screen.getByRole('button', {
          name: 'Add bullet point',
        });

        // Act
        await user.click(addBulletPointBtn);

        // Assert
        expect(addBulletPointMock).toHaveBeenCalledTimes(1);
        expect(addBulletPointMock).toHaveBeenCalledWith(DATA.shownProjectIndex);
      });

      it('should call `deleteBulletPoint(projectIndex, itemIndex)` when a bullet point is deleted via the corresponding control', async () => {
        // Arrange
        const deleteBulletPointMock = jest.fn<void, [number, number]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          deleteBulletPoint: deleteBulletPointMock,
        });

        render(<Projects {...getProps({ functions })} />);
        const user = userEvent.setup();

        const deleteBulletPointBtn = screen.getByRole('button', {
          name: 'Delete bullet point 1',
        });

        // Act
        await user.click(deleteBulletPointBtn);

        // Assert
        expect(deleteBulletPointMock).toHaveBeenCalledTimes(1);
        expect(deleteBulletPointMock).toHaveBeenCalledWith(
          DATA.shownProjectIndex,
          0,
        );
      });

      it('should call `editBulletPoint(projectIndex, itemIndex, value)` when a bullet point is edited via the corresponding text input', async () => {
        // Arrange
        const editBulletPointMock = jest.fn<void, [number, number, string]>();
        const functions = cloneDeep({
          ...FUNCTIONS,
          editBulletPoint: editBulletPointMock,
        });

        render(<Projects {...getProps({ functions })} />);
        const user = userEvent.setup();

        const input = screen.getByRole('textbox', {
          name: 'Bullet point 1',
        });
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(editBulletPointMock).toHaveBeenCalledTimes(1);
        const { bulletPoints } = DATA.projects[DATA.shownProjectIndex];
        expect(editBulletPointMock).toHaveBeenCalledWith(
          DATA.shownProjectIndex,
          0,
          `${bulletPoints[0].value}s`,
        );
      });

      it('should call `editProjectLink(projectIndex, field, type, value)` when a link is edited via the corresponding text input', async () => {
        // Arrange
        const editProjectLinkMock = jest.fn<
          void,
          [number, 'code' | 'demo', 'link' | 'text', string]
        >();
        const functions = cloneDeep({
          ...FUNCTIONS,
          editProjectLink: editProjectLinkMock,
        });

        render(<Projects {...getProps({ functions })} />);
        const user = userEvent.setup();

        const input = screen.getByRole('textbox', {
          name: 'Code (text)',
        });
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(editProjectLinkMock).toHaveBeenCalledTimes(1);
        const { code } = DATA.projects[DATA.shownProjectIndex];
        expect(editProjectLinkMock).toHaveBeenCalledWith(
          DATA.shownProjectIndex,
          'code',
          'text',
          `${code.text}s`,
        );
      });

      it('should call `editProjectText(projectIndex, field, value)` when a text field of a project is changed via the corresponding text input', async () => {
        // Arrange
        const editProjectTextMock = jest.fn<
          void,
          [number, 'projectName' | 'stack', string]
        >();
        const functions = cloneDeep({
          ...FUNCTIONS,
          editProjectText: editProjectTextMock,
        });

        render(<Projects {...getProps({ functions })} />);
        const user = userEvent.setup();

        const input = screen.getByRole('textbox', {
          name: 'Project Name',
        });
        input.focus();

        // Act
        await user.keyboard('s');

        // Assert
        expect(editProjectTextMock).toHaveBeenCalledTimes(1);
        const { projectName } = DATA.projects[DATA.shownProjectIndex];
        expect(editProjectTextMock).toHaveBeenCalledWith(
          DATA.shownProjectIndex,
          'projectName',
          `${projectName}s`,
        );
      });

      it('should call `updateScreenReaderAnnouncement` when an important change is made to the project via its controls or text inputs', async () => {
        // Arrange
        const updateScreenReaderAnnouncementMock = jest.fn<void, [string]>();
        const props = getProps({
          updateScreenReaderAnnouncement: updateScreenReaderAnnouncementMock,
        });
        render(<Projects {...props} />);
        const user = userEvent.setup();
        const deleteBtn = screen.getByRole('button', {
          name: 'Delete bullet point 1',
        });

        // Act
        await user.click(deleteBtn);

        // Assert
        expect(updateScreenReaderAnnouncementMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('should pass the section element to `ref.current`', () => {
    // Arrange
    const ref = { current: null };

    // Act
    render(<Projects {...getProps({ ref })} />);
    const projects = screen.getByRole('tabpanel');

    // Assert
    expect(ref.current).toBe(projects);
  });
});
