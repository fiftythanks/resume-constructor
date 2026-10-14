import { render, renderHook } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import useLastComponentBeforeTabpanel from './useLastComponentBeforeTabpanel';

import type { SectionId } from '@/types/resumeData';

// The hook must not only cache the last component but handle the corresponding keyboard navigation as well, because otherwise a lot of boilerplate will be duplicated across all the tabpanels.

describe('useLastComponentBeforeTabpanel', () => {
  describe('handleKeyboard', () => {
    it('should not interrupt the default behaviour of Shift + Tab if the last component is of the relevant type, but its ID does not match the passed to the hook ID', async () => {
      // ARRANGE
      const { result } = await renderHook(() =>
        useLastComponentBeforeTabpanel('personal'),
      );

      const user = userEvent.setup();

      const screen = await render(
        <>
          <button
            aria-label="Irrelevant Button"
            id="irrelevant-button"
            type="button"
          />
          <input
            type="text"
            onFocus={(e) =>
              result.current.captureLastComponentBeforeTabpanel(e)
            }
            onKeyDown={(e) =>
              result.current.focusLastComponentBeforeTabpanel(e)
            }
          />
          <button aria-label="Relevant Button" id="preview" type="button" />
        </>,
      );

      // ACT
      // Focus the irrelevant button.
      await user.tab();

      // Focus the input field.
      await user.tab();

      // Focus the Preview button.
      await user.tab();

      // Focus the input field again.
      await user.tab({ shift: true });

      await user.tab({ shift: true });

      // ASSERT
      const irrelevantBtn = screen.getByRole('button', {
        name: 'Irrelevant Button',
      });

      await expect.element(irrelevantBtn).toHaveFocus();
    });

    it('should focus the last component on Shift + Tab press if the last component is a button with the passed to the hook ID', async () => {
      // ARRANGE
      const id: SectionId = 'personal';
      const { result } = await renderHook(() =>
        useLastComponentBeforeTabpanel(id),
      );
      const user = userEvent.setup();

      const screen = await render(
        <>
          <button id="irrelevant-button" type="button" />
          <input
            type="text"
            onFocus={(e) =>
              result.current.captureLastComponentBeforeTabpanel(e)
            }
            onKeyDown={(e) =>
              result.current.focusLastComponentBeforeTabpanel(e)
            }
          />
          <button aria-label="Relevant Button" id={id} type="button" />
        </>,
      );

      // ACT
      // Focus the irrelevant button.
      await user.tab();

      // Focus the input field.
      await user.tab();

      // Focus the Preview button.
      await user.tab();

      // Focus the input field again.
      await user.tab({ shift: true });

      await user.tab({ shift: true });

      // ASSERT
      const lastComponent = screen.getByRole('button', {
        name: 'Relevant Button',
      });

      await expect.element(lastComponent).toHaveFocus();
    });

    it('should not interrupt the default behaviour of Shift + Tab if the last component is not of the relevant type', async () => {
      // ARRANGE
      const { result } = await renderHook(() =>
        useLastComponentBeforeTabpanel('personal'),
      );

      const screen = await render(
        <>
          <button id="preview" type="button" />
          <button
            aria-label="Irrelevant Button"
            id="some-irrelevant-id"
            type="button"
          />
          <input
            type="text"
            onFocus={(e) =>
              result.current.captureLastComponentBeforeTabpanel(e)
            }
            onKeyDown={(e) =>
              result.current.focusLastComponentBeforeTabpanel(e)
            }
          />
        </>,
      );

      const user = userEvent.setup();

      // ACT
      // Focus the Preview button.
      await user.tab();

      // Focus the irrelevant button
      await user.tab();

      // Focus the input field.
      await user.tab();

      await user.tab({ shift: true });

      // ASSERT
      const irrelevantBtn = screen.getByRole('button', {
        name: 'Irrelevant Button',
      });

      await expect.element(irrelevantBtn).toHaveFocus();
    });
  });
});
