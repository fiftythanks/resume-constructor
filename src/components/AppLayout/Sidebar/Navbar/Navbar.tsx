import { RefObject, useMemo, useRef, useState } from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { clsx } from 'clsx';

import useAppState from '@/hooks/useAppState';

import AddSections from '@/components/AddSections';
import AppbarIconButton from '@/components/AppbarIconButton';

import possibleSectionIds from '@/utils/possibleSectionIds';
import sectionTitles from '@/utils/sectionTitles';

import NavbarItem from './NavbarItem';

import addSrc from '@/assets/icons/add.svg';
import doneSrc from '@/assets/icons/done.svg';
import editSrc from '@/assets/icons/edit.svg';
import certificationsSrc from '@/assets/icons/sections/certifications.svg';
import educationSrc from '@/assets/icons/sections/education.svg';
import experienceSrc from '@/assets/icons/sections/experience.svg';
import linksSrc from '@/assets/icons/sections/links.svg';
import personalSrc from '@/assets/icons/sections/personal.svg';
import projectsSrc from '@/assets/icons/sections/projects.svg';
import skillsSrc from '@/assets/icons/sections/skills.svg';

import type { SectionId, SectionIds } from '@/types/resumeData';
import type { ReadonlyDeep, Replace } from 'type-fest';

import './Navbar.scss';

/**
 * The tab shouldn't be draggable in the navbar. You can't put
 * links anywhere but the resume header!
 */
// TODO: make the Links tab not draggable.

const ICONS = {
  add: addSrc,
  certifications: certificationsSrc,
  done: doneSrc,
  edit: editSrc,
  education: educationSrc,
  experience: experienceSrc,
  links: linksSrc,
  personal: personalSrc,
  projects: projectsSrc,
  skills: skillsSrc,
};

type UseAppStateReturn = ReturnType<typeof useAppState>;

export interface NavbarProps {
  activeSectionIds: ReadonlyDeep<SectionId[]>;
  addSections: ReadonlyDeep<UseAppStateReturn['addSections']>;
  canAddSections: boolean;
  className?: string;
  deleteSections: ReadonlyDeep<UseAppStateReturn['deleteSections']>;
  editorMode: boolean;
  hidden?: boolean;
  reorderSections: ReadonlyDeep<UseAppStateReturn['reorderSections']>;
  resetScreenReaderAnnouncement: ReadonlyDeep<() => void>;
  selectedSectionId: SectionId;
  selectSection: ReadonlyDeep<(sectionId: SectionId) => void>;
  toggleEditorMode: ReadonlyDeep<() => void>;
}

/**
 * The main navbar in the application that is used to navigate between, add,
 * delete and rearrange sections.
 */
export default function Navbar({
  activeSectionIds,
  addSections,
  // DILEMMA: What is the purpose of passing such a prop? It's useless. You can figure this out inside `Navbar`, can't you? Or is it for the separation of concerns?
  canAddSections,
  className,
  deleteSections,
  editorMode,
  reorderSections,
  resetScreenReaderAnnouncement,
  selectedSectionId,
  selectSection,
  toggleEditorMode,
  hidden = false,
}: NavbarProps) {
  // For the "Add Sections" popup
  const [isAddSectionsPopupShown, setIsAddSectionsPopupShown] = useState(false);

  const addSectionsBtn = useRef<HTMLButtonElement>(null);
  const editSectionsBtn = useRef<HTMLButtonElement>(null);

  const linksTab = useRef<HTMLButtonElement>(null);
  const skillsTab = useRef<HTMLButtonElement>(null);
  const experienceTab = useRef<HTMLButtonElement>(null);
  const projectsTab = useRef<HTMLButtonElement>(null);
  const educationTab = useRef<HTMLButtonElement>(null);
  const certificationsTab = useRef<HTMLButtonElement>(null);

  const tabRefs: Record<
    Exclude<SectionId, 'personal'>,
    RefObject<HTMLButtonElement | null>
  > = useMemo(
    () => ({
      links: linksTab,
      skills: skillsTab,
      experience: experienceTab,
      projects: projectsTab,
      education: educationTab,
      certifications: certificationsTab,
    }),
    [],
  );

  // Drag and drop hooks
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [isDragging, setIsDragging] = useState(false);

  function showAddSectionsPopup() {
    // Otherwise, the screen reader will announce incorrect things
    resetScreenReaderAnnouncement();

    setIsAddSectionsPopupShown(true);
  }

  function closeAddSectionsPopup() {
    setIsAddSectionsPopupShown(false);

    // TODO: Verify `node.isConnected` and handle unmount edge cases instead of asserting non-null `!` when returning focus.
    if (canAddSections) {
      addSectionsBtn.current!.focus();
    } else {
      type LastSectionId<T = SectionIds> = T extends [...unknown[], infer L]
        ? L
        : never;

      const lastAddedSectionId = activeSectionIds.at(-1) as LastSectionId;
      tabRefs[lastAddedSectionId].current!.focus();
    }
  }

  // Drag and drop logic
  // TODO: add accessible announcements for dragstart, dragover and dragend, like in `BulletPoints`.
  function handleDragStart() {
    setIsDragging(true);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;

    if (over !== null && active.id !== over.id) {
      const oldIndex = activeSectionIds.indexOf(active.id as SectionId);
      const newIndex = activeSectionIds.indexOf(over.id as SectionId);

      const newActiveSectionIds = arrayMove(
        // TODO: no need in spreading the array. `arrayMove` doesn't change the original array.
        [...activeSectionIds],
        oldIndex,
        newIndex,
      );

      reorderSections(newActiveSectionIds);
    }

    setIsDragging(false);
  }

  /**
   * The `personal` item isn't draggable, and has to be added to the DOM
   * separately.
   */
  const draggableSectionIds = activeSectionIds.filter(
    (sectionId) => sectionId !== 'personal',
  );

  function getDeleteSectionFn(sectionId: SectionId) {
    return function deleteSection() {
      deleteSections([sectionId]);

      const i = activeSectionIds.indexOf(sectionId);

      // FIXME: Replace `document.getElementById(...)!.focus()` with React refs and verify `node.isConnected` when deleting sections.
      // If the deleted section is the only deletable section, focus the "Toggle Editor Mode" button.
      if (activeSectionIds.length === 2) {
        document.getElementById('edit-sections')!.focus();

        // If the deleted section isn't the last deletable section, focus the next deletable section's tab.
      } else if (i < activeSectionIds.length - 1) {
        document.getElementById(`delete-${activeSectionIds[i + 1]}`)!.focus();
        // Otherwise, focus the previous deletable section's tab.
      } else {
        document.getElementById(`delete-${activeSectionIds[i - 1]}`)!.focus();
      }
    };
  }

  // TODO: optimise. When a new section gets selected, all tabs are rerendered. This isn't optimal.
  const items = draggableSectionIds.map((sectionId) => {
    const isSelected = selectedSectionId === sectionId;

    // Allows natural tabbing without JS.
    const tabIndex = isSelected || editorMode ? 0 : -1;

    return (
      <NavbarItem
        alt={sectionTitles[sectionId]}
        className="Navbar-NavbarItem Navbar-NavbarItem_draggable"
        iconSrc={ICONS[sectionId]}
        isDraggable={true}
        isEditorMode={editorMode}
        isSelected={isSelected}
        key={sectionId}
        ref={tabRefs[sectionId]}
        sectionId={sectionId}
        sectionTitle={sectionTitles[sectionId]}
        tabIndex={tabIndex}
        title={sectionTitles[sectionId]}
        onDeleteSection={getDeleteSectionFn(sectionId)}
        // DILEMMA: `selectSection` is called even when a section is already selected. Won't it cause an unneccessary rerender?
        onSelectSection={() => selectSection(sectionId)}
      />
    );
  });

  const editorClassName = clsx(
    'Navbar-Control',
    canAddSections && 'Navbar-Control_onTop',
    editorMode && 'Navbar-Control_editing',
  );

  const draggableItemsWrapperClassName = clsx(
    'Navbar-DraggableItemsWrapper',
    activeSectionIds.length === 1 && 'Navbar-DraggableItemsWrapper_hidden',
  );

  // Keyboard navigation
  function isSectionId(string: string): string is SectionId {
    for (const sectionId of possibleSectionIds) {
      if (string === sectionId) return true;
    }

    return false;
  }

  type DeleteSectionBtnId = `delete-${Exclude<SectionId, 'personal'>}`;

  function isDeleteSectionBtnId(string: string): string is DeleteSectionBtnId {
    for (const sectionId of activeSectionIds) {
      if (`delete-${sectionId}` === string) return true;
    }

    return false;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const target = e.target as HTMLButtonElement;
    const id = target.id;

    // TODO: comment all this logic properly.
    // TODO: Replace `document.getElementById(...)!.focus()` calls with React refs and guard focus transitions with `node.isConnected`.
    if (isSectionId(id) && !isDragging) {
      if (activeSectionIds.length === 1) {
        // DILEMMA: Why is there no `e.preventDefault()` like in the next branch?
        if (e.key === 'ArrowDown') {
          document.getElementById('add-sections')!.focus();
        } else if (e.key === 'ArrowUp') {
          document.getElementById('edit-sections')!.focus();
        }
      } else if (activeSectionIds.length > 1) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();

          const i = activeSectionIds.indexOf(id);

          if (i < activeSectionIds.length - 1) {
            document.getElementById(activeSectionIds[i + 1])!.focus();
          } else if (canAddSections) {
            document.getElementById('add-sections')!.focus();
          } else {
            document.getElementById('edit-sections')!.focus();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();

          const i = activeSectionIds.indexOf(id);
          if (i > 0) {
            document.getElementById(activeSectionIds[i - 1])!.focus();
          } else {
            document.getElementById('edit-sections')!.focus();
          }
        }
      }
    } else if (
      /**
       * If a delete button is focused, it's already `editorMode` and
       * `activeSectionIds.length > 1`. These two conditions are redundant.
       */
      // TODO: delete useless conditions.
      editorMode &&
      // FIXME: probably wanted to check the length of the array of deletable sections.
      activeSectionIds.length > 1 &&
      isDeleteSectionBtnId(id)
    ) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();

        const sectionId = id.replace('delete-', '') as SectionId;
        const i = activeSectionIds.indexOf(sectionId);

        /**
         * Strange logic. If there's just one deletable section and its
         * delete button is focused, then... the first deletable section's
         * delete button will be focused? The same goes for Arrow Up.
         */
        // FIXME: Replace `document.getElementById(...)!.focus()` with React refs and verify `node.isConnected` for delete buttons.
        // FIXME: fix this strange logic.
        if (i < activeSectionIds.length - 1) {
          document.getElementById(`delete-${activeSectionIds[i + 1]}`)!.focus();
        } else {
          document.getElementById(`delete-${activeSectionIds[1]}`)!.focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();

        const sectionId = id.replace('delete-', '') as SectionId;
        const i = activeSectionIds.indexOf(sectionId);

        // FIXME: fix this strange logic.
        if (i > 1) {
          document.getElementById(`delete-${activeSectionIds[i - 1]}`)!.focus();
        } else {
          document.getElementById(`delete-${activeSectionIds.at(-1)}`)!.focus();
        }
      }
      // FIXME: Replace `document.getElementById(...)!.focus()` with React refs and verify `node.isConnected` for add and edit control buttons.
    } else if (id === 'add-sections') {
      if (e.key === 'ArrowDown') {
        document.getElementById('edit-sections')!.focus();
      } else if (e.key === 'ArrowUp') {
        document.getElementById(activeSectionIds.at(-1)!)!.focus();
      }
    } else if (id === 'edit-sections') {
      if (e.key === 'ArrowDown') {
        document.getElementById(activeSectionIds[0])!.focus();
      } else if (e.key === 'ArrowUp') {
        if (canAddSections) {
          document.getElementById('add-sections')!.focus();
        } else {
          document.getElementById(activeSectionIds.at(-1)!)!.focus();
        }
      } else if (
        e.key === 'Tab' &&
        e.shiftKey === true &&
        editorMode &&
        activeSectionIds.length > 1
      ) {
        e.preventDefault();

        document.getElementById(`delete-${activeSectionIds.at(-1)}`)!.focus();
      }
    }
  }

  function handleKeyUp(e: React.KeyboardEvent) {
    const target = e.target as HTMLButtonElement;
    const id = target.id;

    if (
      e.key === 'Delete' &&
      isSectionId(id) &&
      id !== 'personal' &&
      !isDragging
    ) {
      e.preventDefault();

      deleteSections([id]);

      const i = activeSectionIds.indexOf(id);

      // FIXME: Replace `document.getElementById(...)!.focus()` with React refs and verify `node.isConnected` on item deletion.
      // If there's only "Personal" left.
      if (activeSectionIds.length === 2) {
        document.getElementById('personal')!.focus();

        // If the deleted item wasn't the last one in the array
      } else if (i < activeSectionIds.length - 1) {
        document.getElementById(activeSectionIds[i + 1])!.focus();
      } else {
        document.getElementById(activeSectionIds[i - 1])!.focus();
      }
    } else if (e.key === 'Escape' && !isDragging) {
      if (editorMode) {
        toggleEditorMode();

        if (isDeleteSectionBtnId(id)) {
          const sectionId = id.replace('delete-', '') as Replace<
            typeof id,
            'delete-',
            ''
          >;

          // TODO: Verify `tabRefs[sectionId].current.isConnected` before calling `.focus()` instead of asserting non-null `!`.
          tabRefs[sectionId].current!.focus();
        }
      }
    }
  }

  return (
    <>
      {/* Event delegation: Key events from focusable children (tabs, delete buttons, control buttons) bubble up to this container. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <nav
        aria-labelledby="toggle-navbar"
        className={clsx('Navbar', className, hidden && 'Navbar_hidden')}
        id="navbar"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        <DndContext
          /**
           * Since the navigation bar will always stay in the same position
           * (or at least won't move beyond the screen almost certainly),
           * there's no need for autoscroll. It also introduces strange
           * behaviour on mobile Firefox, so turning it off is for the best.
           */
          autoScroll={false}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <SortableContext
            items={draggableSectionIds}
            strategy={verticalListSortingStrategy}
          >
            <ul
              aria-label="Resume Sections"
              aria-orientation="vertical"
              aria-owns="personal links skills experience projects education certifications"
              className="Navbar-Items"
              id="resume-sections"
              role="tablist"
            >
              <NavbarItem
                alt={sectionTitles.personal}
                className="Navbar-NavbarItem Navbar-NavbarItem_personal"
                iconSrc={ICONS.personal}
                isDraggable={false}
                isEditorMode={editorMode}
                isSelected={selectedSectionId === 'personal'}
                sectionId="personal"
                sectionTitle={sectionTitles.personal}
                title={sectionTitles.personal}
                onSelectSection={() => selectSection('personal')}
                tabIndex={
                  selectedSectionId === 'personal' || editorMode ? 0 : -1
                }
              />
              {/**
               * This structure is necessary to be able to limit the dragging to
               * the area between "personal" and the end of `Navbar-Items`.
               */}
              <li className={draggableItemsWrapperClassName} role="none">
                <ul className="Navbar-Items" role="none">
                  {items}
                </ul>
              </li>
            </ul>
          </SortableContext>
        </DndContext>
        {/* Control buttons */}
        <div className="Navbar-ControlButtons">
          {canAddSections && (
            <AppbarIconButton
              alt="Add Sections"
              aria-controls="add-sections-dialog"
              aria-haspopup="dialog"
              aria-label="Add Sections"
              className="Navbar-Control"
              iconSrc={ICONS.add}
              id="add-sections"
              ref={addSectionsBtn}
              onClick={showAddSectionsPopup}
            />
          )}
          <AppbarIconButton
            alt="Toggle Editor Mode"
            aria-controls="resume-sections"
            aria-label="Toggle Editor Mode"
            aria-pressed={editorMode}
            className={editorClassName}
            iconSrc={editorMode ? ICONS.done : ICONS.edit}
            id="edit-sections"
            key="toggle-editor-mode"
            ref={editSectionsBtn}
            onClick={toggleEditorMode}
          />
        </div>
      </nav>
      <AddSections
        activeSectionIds={activeSectionIds}
        addSections={addSections}
        isShown={isAddSectionsPopupShown}
        onClose={closeAddSectionsPopup}
      />
    </>
  );
}
