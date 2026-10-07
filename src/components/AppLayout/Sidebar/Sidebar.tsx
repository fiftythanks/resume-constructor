import { KeyboardEvent, useRef, useState } from 'react';

import { clsx } from 'clsx';

import useAppState from '@/hooks/useAppState';

import AppbarIconButton from '@/components/AppbarIconButton';

import possibleSectionIds from '@/utils/possibleSectionIds';

import Navbar from './Navbar';
import Toolbar from './Toolbar';

import chevronLeftSrc from '@/assets/icons/chevron-double-left.svg';
import chevronRightSrc from '@/assets/icons/chevron-double-right.svg';
import kebabSrc from '@/assets/icons/kebab.svg';

import type { ResumeData, SectionId } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

import './Sidebar.scss';

type UseAppStateReturn = ReturnType<typeof useAppState>;

interface SidebarProps {
  activeSectionIds: ReadonlyDeep<SectionId[]>;
  addSections: ReadonlyDeep<UseAppStateReturn['addSections']>;
  canAddSections: boolean;
  className?: string;
  data: ReadonlyDeep<ResumeData>;
  deleteAll: ReadonlyDeep<() => void>;
  deleteSections: ReadonlyDeep<UseAppStateReturn['deleteSections']>;
  editorMode: boolean;
  fillAll: ReadonlyDeep<() => void>;
  isNavbarExpanded: boolean;
  reorderSections: ReadonlyDeep<UseAppStateReturn['reorderSections']>;
  resetScreenReaderAnnouncement: ReadonlyDeep<() => void>;
  selectedSectionId: SectionId;
  selectSection: ReadonlyDeep<(sectionId: SectionId) => void>;
  toggleEditorMode: ReadonlyDeep<() => void>;
  toggleNavbar: ReadonlyDeep<() => void>;
}

/**
 * Container for `Navbar` and `Toolbar` inside `AppLayout`.
 * Separated into two parts (vertical and horizontal) on small screens,
 * but becomes a continuous vertical bar on medium to large screens.
 */
export default function Sidebar({
  activeSectionIds,
  addSections,
  canAddSections,
  className,
  data,
  deleteAll,
  deleteSections,
  editorMode,
  fillAll,
  isNavbarExpanded,
  reorderSections,
  resetScreenReaderAnnouncement,
  selectedSectionId,
  selectSection,
  toggleEditorMode,
  toggleNavbar,
}: SidebarProps) {
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);

  const navbarToggle = useRef<HTMLButtonElement>(null);
  const toolbarToggle = useRef<HTMLButtonElement>(null);

  const sidebarClassName = clsx('Sidebar', className);

  const navbarClassName = clsx('Sidebar-Item', 'Sidebar-Item_navbar');

  const toolbarClassName = clsx(
    'Sidebar-Item',
    'Sidebar-Item_toolbar',
    !isToolbarExpanded && 'Sidebar-Item_hidden',
  );

  function handleKeyUp(e: KeyboardEvent) {
    type RelevantId = 'add-sections' | 'edit-sections' | SectionId;

    function isRelevantId(id: string): id is RelevantId {
      return (
        possibleSectionIds.includes(id as SectionId) ||
        id === 'add-sections' ||
        id === 'edit-sections'
      );
    }

    if (e.key !== 'Escape') {
      if (
        !editorMode &&
        e.target instanceof HTMLButtonElement &&
        isRelevantId(e.target.id)
      ) {
        toggleNavbar();
        // TODO: Verify `navbarToggle.current.isConnected` before calling `.focus()` instead of asserting non-null `!`.
        navbarToggle.current!.focus();
      }
    }
  }

  return (
    <aside className={sidebarClassName}>
      {/* DILEMMA: Why doesn't it have `aria-haspopup` like the "toggle-controls" button? */}
      <AppbarIconButton
        largeIcon
        aria-controls="navbar"
        aria-expanded={isNavbarExpanded}
        aria-label="Navigation"
        className="Sidebar-Item Sidebar-Item_navbarToggle"
        iconSrc={isNavbarExpanded ? chevronLeftSrc : chevronRightSrc}
        id="toggle-navbar"
        onClick={toggleNavbar}
        onKeyUp={handleKeyUp}
      />
      {/* TODO: Add a skip link */}
      <Navbar
        activeSectionIds={activeSectionIds}
        addSections={addSections}
        canAddSections={canAddSections}
        className={navbarClassName}
        deleteSections={deleteSections}
        editorMode={editorMode}
        hidden={!isNavbarExpanded}
        reorderSections={reorderSections}
        resetScreenReaderAnnouncement={resetScreenReaderAnnouncement}
        selectedSectionId={selectedSectionId}
        selectSection={selectSection}
        toggleEditorMode={toggleEditorMode}
      />
      {/**
       * The toggle precedes the toolbar despite being to the right of it
       * because this provides native tabbing fully aligned
       * with what's needed for good keyboard experience
       */}
      {/**
       * TODO: Make the button change its icon depending on its state, just as
       * the navbar toggle button does.
       */}
      <AppbarIconButton
        aria-controls="toolbar"
        aria-expanded={isToolbarExpanded}
        aria-label="Toolbar"
        className="Sidebar-Item Sidebar-Item_toolbarToggle"
        iconSrc={kebabSrc}
        id="toolbar-toggle"
        ref={toolbarToggle}
        onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
      />
      <Toolbar
        activeSectionIds={activeSectionIds}
        className={toolbarClassName}
        data={data}
        deleteAll={deleteAll}
        fillAll={fillAll}
      />
    </aside>
  );
}
