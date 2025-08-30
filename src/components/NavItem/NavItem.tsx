import React, { LiHTMLAttributes, MouseEventHandler } from 'react';

import { clsx } from 'clsx/lite';

import AppbarIconButton from '@/components/AppbarIconButton';

import useNavItemSortable from './useNavItemSortable';

import deleteSrc from '@/assets/icons/delete-cross.svg';

import type { SectionId, SectionTitle } from '@/types/resumeData';

import './NavItem.scss';

interface NavItemProps extends LiHTMLAttributes<HTMLLIElement> {
  alt: string;
  editorMode: boolean;
  iconSrc: string;
  id: SectionId;
  isSelected: boolean;
  onDeleteSection: MouseEventHandler<HTMLButtonElement>;
  onSelectSection: MouseEventHandler<HTMLButtonElement>;
  tabIndex: -1 | 0;
  title: SectionTitle;
}

export default function NavItem({
  alt,
  className,
  editorMode,
  iconSrc,
  isSelected,
  id,
  tabIndex,
  title,
  onDeleteSection,
  onSelectSection,
  ...rest
}: NavItemProps) {
  const { dragProps, isDragging, setNodeRef, style } = useNavItemSortable(
    editorMode,
    id,
  );

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
    tabIndex,
    'aria-controls': `${id}-tabpanel`,
    'aria-label': title,
    'aria-selected': isSelected,
    role: 'tab',

    // To indicate that the tabbing functionality is disabled
    'aria-disabled': editorMode,

    ...dragProps,
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
        onClick={!editorMode ? onSelectSection : undefined}
        {...btnAttributes}
      />

      {/* Delete-section button. */}
      {id !== 'personal' && (
        <button
          aria-label={`Delete ${title}`}
          className={deleteBtnClassName}
          id={`delete-${id}`}
          type="button"
          onClick={onDeleteSection}
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
