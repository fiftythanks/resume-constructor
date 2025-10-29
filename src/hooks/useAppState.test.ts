/* eslint-disable jest/no-identical-title */
import { act, renderHook } from '@testing-library/react';

import neverReached from '@/utils/neverReached';

import useAppState from './useAppState';

import { SectionId, SectionIds } from '@/types/resumeData';

// TODO: refactor it entirely. It's too hard to read.

// Whenever you change which sections are undeletable, update this array.
const undeletableSectionIds = ['personal'];

function getFirstInactiveSectionId(
  activeSectionIds: SectionId[],
  possibleSectionIds: SectionIds,
) {
  let firstInactiveSectionId: SectionId | undefined;

  for (const sectionId of possibleSectionIds) {
    if (!activeSectionIds.includes(sectionId)) {
      firstInactiveSectionId = sectionId;

      break;
    }
  }

  return firstInactiveSectionId;
}

function getFirstDeletableSectionId(activeSectionIds: SectionId[]) {
  let firstDeletableSectionId: SectionId | undefined;

  for (const sectionId of activeSectionIds) {
    if (!undeletableSectionIds.includes(sectionId)) {
      firstDeletableSectionId = sectionId;

      break;
    }
  }

  return firstDeletableSectionId;
}

// Returns values reused many times in the following tests
function init() {
  const { result } = renderHook(() => useAppState());

  const getDeletableSectionId = () =>
    getFirstDeletableSectionId(result.current.activeSectionIds);

  const getInactiveSectionId = () =>
    getFirstInactiveSectionId(
      result.current.activeSectionIds,
      result.current.possibleSectionIds,
    );

  return {
    getDeletableSectionId,
    getInactiveSectionId,
    result,
  };
}

describe('useAppState', () => {
  describe('screenReaderAnnouncement', () => {
    let result: { current: ReturnType<typeof useAppState> };

    beforeEach(() => {
      ({ result } = renderHook(() => useAppState()));
    });

    it('should be updated with updateScreenReaderAnnouncement', async () => {
      await act(async () => {
        result.current.updateScreenReaderAnnouncement(
          'New screen reader announcement',
        );
      });

      expect(result.current.screenReaderAnnouncement).toBe(
        'New screen reader announcement',
      );
    });

    it('should be reset with resetScreenReaderAnnouncement', async () => {
      await act(async () => {
        result.current.updateScreenReaderAnnouncement(
          'Some screen reader announcement',
        );

        result.current.resetScreenReaderAnnouncement();
      });

      expect(result.current.screenReaderAnnouncement).toBe('');
    });
  });

  describe('addSections, deleteSections, deleteAll', () => {
    const areAllSectionsActive = init().getInactiveSectionId() === undefined;
    let getDeletableSectionId: () => SectionId | undefined;
    let getInactiveSectionId: () => SectionId | undefined;
    let result: { current: ReturnType<typeof useAppState> };

    const untestedFunctions: Array<'addSections' | 'deleteSections'> = [
      'addSections',
      'deleteSections',
    ];

    // ? Is there a way to put the tests inside functions and call functions instead of all this terrible boilerplate?
    // If all sections are active by default.
    if (areAllSectionsActive) {
      // Delete 'deleteSections' from the array, since it's about to be tested.
      untestedFunctions.pop();

      describe('deleteSections', () => {
        let sectionIdToDelete: SectionId;

        beforeEach(() => {
          ({ getDeletableSectionId, getInactiveSectionId, result } = init());

          /**
           * There's no way that in case where all sections are active by
           * default there are no deletable sections. It's completely safe to
           * assume that `deletableSectionId` is of type `SectionId`.
           */
          sectionIdToDelete = getDeletableSectionId()!;
        });

        it('should delete IDs from activeSectionIds', async () => {
          await act(async () => {
            result.current.deleteSections([sectionIdToDelete]);
          });

          expect(result.current.activeSectionIds).not.toContain(
            sectionIdToDelete,
          );
        });

        it('should be announced to screen readers', async () => {
          await act(async () => {
            result.current.deleteSections([sectionIdToDelete]);
          });

          expect(result.current.screenReaderAnnouncement).not.toBe('');
        });
      });
    } else {
      untestedFunctions.shift();

      describe('addSections', () => {
        let sectionIdToAdd: SectionId;

        beforeEach(() => {
          ({ getInactiveSectionId, result } = init());

          /**
           * Since some sections are inactive in this branch, it's safe to
           * assume that there is at least one inactive section and
           * `sectionIdToAdd` isn't `undefined`.
           */
          sectionIdToAdd = getInactiveSectionId()!;
        });

        it('should add IDs to activeSectionIds', async () => {
          await act(async () => {
            result.current.addSections([sectionIdToAdd]);
          });

          expect(result.current.activeSectionIds).toContain(sectionIdToAdd);
        });

        it('should be announced to screen readers', async () => {
          await act(async () => {
            result.current.addSections([sectionIdToAdd]);
          });

          expect(result.current.screenReaderAnnouncement).not.toBe('');
        });
      });
    }

    // Then test the function that's left.
    switch (untestedFunctions[0]) {
      // All sections are active.
      case 'addSections': {
        describe('addSections', () => {
          let sectionIdToAdd: SectionId;

          beforeEach(async () => {
            ({ getDeletableSectionId, result } = init());

            /**
             * Since all sections are active and all sections can't be
             * undeletable, `sectionIdToAdd` is definitely defined.
             */
            sectionIdToAdd = getDeletableSectionId()!;

            // We can rely on `deleteSections` because it's already been tested.
            await act(async () => {
              result.current.deleteSections([sectionIdToAdd]);
            });
          });

          it('should add IDs to activeSectionIds', async () => {
            await act(async () => {
              result.current.addSections([sectionIdToAdd]);
            });

            expect(result.current.activeSectionIds).toContain(sectionIdToAdd);
          });

          it('should be announced to screen readers', async () => {
            await act(async () => {
              result.current.resetScreenReaderAnnouncement();
              result.current.addSections([sectionIdToAdd]);
            });

            expect(result.current.screenReaderAnnouncement).not.toBe('');
          });
        });

        break;
      }
      // Not all sections are active by default.
      case 'deleteSections': {
        let sectionIdToDelete: SectionId | undefined;

        describe('deleteSections', () => {
          beforeEach(async () => {
            ({ getDeletableSectionId, getInactiveSectionId, result } = init());

            sectionIdToDelete = getDeletableSectionId();

            if (sectionIdToDelete === undefined) {
              sectionIdToDelete = getInactiveSectionId();

              /**
               * Since sections aren't all active, `sectionIdToDelete` is
               * definitely defined.
               *
               * We can rely on `addSections` because it's already been tested.
               */
              await act(async () => {
                result.current.addSections([sectionIdToDelete!]);
              });
            }
          });

          it('should delete IDs from activeSectionIds', async () => {
            await act(async () => {
              result.current.deleteSections([sectionIdToDelete!]);
            });

            expect(result.current.activeSectionIds).not.toContain(
              sectionIdToDelete,
            );
          });

          it('should be announced to screen readers', async () => {
            await act(async () => {
              result.current.resetScreenReaderAnnouncement();
              result.current.deleteSections([sectionIdToDelete!]);
            });

            expect(result.current.screenReaderAnnouncement).not.toBe('');
          });
        });

        break;
      }
      default:
        neverReached(untestedFunctions[0]);
    }

    describe('deleteAll', () => {
      beforeEach(async () => {
        ({ result } = init());

        if (!areAllSectionsActive) {
          const activeSectionIds = new Set(result.current.activeSectionIds);

          const sectionIdsToAdd = result.current.possibleSectionIds.filter(
            (sectionId) => !activeSectionIds.has(sectionId),
          );

          await act(async () => {
            result.current.addSections(sectionIdsToAdd);
          });
        }

        await act(async () => {
          result.current.deleteAll();
        });
      });

      it('should delete all sections', async () => {
        expect(result.current.activeSectionIds).toEqual(undeletableSectionIds);
      });

      it('should announce itself to screen readers', async () => {
        expect(result.current.screenReaderAnnouncement).not.toBe('');
      });
    });
  });

  describe('openSection', () => {
    let getInactiveSectionId: () => SectionId | undefined;
    let result: { current: ReturnType<typeof useAppState> };

    beforeEach(async () => {
      ({ getInactiveSectionId, result } = init());

      // To make sure there's a section to open.
      if (result.current.activeSectionIds.length < 2) {
        while (result.current.activeSectionIds.length < 2) {
          const inactiveSectionId = getInactiveSectionId();

          await act(async () => {
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

          await act(async () => {
            result.current.openSection(sectionId);
          });

          break;
        }
      }

      expect(openedSectionId).toBe(result.current.openedSectionId);
    });

    it('should announce itself to screen readers', async () => {
      await act(async () => {
        result.current.resetScreenReaderAnnouncement();
      });

      for (const sectionId of result.current.activeSectionIds) {
        if (sectionId !== result.current.openedSectionId) {
          await act(async () => {
            result.current.openSection(sectionId);
          });

          break;
        }
      }

      expect(result.current.screenReaderAnnouncement).not.toBe('');
    });
  });

  describe('toggleEditorMode', () => {
    let result: { current: ReturnType<typeof useAppState> };

    beforeEach(() => {
      ({ result } = renderHook(() => useAppState()));
    });

    it('should toggle editor mode on/off', async () => {
      const initialEditorMode = result.current.editorMode;

      await act(async () => {
        result.current.toggleEditorMode();
      });

      expect(result.current.editorMode).toBe(!initialEditorMode);

      await act(async () => {
        result.current.toggleEditorMode();
      });

      expect(result.current.editorMode).toBe(initialEditorMode);
    });

    it('should announce itself to screen readers', async () => {
      await act(async () => {
        result.current.toggleEditorMode();
      });

      expect(result.current.screenReaderAnnouncement).not.toBe('');
    });
  });

  describe('toggleNavbar', () => {
    let result: { current: ReturnType<typeof useAppState> };

    beforeEach(() => {
      ({ result } = renderHook(() => useAppState()));
    });

    it('should expand/hide navbar', async () => {
      const initialIsNavbarExpanded = result.current.isNavbarExpanded;

      await act(async () => {
        result.current.toggleNavbar();
      });

      expect(result.current.isNavbarExpanded).toBe(!initialIsNavbarExpanded);

      await act(async () => {
        result.current.toggleNavbar();
      });

      expect(result.current.isNavbarExpanded).toBe(initialIsNavbarExpanded);
    });
  });

  describe('reorderSections', () => {
    it('should reorder sections', async () => {
      const { getInactiveSectionId, result } = init();

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

          await act(async () => {
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

      await act(async () => {
        result.current.reorderSections(newActiveSectionIds);
      });

      expect(result.current.activeSectionIds).toEqual(newActiveSectionIds);
    });
  });
});
