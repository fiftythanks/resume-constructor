import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import AddSections from './AddSections';

import type { AddSectionsProps } from './AddSections';
import type { SectionId } from '@/types/resumeData';

/**
 * Since `Popup` is portalled to `popup-root`, there must exist an
 * element with such an ID.
 */
function Container() {
  return <div id="popup-root" />;
}

//! It is important that there are more than two sections to add.
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
    addSections: () => {},
    isShown: true,
    onClose: () => {},
    ...overrides,
  };
}

describe('AddSections', () => {
  it('should render with an accessible name "Add Sections" when `isShown === true`', async () => {
    await render(<Container />);
    await render(<AddSections {...getProps()} />);

    const popup = page.getByRole('dialog', { name: 'Add Sections' });

    await expect.element(popup).toBeInTheDocument();
  });

  it('should not render when `isShown === false`', async () => {
    await render(<Container />);
    await render(<AddSections {...getProps({ isShown: false })} />);

    const popup = page.getByRole('dialog', { name: 'Add Sections' });

    await expect.element(popup).not.toBeInTheDocument();
  });

  it('should close and call `onClose` when Escape is pressed', async () => {
    // Arrange
    const onCloseMock = vi.fn();
    await render(<Container />);
    await render(<AddSections {...getProps({ onClose: onCloseMock })} />);

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    const popup = page.getByRole('dialog', { name: 'Add Sections' });

    await expect.element(popup).not.toBeInTheDocument();
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should render a heading "Add Sections"', async () => {
    await render(<Container />);
    await render(<AddSections {...getProps()} />);

    const heading = page.getByRole('heading', { name: 'Add Sections' });

    await expect.element(heading).toBeInTheDocument();
  });

  describe('add-buttons', () => {
    it('should render add-buttons for all inactive sections', async () => {
      await render(<Container />);
      await render(<AddSections {...getProps()} />);

      const addableSectionIds = getAddableSectionIds();

      for (const sectionId of addableSectionIds) {
        const addBtn = page.getByRole('button', {
          name: `Add ${sectionTitles[sectionId]}`,
        });

        await expect.element(addBtn).toBeInTheDocument();
      }
    });

    it('should render add-buttons only for inactive sections', async () => {
      await render(<Container />);
      await render(<AddSections {...getProps()} />);

      for (const sectionId of ACTIVE_SECTION_IDS) {
        const addBtn = page.getByRole('button', {
          name: `Add ${sectionTitles[sectionId]}`,
        });

        await expect.element(addBtn).not.toBeInTheDocument();
      }
    });

    it('should call `addSections` when an "Add [section title]" button is clicked, with the corresponding ID passed to it', async () => {
      const addSectionsMock = vi.fn((_sectionIds: SectionId[]) => {});
      await render(<Container />);
      await render(
        <AddSections {...getProps({ addSections: addSectionsMock })} />,
      );
      const user = userEvent.setup();
      const addableSectionIds = getAddableSectionIds();
      const sectionToAddId = addableSectionIds[0];

      const btn = page.getByRole('button', {
        name: `Add ${sectionTitles[sectionToAddId]}`,
      });

      await user.click(btn);

      expect(addSectionsMock).toHaveBeenCalledTimes(1);
      expect(addSectionsMock).toHaveBeenCalledWith([sectionToAddId]);
    });

    it("should focus the next section's add-button if the added section isn't the last one", async () => {
      await render(<Container />);
      await render(<AddSections {...getProps()} />);
      const user = userEvent.setup();
      const addableSectionIds = getAddableSectionIds();

      const firstAddBtn = page.getByRole('button', {
        name: `Add ${sectionTitles[addableSectionIds[0]]}`,
      });

      const secondAddBtn = page.getByRole('button', {
        name: `Add ${sectionTitles[addableSectionIds[1]]}`,
      });

      firstAddBtn.element().focus();

      await user.keyboard('{Enter}');

      await expect.element(secondAddBtn).toHaveFocus();
    });

    it("should focus the previous section's add-button if the added section is the last and isn't the only addable section", async () => {
      await render(<Container />);
      await render(<AddSections {...getProps()} />);
      const user = userEvent.setup();
      const addableSectionIds = getAddableSectionIds();

      const lastAddBtn = page.getByRole('button', {
        name: `Add ${sectionTitles[addableSectionIds.at(-1)!]}`,
      });

      const oneBeforeLastAddBtn = page.getByRole('button', {
        name: `Add ${sectionTitles[addableSectionIds.at(-2)!]}`,
      });

      lastAddBtn.element().focus();

      await user.keyboard('{Enter}');

      await expect.element(oneBeforeLastAddBtn).toHaveFocus();
    });

    it('should call `onClose` if the added section is the only addable section', async () => {
      const onCloseMock = vi.fn();
      const activeSectionIds = possibleSectionIds.toSpliced(-1, 1);
      const props = getProps({ activeSectionIds, onClose: onCloseMock });
      await render(<Container />);
      await render(<AddSections {...props} />);
      const user = userEvent.setup();
      const addableSectionId = possibleSectionIds.at(-1)!;
      const addableSectionTitle = sectionTitles[addableSectionId];

      const addBtn = page.getByRole('button', {
        name: `Add ${addableSectionTitle}`,
      });

      addBtn.element().focus();

      await user.keyboard('{Enter}');

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should render an "Add All Sections" button', async () => {
      await render(<Container />);
      await render(<AddSections {...getProps()} />);

      const addAllSectionsBtn = page.getByRole('button', {
        name: 'Add All Sections',
      });

      await expect.element(addAllSectionsBtn).toBeInTheDocument();
    });
  });

  it('should call `onClose` when "Add All Sections" is clicked', async () => {
    const onCloseMock = vi.fn();
    await render(<Container />);
    await render(<AddSections {...getProps({ onClose: onCloseMock })} />);
    const user = userEvent.setup();

    const addAllSectionsBtn = page.getByRole('button', {
      name: 'Add All Sections',
    });

    await user.click(addAllSectionsBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should render a close button', async () => {
    await render(<Container />);
    await render(<AddSections {...getProps()} />);

    const closeBtn = page.getByRole('button', { name: 'Close Popup' });

    await expect.element(closeBtn).toBeInTheDocument();
  });

  it('should call `onClose` when the close button is clicked', async () => {
    const onCloseMock = vi.fn();
    await render(<Container />);
    await render(<AddSections {...getProps({ onClose: onCloseMock })} />);
    const user = userEvent.setup();
    const closeBtn = page.getByRole('button', { name: 'Close Popup' });

    await user.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
