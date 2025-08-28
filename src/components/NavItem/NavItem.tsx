import React, { LiHTMLAttributes, MouseEventHandler } from 'react';

import { clsx } from 'clsx/lite';

import AppbarIconButton from '@/components/AppbarIconButton';

import useNavItemSortable from './useNavItemSortable';

import deleteSrc from '@/assets/icons/delete-cross.svg';

import type { SectionId, SectionTitles } from '@/types/resumeData';

import './NavItem.scss';

interface NavItemProps extends LiHTMLAttributes<HTMLLIElement> {
  alt: string;
  deleteSection: MouseEventHandler<HTMLButtonElement>;
  editorMode: boolean;
  iconSrc: string;
  id: SectionId;
  selectedSectionId: string;
  selectSection: MouseEventHandler<HTMLButtonElement>;
  titles: SectionTitles;
}

export default function NavItem({
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
  const { dragProps, isDragging, setNodeRef, style } = useNavItemSortable(
    editorMode,
    id,
  );

  const isSelected = selectedSectionId === id;

  const listItemClassName = clsx(
    'NavItem',
    className,
    isDragging && 'NavItem_dragged',
    isSelected && 'NavItem_selected',
  );

  const btnClassName = clsx(
    'NavItem-Button',
    id === 'personal' && editorMode && 'NavItem-Button_editing',
    isSelected && !editorMode && 'NavItem-Button_active',
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

  const deleteBtnClassName = clsx(
    'NavItem-ControlBtn NavItem-ControlBtn_delete',
    editorMode && 'NavItem-ControlBtn_disabled',
  );

  return (
    <li
      className={listItemClassName}
      ref={id === 'personal' ? null : setNodeRef}
      style={id === 'personal' ? undefined : style}
      {...rest}
    >
      <AppbarIconButton
        alt={alt}
        className={btnClassName}
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
          onClick={deleteSection}
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
