import React, { LiHTMLAttributes, MouseEventHandler } from 'react';

import { clsx } from 'clsx/lite';

import AppbarIconButton from '@/components/AppbarIconButton';

import useNavItemSortable from './useNavItemSortable';

import deleteBtnIconSrc from '@/assets/icons/delete-cross.svg';

import type { SectionId, SectionTitle } from '@/types/resumeData';

import './NavItem.scss';

interface NavItemProps extends LiHTMLAttributes<HTMLLIElement> {
  alt: string;
  iconSrc: string;
  id: SectionId;
  isDraggable: boolean;
  isEditorMode: boolean;
  isSelected: boolean;
  onDeleteSection: MouseEventHandler<HTMLButtonElement>;
  onSelectSection: MouseEventHandler<HTMLButtonElement>;
  tabIndex: -1 | 0;
  title: SectionTitle;
}

export default function NavItem({
  alt,
  className,
  iconSrc,
  isDraggable,
  isEditorMode,
  isSelected,
  id,
  tabIndex,
  title,
  onDeleteSection,
  onSelectSection,
  ...rest
}: NavItemProps) {
  const dnd = useNavItemSortable({ isEditorMode, id, isDraggable });

  const dndAttributes = dnd !== null ? dnd.dndAttributes : {};
  const isDragging = dnd !== null ? dnd.isDragging : false;
  const setNodeRef = dnd !== null ? dnd.setNodeRef : null;
  const style = dnd !== null ? dnd.style : undefined;

  const listItemClassName = clsx(
    'NavItem',
    className,
    isDragging && 'NavItem_dragged',
    isSelected && 'NavItem_selected',
  );

  const btnClassName = clsx(
    'NavItem-Button',
    isDraggable && isEditorMode && 'NavItem-Button_dragMe',
    isSelected && !isEditorMode && 'NavItem-Button_active',
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
    'aria-disabled': isEditorMode,

    ...dndAttributes,
  };

  const deleteBtnClassName = clsx(
    'NavItem-ControlBtn NavItem-ControlBtn_delete',
    isEditorMode && 'NavItem-ControlBtn_disabled',
  );

  return (
    <li className={listItemClassName} ref={setNodeRef} style={style} {...rest}>
      <AppbarIconButton
        alt={alt}
        className={btnClassName}
        iconSrc={iconSrc}
        onClick={!isEditorMode ? onSelectSection : undefined}
        {...btnAttributes}
      />

      {/* Delete-section button. */}
      {isDraggable && (
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
            src={deleteBtnIconSrc}
            width="12px"
          />
        </button>
      )}
    </li>
  );
}
