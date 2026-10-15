import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

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

const ACTIVE_SECTION_IDS: SectionId[] = [
  'personal',
  'links',
  'education',
  'experience',
];

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
});
