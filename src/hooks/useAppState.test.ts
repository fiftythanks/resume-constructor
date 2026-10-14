import { renderHook } from 'vitest-browser-react';

import possibleSectionIds from '@/utils/possibleSectionIds';

import useAppState from './useAppState';

import type { SectionId } from '@/types/resumeData';
import type { RenderHookResult } from 'vitest-browser-react';

// TODO: refactor it entirely. It's too hard to read.

// Whenever you change which sections are undeletable, update this array.
const undeletableSectionIds = ['personal'];

function getFirstInactiveSectionId(activeSectionIds: SectionId[]) {
  for (const sectionId of possibleSectionIds) {
    if (!activeSectionIds.includes(sectionId)) {
      return sectionId;
    }
  }

  return;
}

function getFirstDeletableSectionId(activeSectionIds: SectionId[]) {
  for (const sectionId of activeSectionIds) {
    if (!undeletableSectionIds.includes(sectionId)) {
      return sectionId;
    }
  }

  return;
}

// Returns values reused many times in the following tests
async function init() {
  const { act, result } = await renderHook(() => useAppState());

  const getDeletableSectionId = () =>
    getFirstDeletableSectionId(result.current.activeSectionIds);

  const getInactiveSectionId = () =>
    getFirstInactiveSectionId(result.current.activeSectionIds);

  return {
    act,
    getDeletableSectionId,
    getInactiveSectionId,
    result,
  };
}

describe('useAppState', () => {
  describe('screenReaderAnnouncement', () => {
    let act: RenderHookResult<ReturnType<typeof useAppState>, unknown>['act'];
    let result: { current: ReturnType<typeof useAppState> };

    beforeEach(async () => {
      ({ act, result } = await renderHook(() => useAppState()));
    });

    it('should be updated with updateScreenReaderAnnouncement', async () => {
      await act(() => {
        result.current.updateScreenReaderAnnouncement(
          'New screen reader announcement',
        );
      });

      expect(result.current.screenReaderAnnouncement).toBe(
        'New screen reader announcement',
      );
    });

    it('should be reset with resetScreenReaderAnnouncement', async () => {
      await act(() => {
        result.current.updateScreenReaderAnnouncement(
          'Some screen reader announcement',
        );

        result.current.resetScreenReaderAnnouncement();
      });

      expect(result.current.screenReaderAnnouncement).toBe('');
    });
  });

  describe('addSections, deleteSections, deleteAll', () => {
    let act: RenderHookResult<ReturnType<typeof useAppState>, unknown>['act'];
    let getDeletableSectionId: () => SectionId | undefined;
    let getInactiveSectionId: () => SectionId | undefined;
    let result: { current: ReturnType<typeof useAppState> };

    describe('addSections', () => {
      let sectionIdToAdd: SectionId;

      beforeEach(async () => {
        ({ act, getDeletableSectionId, getInactiveSectionId, result } =
          await init());

        const inactiveSectionId = getInactiveSectionId();

        if (inactiveSectionId !== undefined) {
          sectionIdToAdd = inactiveSectionId;
        } else {
          /**
           * Since all sections are active and all sections can't be
           * undeletable, `sectionIdToAdd` is definitely defined.
           */
          sectionIdToAdd = getDeletableSectionId()!;

          await act(() => {
            result.current.deleteSections([sectionIdToAdd]);
            result.current.resetScreenReaderAnnouncement();
          });
        }
      });

      it('should add IDs to activeSectionIds', async () => {
        await act(() => {
          result.current.addSections([sectionIdToAdd]);
        });

        expect(result.current.activeSectionIds).toContain(sectionIdToAdd);
      });

      it('should be announced to screen readers', async () => {
        await act(() => {
          result.current.resetScreenReaderAnnouncement();
          result.current.addSections([sectionIdToAdd]);
        });

        expect(result.current.screenReaderAnnouncement).not.toBe('');
      });
    });

    describe('deleteSections', () => {
      let sectionIdToDelete: SectionId;

      beforeEach(async () => {
        ({ act, getDeletableSectionId, getInactiveSectionId, result } =
          await init());

        const deletableSectionId = getDeletableSectionId();

        if (deletableSectionId !== undefined) {
          sectionIdToDelete = deletableSectionId;
        } else {
          /**
           * Since not all sections are active, `sectionIdToDelete` is
           * definitely defined.
           */
          sectionIdToDelete = getInactiveSectionId()!;

          await act(() => {
            result.current.addSections([sectionIdToDelete]);
            result.current.resetScreenReaderAnnouncement();
          });
        }
      });

      it('should delete IDs from activeSectionIds', async () => {
        await act(() => {
          result.current.deleteSections([sectionIdToDelete]);
        });

        expect(result.current.activeSectionIds).not.toContain(
          sectionIdToDelete,
        );
      });

      it('should be announced to screen readers', async () => {
        await act(() => {
          result.current.resetScreenReaderAnnouncement();
          result.current.deleteSections([sectionIdToDelete]);
        });

        expect(result.current.screenReaderAnnouncement).not.toBe('');
      });
    });

    describe('deleteAll', () => {
      beforeEach(async () => {
        ({ act, getInactiveSectionId, result } = await init());

        if (getInactiveSectionId() !== undefined) {
          const activeSectionIds = new Set(result.current.activeSectionIds);

          const sectionIdsToAdd = possibleSectionIds.filter(
            (sectionId) => !activeSectionIds.has(sectionId),
          );

          await act(() => {
            result.current.addSections(sectionIdsToAdd);
          });
        }

        await act(() => {
          result.current.deleteAll();
        });
      });

      it('should delete all sections', () => {
        expect(result.current.activeSectionIds).toEqual(undeletableSectionIds);
      });

      it('should announce itself to screen readers', () => {
        expect(result.current.screenReaderAnnouncement).not.toBe('');
      });
    });
  });

  describe('addAllSections', () => {
    it('should add all sections that are inactive', async () => {
      const { act, result } = await renderHook(() => useAppState());
      expect(result.current.activeSectionIds).toHaveLength(1);

      await act(() => {
        result.current.addAllSections();
      });

      expect(result.current.activeSectionIds).toEqual(possibleSectionIds);
    });
  });

  describe('openSection', () => {
    let act: RenderHookResult<ReturnType<typeof useAppState>, unknown>['act'];
    let getInactiveSectionId: () => SectionId | undefined;
    let result: { current: ReturnType<typeof useAppState> };

    beforeEach(async () => {
      ({ act, getInactiveSectionId, result } = await init());

      // To make sure there's a section to open.
      if (result.current.activeSectionIds.length < 2) {
        while (result.current.activeSectionIds.length < 2) {
          const inactiveSectionId = getInactiveSectionId();

          await act(() => {
            /**
             * It's sure to be defined because there's always more possible
             * sections than two and less than two are active at this moment.
             */
            result.current.addSections([inactiveSectionId!]);
          });
        }
      }
    });

    it('should open sections', async () => {
      let openedSectionId: SectionId | undefined;

      for (const sectionId of result.current.activeSectionIds) {
        if (sectionId !== result.current.openedSectionId) {
          openedSectionId = sectionId;

          await act(() => {
            result.current.openSection(sectionId);
          });

          break;
        }
      }

      expect(openedSectionId).toBe(result.current.openedSectionId);
    });

    it('should announce itself to screen readers', async () => {
      await act(() => {
        result.current.resetScreenReaderAnnouncement();
      });

      for (const sectionId of result.current.activeSectionIds) {
        if (sectionId !== result.current.openedSectionId) {
          await act(() => {
            result.current.openSection(sectionId);
          });

          break;
        }
      }

      expect(result.current.screenReaderAnnouncement).not.toBe('');
    });
  });

  describe('toggleEditorMode', () => {
    let act: RenderHookResult<ReturnType<typeof useAppState>, unknown>['act'];
    let result: { current: ReturnType<typeof useAppState> };

    beforeEach(async () => {
      ({ act, result } = await renderHook(() => useAppState()));
    });

    it('should toggle editor mode on/off', async () => {
      const initialEditorMode = result.current.editorMode;

      await act(() => {
        result.current.toggleEditorMode();
      });

      expect(result.current.editorMode).toBe(!initialEditorMode);

      await act(() => {
        result.current.toggleEditorMode();
      });

      expect(result.current.editorMode).toBe(initialEditorMode);
    });

    it('should announce itself to screen readers', async () => {
      await act(() => {
        result.current.toggleEditorMode();
      });

      expect(result.current.screenReaderAnnouncement).not.toBe('');
    });
  });

  describe('reorderSections', () => {
    it('should reorder sections', async () => {
      const { act, getInactiveSectionId, result } = await init();

      // If there's less than two sections that can be reordered.
      if (
        result.current.activeSectionIds.length <
        undeletableSectionIds.length + 2
      ) {
        while (
          result.current.activeSectionIds.length <
          undeletableSectionIds.length + 2
        ) {
          const sectionIdToAdd = getInactiveSectionId();

          await act(() => {
            result.current.addSections([sectionIdToAdd!]);
          });
        }
      }

      const lastSectionId: SectionId = result.current.activeSectionIds.at(-1)!;
      const secondToLastSectionId: SectionId =
        result.current.activeSectionIds.at(-2)!;

      const newActiveSectionIds = [...result.current.activeSectionIds];

      [
        newActiveSectionIds[newActiveSectionIds.length - 2],
        newActiveSectionIds[newActiveSectionIds.length - 1],
      ] = [lastSectionId, secondToLastSectionId];

      await act(() => {
        result.current.reorderSections(newActiveSectionIds);
      });

      expect(result.current.activeSectionIds).toEqual(newActiveSectionIds);
    });
  });
});
