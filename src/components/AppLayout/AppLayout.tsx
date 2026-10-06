import { useEffect, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent, ReactNode } from 'react';

import { clsx } from 'clsx';

import Button from '@/components/Button';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import Sidebar from './Sidebar';

import type { ResumeData, SectionId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

import './AppLayout.scss';

export interface AppLayoutProps {
  activeSectionIds: ReadonlyDeep<SectionId[]>;
  addSections: ReadonlyDeep<(sectionIds: ReadonlyDeep<SectionId[]>) => void>;
  children: ReadonlyDeep<ReactNode>;
  data: ReadonlyDeep<ResumeData>;
  deleteAll: ReadonlyDeep<() => void>;
  deleteSections: ReadonlyDeep<(sectionIds: ReadonlyDeep<SectionId[]>) => void>;
  editorMode: boolean;
  fillAll: ReadonlyDeep<() => void>;
  focusSection: ReadonlyDeep<() => void>;
  openedSectionId: SectionId;
  openSection: ReadonlyDeep<(sectionId: SectionId) => void>;
  reorderSections: ReadonlyDeep<
    (sectionIds: ReadonlyDeep<SectionId[]>) => void
  >;
  resetScreenReaderAnnouncement: ReadonlyDeep<() => void>;
  toggleEditorMode: ReadonlyDeep<() => void>;
}

// TODO: add a JSDoc comment.
export default function AppLayout({
  activeSectionIds,
  addSections,
  children,
  deleteAll,
  data,
  deleteSections,
  editorMode,
  fillAll,
  focusSection,
  openedSectionId,
  openSection,
  reorderSections,
  resetScreenReaderAnnouncement,
  toggleEditorMode,
}: AppLayoutProps) {
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);

  const navBtnsRef = useRef<HTMLDivElement | null>(null);
  const previousBtnRef = useRef<HTMLButtonElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);
  const wasFocusedInsideRef = useRef(false);

  const canAddSections = activeSectionIds.length < possibleSectionIds.length;
  const openedSectionIndex = activeSectionIds.indexOf(openedSectionId);

  /**
   * Tracks pointer interactions outside the navigation buttons container to
   * clear focus retention state when focus is deliberately moved elsewhere.
   */
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !navBtnsRef.current?.contains(e.target)) {
        wasFocusedInsideRef.current = false;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  /**
   * Retains focus on an available navigation button when an active button
   * unmounts during boundary navigation (e.g. navigating to the first section
   * where the "Previous" button disappears or navigating to the final section
   * where the "Next" button disappears).
   */
  useEffect(() => {
    if (!wasFocusedInsideRef.current) {
      return;
    }

    if (!navBtnsRef.current?.isConnected) {
      return;
    }

    const isFocusStillInside = navBtnsRef.current.contains(
      document.activeElement,
    );

    if (!isFocusStillInside) {
      const target = previousBtnRef.current ?? nextBtnRef.current;

      if (target?.isConnected) {
        target.focus();
      } else {
        wasFocusedInsideRef.current = false;
      }
    }
  });

  const handleFocusCapture = () => {
    wasFocusedInsideRef.current = true;
  };

  const handleBlurCapture = (e: FocusEvent<HTMLElement>) => {
    if (
      e.relatedTarget instanceof Node &&
      e.relatedTarget !== document.body &&
      !navBtnsRef.current?.contains(e.relatedTarget)
    ) {
      wasFocusedInsideRef.current = false;
    }
  };

  // Keyboard navigation.
  /**
   * Most of top-level keyboard navigation is achieved via the natural order of
   * nodes in the DOM. And before deciding to do otherwise, all other ways of
   * accomplishing the task in front of you must be considered carefully,
   * because moving focus manually is simply less convenient, more prone to bugs
   * and often signals of poor decisions either being taken or having been taken
   * before.
   */
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const id = target.id;

    if (e.key === 'Tab') {
      if (id === openedSectionId && !editorMode && !e.shiftKey) {
        e.preventDefault();
        focusSection();
      }
    }
  }

  return (
    /**
     * `handleKeyDown` optimises keyboard navigation between the component's
     * children using the event's bubbling, so the rule is wrong here.
     */
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      data-testid="app-layout"
      onKeyDown={handleKeyDown}
      className={clsx(
        'AppLayout',
        'AppLayout_paddingInline_none',
        isNavbarExpanded && 'AppLayout_navbarExpanded',
      )}
    >
      {/* DILEMMA: Add a skip link allowing to jump to the main content? */}
      <Sidebar
        activeSectionIds={activeSectionIds}
        addSections={addSections}
        canAddSections={canAddSections}
        className="AppLayout-Sidebar"
        data={data}
        deleteAll={deleteAll}
        deleteSections={deleteSections}
        editorMode={editorMode}
        fillAll={fillAll}
        isNavbarExpanded={isNavbarExpanded}
        reorderSections={reorderSections}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
        selectedSectionId={openedSectionId}
        selectSection={openSection}
        toggleEditorMode={toggleEditorMode}
        toggleNavbar={() => {
          if (isNavbarExpanded && editorMode) toggleEditorMode();
          setIsNavbarExpanded(!isNavbarExpanded);
        }}
      />
      <main
        tabIndex={-1}
        className={clsx(
          'AppLayout-Main',
          isNavbarExpanded && 'AppLayout-Main_navbarExpanded',
        )}
      >
        <h1 className="AppLayout-Title">{sectionTitles[openedSectionId]}</h1>
        <div className="AppLayout-SectionWrapper">
          {children}
          <div
            className="AppLayout-NavBtns"
            ref={navBtnsRef}
            onBlurCapture={handleBlurCapture}
            onFocusCapture={handleFocusCapture}
          >
            {openedSectionIndex > 0 && (
              <Button
                aria-label="Open Previous Section"
                className="AppLayout-NavBtn"
                id="previous-section"
                key="previous-section"
                modifiers={['Button_size_smallest', 'Button_width_medium']}
                ref={previousBtnRef}
                onClick={() =>
                  openSection(activeSectionIds[openedSectionIndex - 1])
                }
              >
                Previous
              </Button>
            )}
            {activeSectionIds.length > 1 &&
              openedSectionIndex < activeSectionIds.length - 1 && (
                <Button
                  aria-label="Open Next Section"
                  className="AppLayout-NavBtn"
                  id="next-section"
                  key="next-section"
                  modifiers={['Button_size_smallest', 'Button_width_medium']}
                  ref={nextBtnRef}
                  onClick={() =>
                    openSection(activeSectionIds[openedSectionIndex + 1])
                  }
                >
                  Next
                </Button>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}
