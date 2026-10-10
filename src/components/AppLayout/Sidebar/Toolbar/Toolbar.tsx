import { useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';

import { clsx } from 'clsx';

import AppbarIconButton from '@/components/AppbarIconButton';
import Preview from '@/components/Preview';

import possibleSectionIds from '@/utils/possibleSectionIds';

import deleteSrc from '@/assets/icons/clear.svg';
import fillSrc from '@/assets/icons/fill.svg';

import './Toolbar.scss';

import previewSrc from '@/assets/icons/preview.svg';

import type {
  ResumeData,
  SectionId,
  SectionIds,
  SectionIdsDeletable,
  TabpanelIds,
} from '@/types/resumeData';
import type { ArraySplice, ReadonlyDeep } from 'type-fest';

export interface ToolbarProps {
  activeSectionIds: SectionId[];
  className?: string;
  data: ResumeData;
  deleteAll: () => void;
  fillAll: () => void;
}

/**
 * The main toolbar in the application that provides users with such features as
 * deleting all resume sections, filling all possible sections with placeholder
 * data and opening the preview of the resume.
 */
export default function Toolbar({
  activeSectionIds,
  className,
  data,
  // TODO: it should be clearAndDeleteAll
  deleteAll,
  fillAll,
}: ReadonlyDeep<ToolbarProps>) {
  const [isPreviewModalShown, setIsPreviewModalShown] = useState(false);

  const [lastFocusedItemId, setLastFocusedItemId] = useState<
    'delete-all' | 'fill-all' | 'preview'
  >('delete-all');

  const deleteAllBtn = useRef<HTMLButtonElement | null>(null);
  const fillAllBtn = useRef<HTMLButtonElement | null>(null);
  const previewBtn = useRef<HTMLButtonElement | null>(null);

  /**
   * NOTE: The order is:
   * 1. "Delete All".
   * 2. "Fill All".
   * 3. "Preview".
   */
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // TODO: Verify `node.isConnected` and avoid non-null assertions `!` when moving focus between toolbar items.
    if (e.key === 'ArrowLeft') {
      switch (e.target) {
        case deleteAllBtn.current:
          previewBtn.current!.focus();
          break;
        case fillAllBtn.current:
          deleteAllBtn.current!.focus();
          break;
        case previewBtn.current:
          fillAllBtn.current!.focus();
          break;
        default:
        // Do nothing.
      }
    }

    if (e.key === 'ArrowRight') {
      switch (e.target) {
        case deleteAllBtn.current:
          fillAllBtn.current!.focus();
          break;
        case fillAllBtn.current:
          previewBtn.current!.focus();
          break;
        case previewBtn.current:
          deleteAllBtn.current!.focus();
          break;
        default:
        // Do nothing.
      }
    }
  }

  interface ToolbarItem extends HTMLButtonElement {
    id: 'delete-all' | 'fill-all' | 'preview';
  }

  function handleFocus(e: FocusEvent<ToolbarItem>) {
    if (e.nativeEvent.type !== 'focusin') return;

    setLastFocusedItemId(e.target.id);
  }

  // DILEMMA: Should the close button be focused when you open the modal with keyboard? Change it, maybe?
  function showPreviewModal() {
    setIsPreviewModalShown(true);
  }

  // TODO: add proper keyboard a11y, like in the `AddSections` modal.
  function closePreviewModal() {
    setIsPreviewModalShown(false);

    // TODO: Verify `previewBtn.current.isConnected` before calling `.focus()` to prevent focus drops if the toolbar has unmounted.
    if (previewBtn.current !== null) {
      previewBtn.current.focus();
    }
  }

  // Ids necessary for correct `aria-controls`.

  const deletableSectionIds: SectionIdsDeletable = possibleSectionIds.toSpliced(
    0,
    1,
  ) as ArraySplice<SectionIds, 0, 1>;

  type AppendSuffix<T extends SectionIds> = {
    [K in keyof T]: `${T[K]}-tabpanel`;
  };

  const tabpanelIds: TabpanelIds = possibleSectionIds.map(
    (sectionId) => `${sectionId}-tabpanel`,
  ) as AppendSuffix<SectionIds>;

  return (
    <>
      <div
        aria-labelledby="toolbar-toggle"
        className={clsx(['Toolbar', className])}
        role="toolbar"
        onKeyDown={handleKeyDown}
      >
        {/* TODO: add a warning that clicking "Clear All" will result in loss of all data. */}
        <AppbarIconButton
          // All sections' tabs but the undeletable "Personal Details"'s one and all tabpanels.
          aria-controls={clsx([...deletableSectionIds, ...tabpanelIds])}
          aria-label="Clear All"
          className="Toolbar-Item Toolbar-Item_deleteAll"
          iconSrc={deleteSrc}
          // TODO: make `clear-all`. Don't forget about the `controls` tuple.
          id="delete-all"
          ref={deleteAllBtn}
          tabIndex={lastFocusedItemId === 'delete-all' ? 0 : -1}
          onClick={deleteAll}
          onFocus={handleFocus}
        />
        {/* TODO: add a warning that clicking "Fill All" will result in loss of all data. */}
        <AppbarIconButton
          // All sections' tabs but the undeletable "Personal Details"'s one and all tabpanels.
          aria-controls={clsx([...deletableSectionIds, ...tabpanelIds])}
          aria-label="Fill All"
          className="Toolbar-Item Toolbar-Item_fillAll"
          iconSrc={fillSrc}
          id="fill-all"
          ref={fillAllBtn}
          tabIndex={lastFocusedItemId === 'fill-all' ? 0 : -1}
          onClick={fillAll}
          onFocus={handleFocus}
        />
        {/* Temporarily disabled while the resume preview feature is undergoing redesign. */}
        <AppbarIconButton
          disabled
          aria-controls="resume-preview-dialog"
          aria-label="Open Preview"
          className="Toolbar-Item Toolbar-Item_preview"
          iconSrc={previewSrc}
          id="preview"
          ref={previewBtn}
          tabIndex={lastFocusedItemId === 'preview' ? 0 : -1}
          onClick={showPreviewModal}
          onFocus={handleFocus}
        />
      </div>
      {isPreviewModalShown && (
        <Preview
          activeSectionIds={activeSectionIds}
          data={data}
          id="resume-preview-dialog"
          isShown={isPreviewModalShown}
          onClose={closePreviewModal}
        />
      )}
    </>
  );
}
