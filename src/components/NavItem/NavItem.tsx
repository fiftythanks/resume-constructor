import React, { LiHTMLAttributes, MouseEventHandler } from 'react';

// `dnd-kit` docs: https://docs.dndkit.com/
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx/lite';

import AppbarIconButton from '@/components/AppbarIconButton';

import deleteSrc from '@/assets/icons/delete-cross.svg';

import './NavItem.scss';

interface NavItemProps extends LiHTMLAttributes<HTMLLIElement> {
  activeSectionIds: string[];
  alt: string;
  deleteSection: () => void;
  editorMode: boolean;
  iconSrc: string;
  id:
    | 'certifications'
    | 'education'
    | 'experience'
    | 'links'
    | 'personal'
    | 'projects'
    | 'skills';
  selectedSectionId: string;
  selectSection: MouseEventHandler<HTMLButtonElement>;
  titles: {
    certifications: 'Certifications';
    education: 'Education';
    experience: 'Work Experience';
    links: 'Links';
    personal: 'Personal Details';
    projects: 'Projects';
    skills: 'Technical Skills';
  };
}

export default function NavItem({
  activeSectionIds,
  alt,
  className,
  deleteSection,
  editorMode,
  iconSrc,
  id,
  selectedSectionId,
  selectSection,
  titles,
  ...rest
}: NavItemProps) {
  // Drag and drop logic
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  let dragProps;

  if (id === 'personal' || !editorMode) {
    dragProps = {};
  } else {
    dragProps = {
      ...listeners,
      'aria-roledescription': 'draggable',
      'aria-describedby': attributes['aria-describedby'],
      ref: setActivatorNodeRef,
    };
  }

  const isSelected = selectedSectionId === id;

  // Outer element
  const outerClassName = clsx(
    'NavItem',
    className,
    isDragging && 'NavItem_dragged',
    isSelected && 'NavItem_selected',
  );

  // Inner element
  const innerClassName = clsx(
    'NavItem-Button',
    id === 'personal' && editorMode && 'NavItem-Button_editing',
    isSelected && !editorMode && 'NavItem-Button_active',
  );

  // Delete button
  // TODO: move this logic to the `Navbar` component.
  function handleDeleteClick() {
    deleteSection();

    const i = activeSectionIds.indexOf(id);

    // If there's only "Personal" left.
    if (activeSectionIds.length === 2) {
      document.getElementById('edit-sections')?.focus();

      // If the deleted item wasn't the last in the array
    } else if (i < activeSectionIds.length - 1) {
      document.getElementById(`delete-${activeSectionIds[i + 1]}`)?.focus();
    } else {
      document.getElementById(`delete-${activeSectionIds[i - 1]}`)?.focus();
    }
  }

  const deleteBtnClassName = clsx(
    'NavItem-ControlBtn NavItem-ControlBtn_delete',
    editorMode && 'NavItem-ControlBtn_disabled',
  );

  const btnAttributes = {
    // TODO: add screen reader announcements (when all sections are implemented).

    id,
    'aria-controls': `${id}-tabpanel`,

    // To indicate that the tabbing functionality is disabled
    'aria-disabled': editorMode,

    'aria-label': titles[id],
    'aria-selected': isSelected,
    role: 'tab',
    ...dragProps,

    // If there's no selected section, "personal" is focusable.
    tabIndex:
      isSelected ||
      editorMode ||
      // FIXME: `null`? `selectedSectionId` shouldn't ever be null. It's always an ID.
      (id === 'personal' && selectedSectionId === null)
        ? 0
        : -1,
  };

  return (
    <li
      className={outerClassName}
      ref={id === 'personal' ? null : setNodeRef}
      style={id === 'personal' ? undefined : style}
      {...rest}
    >
      <AppbarIconButton
        alt={alt}
        className={innerClassName}
        iconSrc={iconSrc}
        onClick={!editorMode ? selectSection : undefined}
        {...btnAttributes}
      />

      {/* Delete-section button. */}
      {id !== 'personal' && (
        <button
          aria-label={`Delete ${titles[id]}`}
          className={deleteBtnClassName}
          id={`delete-${id}`}
          type="button"
          onClick={handleDeleteClick}
        >
          <img
            alt="Delete"
            className="NavItem-ControlBtnIcon"
            height="12px"
            src={deleteSrc}
            width="12px"
          />
        </button>
      )}
    </li>
  );
}
