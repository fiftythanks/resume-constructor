import React, { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { clsx } from 'clsx';
import { tabbable } from 'tabbable';

import useAppState from '@/hooks/useAppState';

import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import Toolbar from '@/components/Toolbar';

import './AppLayout.scss';

import type {
  ResumeData,
  SectionId,
  SectionIds,
  SectionTitles,
} from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

interface AppLayoutProps {
  activeSectionIds: SectionId[];
  addSections: ReturnType<typeof useAppState>['addSections'];
  children: ReactNode;
  data: ResumeData;
  deleteAll: () => void;
  deleteSections: ReturnType<typeof useAppState>['deleteSections'];
  editorMode: boolean;
  fillAll: () => void;
  isNavbarExpanded: boolean;
  openedSectionId: SectionId;
  openSection: ReturnType<typeof useAppState>['openSection'];
  possibleSectionIds: SectionIds;
  reorderSections: ReturnType<typeof useAppState>['reorderSections'];
  resetScreenReaderAnnouncement: () => void;
  sectionTitles: SectionTitles;
  toggleEditorMode: () => void;
  toggleNavbar: () => void;
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
  isNavbarExpanded,
  openedSectionId,
  openSection,
  possibleSectionIds,
  reorderSections,
  resetScreenReaderAnnouncement,
  sectionTitles,
  toggleEditorMode,
  toggleNavbar,
}: ReadonlyDeep<AppLayoutProps>) {
  // For keyboard navigation.
  // TODO: add an explanatory comment.
  // TODO: rename it. It's not about toolbar, it's about the "Toggle Control Buttons" button and the control buttons themselves.
  const wasToolbarLastFocusedElement = useRef(false);

  const canAddSections = activeSectionIds.length < possibleSectionIds.length;
  const openedSectionIndex = activeSectionIds.indexOf(openedSectionId);

  // TODO: use conditional rendering.
  let navbarModifier = 'AppLayout_navbar_';
  navbarModifier += isNavbarExpanded ? 'expanded' : 'hidden';

  const mainClassName = clsx([
    'AppLayout-Main',
    isNavbarExpanded && 'AppLayout-Main_navbar_expanded',
  ]);

  // Keyboard navigation.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;

    const id = target.id;

    function isSectionId(str: string): str is SectionId {
      return possibleSectionIds.includes(str as SectionId);
    }

    const controlsRelatedBtns = new Set([
      'delete-all',
      'fill-all',
      'preview',
      'toggle-controls',
    ]);

    // TODO: use refs!
    const tabpanelId = `${openedSectionId}-tabpanel`;
    const tabpanel = document.getElementById(tabpanelId)!;
    const tabbableElements = tabbable(tabpanel);
    const firstTabbableElement = tabbableElements[0];

    // TODO: extract some branches to functions to make the logic more readable.
    if (e.key === 'Tab') {
      if (isSectionId(id)) {
        if (id === openedSectionId) {
          if (e.shiftKey) {
            e.preventDefault();

            // TODO: use refs!
            document.getElementById('toggle-navbar')!.focus();
          } else if (!editorMode) {
            e.preventDefault();
            firstTabbableElement.focus();

            wasToolbarLastFocusedElement.current = false;
          }
        } else if (e.shiftKey && !editorMode) {
          e.preventDefault();

          const focusedTabIndex = activeSectionIds.indexOf(id);
          const selectedTabIndex = activeSectionIds.indexOf(openedSectionId);

          /**
           * The focused tab is higher than the selected tab (the tab
           * corresponding to the opened section in the navbar).
           */
          const isHigher = focusedTabIndex < selectedTabIndex;

          if (isHigher) {
            // TODO: use refs!
            document.getElementById('toggle-navbar')!.focus();
          } else {
            // TODO: use refs!
            document.getElementById(openedSectionId)!.focus();
          }
        }
      } else if (id === 'edit-sections') {
        e.preventDefault();

        if (e.shiftKey) {
          if (canAddSections) {
            // TODO: use refs!
            document.getElementById('add-sections')!.focus();
          } else if (editorMode) {
            // TODO: use refs!
            document
              .getElementById(`delete-${activeSectionIds.at(-1)}`)!
              .focus();
          } else {
            // TODO: use refs!
            document.getElementById(openedSectionId)!.focus();
          }
        } else {
          // TODO: use refs!
          document.getElementById('toggle-controls')!.focus();
        }
      } else if (id === 'toggle-navbar') {
        if (isNavbarExpanded && !e.shiftKey) {
          e.preventDefault();

          if (editorMode) {
            // TODO: use refs!
            document.getElementById('personal')!.focus();
          } else {
            // TODO: use refs!
            document.getElementById(openedSectionId)!.focus();
          }
        }
      } else if (controlsRelatedBtns.has(id)) {
        if (!e.shiftKey) {
          e.preventDefault();
          firstTabbableElement.focus();

          wasToolbarLastFocusedElement.current = true;
        }
      } else if (
        e.target === firstTabbableElement &&
        e.shiftKey &&
        isNavbarExpanded &&
        !wasToolbarLastFocusedElement.current
      ) {
        e.preventDefault();

        // TODO: use refs!
        document.getElementById(openedSectionId)!.focus();
      }
    } else if (e.key === 'Escape') {
      const deleteSectionBtns = possibleSectionIds.map(
        (sectionId) => `delete-${sectionId}`,
      );

      const navbarChildrenIds = new Set([
        'add-sections',
        'edit-sections',
        ...deleteSectionBtns,
        ...possibleSectionIds,
      ]);

      if (navbarChildrenIds.has(id)) {
        if (editorMode) {
          toggleEditorMode();

          if (/^delete-/.test(id)) {
            const sectionId = id.replace('delete-', '');
            document.getElementById(sectionId)!.focus();
          }
        } else {
          toggleNavbar();
          document.getElementById('toggle-navbar')!.focus();
        }
      }
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={`AppLayout ${navbarModifier}`} onKeyDown={handleKeyDown}>
      <Navbar
        activeSectionIds={activeSectionIds}
        addSections={addSections}
        canAddSections={canAddSections}
        className="AppLayout-Navbar"
        deleteSections={deleteSections}
        editorMode={editorMode}
        isExpanded={isNavbarExpanded}
        possibleSectionIds={possibleSectionIds}
        reorderSections={reorderSections}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
        sectionTitles={sectionTitles}
        selectedSectionId={openedSectionId}
        selectSection={openSection}
        toggleEditorMode={toggleEditorMode}
      />
      <Toolbar
        activeSectionIds={activeSectionIds}
        className="AppLayout-Toolbar"
        data={data}
        deleteAll={deleteAll}
        fillAll={fillAll}
        isNavbarExpanded={isNavbarExpanded}
        possibleSectionIds={possibleSectionIds}
        toggleNavbar={toggleNavbar}
      />
      {/* This heading is here intentionally for layout purposes. */}
      <h1 className="AppLayout-Title" id="app-layout-heading">
        {sectionTitles[openedSectionId]}
      </h1>
      <main
        aria-owns={`app-layout-heading ${openedSectionId}-tabpanel`}
        className={mainClassName}
        tabIndex={-1}
      >
        {children}
        <div className="AppLayout-NavBtns">
          {openedSectionIndex > 0 && (
            <Button
              aria-label="Open Previous Section"
              className="AppLayout-NavBtn"
              id="previous-section"
              modifiers={['Button_width_medium']}
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
                modifiers={['Button_width_medium']}
                onClick={() =>
                  openSection(activeSectionIds[openedSectionIndex + 1])
                }
              >
                Next
              </Button>
            )}
        </div>
      </main>
    </div>
  );
}
