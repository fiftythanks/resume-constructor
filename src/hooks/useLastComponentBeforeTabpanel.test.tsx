import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import useLastComponentBeforeTabpanel from './useLastComponentBeforeTabpanel';

import type { SectionId } from '@/types/resumeData';

interface TestFixtureProps {
  relevantButtonId: string;
  relevantButtonName: string;
  sectionId: SectionId;
}

function TestFixture({
  relevantButtonId,
  relevantButtonName,
  sectionId,
}: TestFixtureProps) {
  const { handleFocus, handleKeyboard } =
    useLastComponentBeforeTabpanel(sectionId);

  return (
    <>
      <button
        aria-label="Irrelevant Button"
        id="irrelevant-button"
        type="button"
      />
      <input
        aria-label="Target Input"
        type="text"
        onFocus={handleFocus}
        onKeyDown={handleKeyboard}
      />
      <button
        aria-label={relevantButtonName}
        id={relevantButtonId}
        type="button"
      />
    </>
  );
}

describe('useLastComponentBeforeTabpanel', () => {
  describe('handleKeyboard', () => {
    it('should not interrupt default Shift + Tab navigation if the last component ID does not match the section ID', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <TestFixture
          relevantButtonId="preview"
          relevantButtonName="Relevant Button"
          sectionId="personal"
        />,
      );

      // Act
      // Focus Irrelevant Button -> Target Input -> Preview -> Target Input
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab({ shift: true });
      // Shift + Tab from Target Input
      await user.tab({ shift: true });

      // Assert
      const irrelevantBtn = screen.getByRole('button', {
        name: 'Irrelevant Button',
      });
      expect(irrelevantBtn).toHaveFocus();
    });

    it('should focus the last component on Shift + Tab if the last component matches the section ID', async () => {
      // Arrange
      const user = userEvent.setup();
      const sectionId: SectionId = 'personal';
      render(
        <TestFixture
          relevantButtonId={sectionId}
          relevantButtonName="Personal Tab Button"
          sectionId={sectionId}
        />,
      );

      // Act
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab({ shift: true });
      await user.tab({ shift: true });

      // Assert
      const matchingBtn = screen.getByRole('button', {
        name: 'Personal Tab Button',
      });
      expect(matchingBtn).toHaveFocus();
    });

    it('should not interrupt default Shift + Tab navigation if the last component is not a relevant component type', async () => {
      // Arrange
      function NonRelevantFixture() {
        const { handleFocus, handleKeyboard } =
          useLastComponentBeforeTabpanel('personal');

        return (
          <>
            <button aria-label="Preview Button" id="preview" type="button" />
            <button
              aria-label="Irrelevant Button"
              id="some-irrelevant-id"
              type="button"
            />
            <input
              aria-label="Target Input"
              type="text"
              onFocus={handleFocus}
              onKeyDown={handleKeyboard}
            />
          </>
        );
      }

      const user = userEvent.setup();
      render(<NonRelevantFixture />);

      // Act
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab({ shift: true });

      // Assert
      const irrelevantBtn = screen.getByRole('button', {
        name: 'Irrelevant Button',
      });
      expect(irrelevantBtn).toHaveFocus();
    });
  });
});
