import React, { LiHTMLAttributes, MouseEventHandler } from 'react';

import { clsx } from 'clsx/lite';

import AppbarIconButton from '@/components/AppbarIconButton';

import useNavItemSortable from './useNavItemSortable';

import deleteBtnIconSrc from '@/assets/icons/delete-cross.svg';

import type { SectionId, SectionTitle } from '@/types/resumeData';

import './NavItem.scss';

export interface NavItemProps extends LiHTMLAttributes<HTMLLIElement> {
  alt: string;
  iconSrc: string;
  isDraggable: boolean;
  isEditorMode: boolean;
  isSelected: boolean;
  onDeleteSection: MouseEventHandler<HTMLButtonElement>;
  onSelectSection: MouseEventHandler<HTMLButtonElement>;
  sectionId: SectionId;
  sectionTitle: SectionTitle;
  tabIndex: -1 | 0;
}

/**
 * A navbar item for the `Navbar` component. Accepts all attributes
 * that the `<li>` element accepts, as well as custom props specific to
 * the navbar items.
 *
 * Has the "Tab" ARIA role.
 */
export default function NavItem({
  alt,
  className,
  iconSrc,
  isDraggable,
  isEditorMode,
  isSelected,
  sectionId,
  sectionTitle,
  tabIndex,
  onDeleteSection,
  onSelectSection,
  ...rest
}: NavItemProps) {
  const { dndAttributes, isDragging, setNodeRef, style } = useNavItemSortable({
    isEditorMode,
    sectionId,
    isDraggable,
  });

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

    sectionId,
    tabIndex,
    'aria-controls': `${sectionId}-tabpanel`,
    'aria-label': sectionTitle,
    'aria-selected': isSelected,
    role: 'tab',

    // To indicate that the tabbing functionality is disabled
    'aria-disabled': isEditorMode,

    ...dndAttributes,
  };

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
      {isDraggable && isEditorMode && (
        <button
          aria-label={`Delete ${sectionTitle}`}
          className="NavItem-ControlBtn NavItem-ControlBtn_delete"
          id={`delete-${sectionId}`}
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
