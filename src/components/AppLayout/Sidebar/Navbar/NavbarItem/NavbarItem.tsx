import type { LiHTMLAttributes, RefObject } from 'react';

import { clsx } from 'clsx';

import AppbarIconButton from '@/components/AppbarIconButton';

import useNavbarItemSortable from './useNavbarItemSortable';

import deleteBtnIconSrc from '@/assets/icons/delete-cross.svg';

import type { SectionId, SectionTitle } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

import './NavbarItem.scss';

export interface NavbarItemProps extends LiHTMLAttributes<HTMLLIElement> {
  alt: string;
  iconSrc: string;
  isDraggable: boolean;
  isEditorMode: boolean;
  isSelected: boolean;
  onDeleteSection?: ReadonlyDeep<() => void>;
  onSelectSection: ReadonlyDeep<() => void>;
  ref?: RefObject<HTMLButtonElement | null>;
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
export default function NavbarItem({
  alt,
  className,
  iconSrc,
  isDraggable,
  isEditorMode,
  isSelected,
  ref,
  sectionId,
  sectionTitle,
  tabIndex,
  onDeleteSection,
  onSelectSection,
  ...rest
}: NavbarItemProps) {
  const { dndAttributes, isDragging, setNodeRef, style } =
    useNavbarItemSortable({
      isEditorMode,
      sectionId,
      isDraggable,
    });

  const listItemClassName = clsx(
    'NavbarItem',
    className,
    isDragging && 'NavbarItem_dragged',
    isSelected && 'NavbarItem_selected',
  );

  const btnClassName = clsx(
    'NavbarItem-Button',
    isDraggable && isEditorMode && 'NavbarItem-Button_dragMe',
    isSelected && !isEditorMode && 'NavbarItem-Button_active',
  );

  // TODO: no empty lines inside objects!
  const btnAttributes = {
    // TODO: add screen reader announcements (when all sections are implemented).
    id: sectionId,
    tabIndex,
    'aria-controls': `${sectionId}-tabpanel`,
    'aria-label': sectionTitle,
    'aria-selected': isSelected,
    role: 'tab',
    // To indicate that the tabbing functionality is disabled
    'aria-disabled': isEditorMode,
    'aria-describedby': dndAttributes?.['aria-describedby'],
    'aria-roledescription': dndAttributes?.['aria-roledescription'],
    ref(node: HTMLButtonElement) {
      dndAttributes?.setActivatorNodeRef(node);
      if (ref !== undefined) ref.current = node;
    },
    ...(dndAttributes !== null && dndAttributes.listeners !== undefined
      ? dndAttributes.listeners
      : {}),
  };

  return (
    <li
      className={listItemClassName}
      ref={setNodeRef}
      role="none"
      style={style}
      {...rest}
    >
      <AppbarIconButton
        alt={alt}
        className={btnClassName}
        iconSrc={iconSrc}
        onClick={isEditorMode ? undefined : onSelectSection}
        {...btnAttributes}
      />

      {/* Delete-section button. */}
      {isDraggable && isEditorMode && (
        <button
          aria-label={`Delete ${sectionTitle}`}
          className="NavbarItem-ControlBtn NavbarItem-ControlBtn_delete"
          id={`delete-${sectionId}`}
          type="button"
          onClick={onDeleteSection}
        >
          <img
            alt="Delete"
            className="NavbarItem-ControlBtnIcon"
            height="12px"
            src={deleteBtnIconSrc}
            width="12px"
          />
        </button>
      )}
    </li>
  );
}
