import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import AddSections from './AddSections';

import type { AddSectionsProps } from './AddSections';
import type { SectionId } from '@/types/resumeData';

const ACTIVE_SECTION_IDS: SectionId[] = [
  'personal',
  'links',
  'education',
  'experience',
];

function getAddableSectionIds(): SectionId[] {
  return possibleSectionIds.filter(
    (sectionId) => !ACTIVE_SECTION_IDS.includes(sectionId),
  );
}

function getProps(overrides?: Partial<AddSectionsProps>): AddSectionsProps {
  return {
    activeSectionIds: ACTIVE_SECTION_IDS,
    addSections: jest.fn(),
    isShown: true,
    onClose: jest.fn(),
    ...overrides,
  };
}

describe('AddSections', () => {
  let popupRoot: HTMLDivElement;

  beforeEach(() => {
    popupRoot = document.createElement('div');
    popupRoot.setAttribute('id', 'popup-root');
    document.body.appendChild(popupRoot);
  });

  afterEach(() => {
    popupRoot.remove();
    jest.clearAllMocks();
  });

  it('should render with accessible name "Add Sections" and BEM structure when shown', () => {
    render(<AddSections {...getProps()} />);

    const popup = screen.getByRole('dialog', { name: 'Add Sections' });
    const heading = screen.getByRole('heading', { name: 'Add Sections' });
    const list = screen.getByRole('list');

    expect(popup).toBeInTheDocument();
    expect(popup).toHaveClass('Popup', 'AddSections');
    expect(heading).toHaveClass('Popup-Title', 'AddSections-Title');
    expect(list).toHaveClass('AddSections-List');
  });

  it('should not render when `isShown === false`', () => {
    render(<AddSections {...getProps({ isShown: false })} />);

    const popup = screen.queryByRole('dialog', { name: 'Add Sections' });

    expect(popup).not.toBeInTheDocument();
  });

  it('should call `onClose` on close event', () => {
    const onCloseMock = jest.fn();
    render(<AddSections {...getProps({ onClose: onCloseMock })} />);
    const popup = screen.getByRole('dialog', { name: 'Add Sections' });

    fireEvent(popup, new Event('close'));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  describe('add-buttons', () => {
    it('should render add-buttons for all inactive sections', () => {
      render(<AddSections {...getProps()} />);

      const addableSectionIds = getAddableSectionIds();

      addableSectionIds.forEach((sectionId) => {
        const addBtn = screen.getByRole('button', {
          name: `Add ${sectionTitles[sectionId]}`,
        });

        expect(addBtn).toBeInTheDocument();
      });
    });

    it('should render add-buttons only for inactive sections', () => {
      render(<AddSections {...getProps()} />);

      ACTIVE_SECTION_IDS.forEach((sectionId) => {
        const addBtn = screen.queryByRole('button', {
          name: `Add ${sectionTitles[sectionId]}`,
        });

        expect(addBtn).not.toBeInTheDocument();
      });
    });

    it('should call `addSections` when an add-button is clicked', async () => {
      const addSectionsMock = jest.fn();
      render(<AddSections {...getProps({ addSections: addSectionsMock })} />);
      const user = userEvent.setup();
      const addableSectionIds = getAddableSectionIds();
      const sectionToAddId = addableSectionIds[0];

      const btn = screen.getByRole('button', {
        name: `Add ${sectionTitles[sectionToAddId]}`,
      });

      await user.click(btn);

      expect(addSectionsMock).toHaveBeenCalledTimes(1);
      expect(addSectionsMock).toHaveBeenCalledWith([sectionToAddId]);
    });

    it("should focus the next section's add-button if the added section isn't the last one", async () => {
      render(<AddSections {...getProps()} />);
      const user = userEvent.setup();
      const addableSectionIds = getAddableSectionIds();

      const firstAddBtn = screen.getByRole('button', {
        name: `Add ${sectionTitles[addableSectionIds[0]]}`,
      });

      const secondAddBtn = screen.getByRole('button', {
        name: `Add ${sectionTitles[addableSectionIds[1]]}`,
      });

      firstAddBtn.focus();

      await user.keyboard('{Enter}');

      expect(secondAddBtn).toHaveFocus();
    });

    it("should focus the previous section's add-button if the added section is the last", async () => {
      render(<AddSections {...getProps()} />);
      const user = userEvent.setup();
      const addableSectionIds = getAddableSectionIds();

      const lastAddBtn = screen.getByRole('button', {
        name: `Add ${sectionTitles[addableSectionIds.at(-1)!]}`,
      });

      const oneBeforeLastAddBtn = screen.getByRole('button', {
        name: `Add ${sectionTitles[addableSectionIds.at(-2)!]}`,
      });

      lastAddBtn.focus();

      await user.keyboard('{Enter}');

      expect(oneBeforeLastAddBtn).toHaveFocus();
    });

    it('should call `onClose` if the added section is the only addable section', async () => {
      const onCloseMock = jest.fn();
      const activeSectionIds = possibleSectionIds.toSpliced(-1, 1);
      const props = getProps({ activeSectionIds, onClose: onCloseMock });
      render(<AddSections {...props} />);
      const user = userEvent.setup();
      const addableSectionId = possibleSectionIds.at(-1)!;
      const addableSectionTitle = sectionTitles[addableSectionId];

      const addBtn = screen.getByRole('button', {
        name: `Add ${addableSectionTitle}`,
      });

      addBtn.focus();

      await user.keyboard('{Enter}');

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should render an "Add All Sections" button and trigger addition with closure', async () => {
      const addSectionsMock = jest.fn();
      const onCloseMock = jest.fn();
      render(
        <AddSections
          {...getProps({
            addSections: addSectionsMock,
            onClose: onCloseMock,
          })}
        />,
      );
      const user = userEvent.setup();

      const addAllSectionsBtn = screen.getByRole('button', {
        name: 'Add All Sections',
      });

      expect(addAllSectionsBtn).toBeInTheDocument();

      await user.click(addAllSectionsBtn);

      expect(addSectionsMock).toHaveBeenCalledTimes(1);
      expect(addSectionsMock).toHaveBeenCalledWith([...possibleSectionIds]);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('close button', () => {
    it('should render a close button with BEM classes and call onClose when clicked', async () => {
      const onCloseMock = jest.fn();
      render(<AddSections {...getProps({ onClose: onCloseMock })} />);
      const user = userEvent.setup();

      const closeBtn = screen.getByRole('button', { name: 'Close Popup' });
      const closeIcon = screen.getByAltText('Close Popup');

      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveClass('AddSections-CloseBtn');
      expect(closeIcon).toHaveClass('AddSections-CloseIcon');

      await user.click(closeBtn);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });
});
