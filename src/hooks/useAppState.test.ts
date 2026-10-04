import { act, renderHook } from '@testing-library/react';

import possibleSectionIds from '@/utils/possibleSectionIds';

import useAppState from './useAppState';

import type { SectionId } from '@/types/resumeData';

describe('useAppState', () => {
  it('should initialize with default state', () => {
    // Arrange & Act
    const { result } = renderHook(() => useAppState());

    // Assert
    expect(result.current.activeSectionIds).toEqual(['personal']);
    expect(result.current.openedSectionId).toBe('personal');
    expect(result.current.editorMode).toBe(false);
    expect(result.current.screenReaderAnnouncement).toBe('');
  });

  describe('screenReaderAnnouncement', () => {
    it('should be updated with updateScreenReaderAnnouncement', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());

      // Act
      act(() => {
        result.current.updateScreenReaderAnnouncement(
          'New screen reader announcement',
        );
      });

      // Assert
      expect(result.current.screenReaderAnnouncement).toBe(
        'New screen reader announcement',
      );
    });

    it('should be reset with resetScreenReaderAnnouncement', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.updateScreenReaderAnnouncement(
          'Some screen reader announcement',
        );
      });

      // Act
      act(() => {
        result.current.resetScreenReaderAnnouncement();
      });

      // Assert
      expect(result.current.screenReaderAnnouncement).toBe('');
    });
  });

  describe('addSections', () => {
    it('should add new section IDs to activeSectionIds', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());

      // Act
      act(() => {
        result.current.addSections(['education', 'skills']);
      });

      // Assert
      expect(result.current.activeSectionIds).toEqual([
        'personal',
        'education',
        'skills',
      ]);
    });

    it('should announce added sections to screen readers', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());

      // Act
      act(() => {
        result.current.addSections(['education']);
      });

      // Assert
      expect(result.current.screenReaderAnnouncement).toBe(
        'Section Education was added.',
      );
    });
  });

  describe('deleteSections', () => {
    it('should delete specified section IDs from activeSectionIds', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.addSections(['education', 'skills']);
      });

      // Act
      act(() => {
        result.current.deleteSections(['education']);
      });

      // Assert
      expect(result.current.activeSectionIds).toEqual(['personal', 'skills']);
    });

    it('should announce deleted sections to screen readers', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.addSections(['education']);
        result.current.resetScreenReaderAnnouncement();
      });

      // Act
      act(() => {
        result.current.deleteSections(['education']);
      });

      // Assert
      expect(result.current.screenReaderAnnouncement).toBe(
        'Section Education was deleted.',
      );
    });
  });

  describe('deleteAll', () => {
    it('should delete all deletable sections leaving only undeletable sections', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.addAllSections();
      });

      // Act
      act(() => {
        result.current.deleteAll();
      });

      // Assert
      expect(result.current.activeSectionIds).toEqual(['personal']);
    });

    it('should announce section deletions to screen readers when deleteAll is called', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.addAllSections();
        result.current.resetScreenReaderAnnouncement();
      });

      // Act
      act(() => {
        result.current.deleteAll();
      });

      // Assert
      expect(result.current.screenReaderAnnouncement).not.toBe('');
    });
  });

  describe('addAllSections', () => {
    it('should add all sections that are inactive', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());

      // Act
      act(() => {
        result.current.addAllSections();
      });

      // Assert
      expect(result.current.activeSectionIds).toEqual(possibleSectionIds);
    });
  });

  describe('openSection', () => {
    it('should open sections', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.addSections(['education']);
      });

      // Act
      act(() => {
        result.current.openSection('education');
      });

      // Assert
      expect(result.current.openedSectionId).toBe('education');
    });

    it('should announce opened section to screen readers', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.addSections(['education']);
        result.current.resetScreenReaderAnnouncement();
      });

      // Act
      act(() => {
        result.current.openSection('education');
      });

      // Assert
      expect(result.current.screenReaderAnnouncement).toBe(
        'Section Education was opened.',
      );
    });
  });

  describe('toggleEditorMode', () => {
    it('should toggle editor mode on and off', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());
      expect(result.current.editorMode).toBe(false);

      // Act
      act(() => {
        result.current.toggleEditorMode();
      });

      // Assert
      expect(result.current.editorMode).toBe(true);

      // Act
      act(() => {
        result.current.toggleEditorMode();
      });

      // Assert
      expect(result.current.editorMode).toBe(false);
    });

    it('should announce editor mode change to screen readers', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());

      // Act
      act(() => {
        result.current.toggleEditorMode();
      });

      // Assert
      expect(result.current.screenReaderAnnouncement).not.toBe('');
    });
  });

  describe('reorderSections', () => {
    it('should reorder sections', () => {
      // Arrange
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.addSections(['education', 'skills']);
      });
      const reorderedOrder: SectionId[] = ['skills', 'personal', 'education'];

      // Act
      act(() => {
        result.current.reorderSections(reorderedOrder);
      });

      // Assert
      expect(result.current.activeSectionIds).toEqual(reorderedOrder);
    });
  });
});
