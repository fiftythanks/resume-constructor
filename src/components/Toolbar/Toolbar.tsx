import React, { useEffect, useRef, useState } from 'react';

import { clsx } from 'clsx';

import AppbarIconButton from '@/components/AppbarIconButton';
import Preview from '@/components/Preview';

import possibleSectionIds from '@/utils/possibleSectionIds';

import deleteSrc from '@/assets/icons/clear.svg';
import crossSrc from '@/assets/icons/cross.svg';
import fillSrc from '@/assets/icons/fill.svg';
import hamburgerSrc from '@/assets/icons/hamburger.svg';
import kebabSrc from '@/assets/icons/kebab.svg';
import previewSrc from '@/assets/icons/preview.svg';

import './Toolbar.scss';

import type {
  ResumeData,
  SectionId,
  SectionIds,
  SectionIdsDeletable,
  TabpanelIds,
} from '@/types/resumeData';
import type { ArrayElement, ArraySplice, ReadonlyDeep } from 'type-fest';

export type ControlsIds = ['delete-all', 'fill-all', 'preview'];

export interface ToolbarProps {
  activeSectionIds: SectionId[];
  className?: string;
  data: ResumeData;
  deleteAll: () => void;
  fillAll: () => void;
  isNavbarExpanded: boolean;
  toggleNavbar: () => void;
}

/**
 * The main toolbar in the application that provides users with such features as
 * deleting all resume sections, filling all possible sections with placeholder
 * data, as well as toggling the navbar.
 *
 * It consists of two parts: a menu with the controls mentioned
 * earlier and a "Toggle Navbar" button. Also, it renders the resume preview
 * dialog when the preview is toggled on.
 *
 * @param className Applies to the toolbar itself, i.e. the top-level component
 * that includes both the menu with the control buttons and the "Toggle Navbar"
 * button.
 */
export default function Toolbar({
  activeSectionIds,
  className,
  data,
  // TODO: it should be clearAndDeleteAll
  deleteAll,
  fillAll,
  isNavbarExpanded,
  toggleNavbar,
}: ReadonlyDeep<ToolbarProps>) {
  const [areControlsExpanded, setAreControlsExpanded] = useState(false);
  const [isPreviewModalShown, setIsPreviewModalShown] = useState(false);
  const firstControlRef = useRef<HTMLButtonElement | null>(null);
  const toggleControlsRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (areControlsExpanded && firstControlRef.current !== null) {
      firstControlRef.current.focus();
    }
  });

  const ControlsClassName = clsx([
    'Toolbar-ControlsWrapper',
    !areControlsExpanded && 'Toolbar-ControlsWrapper_hidden',
  ]);

  function toggleControls() {
    setAreControlsExpanded(!areControlsExpanded);
  }

  // Keyboard navigation.

  //! Order matters.
  const controls: ControlsIds = ['delete-all', 'fill-all', 'preview'];

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLButtonElement;

    const id = target.id as
      | 'toggle-controls'
      | 'toggle-navbar'
      | ArrayElement<ControlsIds>;

    // "Toggle Controls" and "Toggle Navigation" buttons keyboard navigation.
    if (id === 'toggle-controls' || id === 'toggle-navbar') {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (id === 'toggle-controls') {
          // TODO: use refs!
          document.getElementById('toggle-navbar')!.focus();
        } else {
          // TODO: use refs!
          document.getElementById('toggle-controls')!.focus();
        }
      }

      return;
    }

    // Control buttons keyboard navigation.

    if (!controls.includes(id)) {
      return;
    }

    const i = controls.indexOf(id);

    switch (e.key) {
      case 'ArrowLeft':
        // If the leftmost button is focused, focus the rightmost one.
        if (i === 0) {
          // TODO: use refs!
          document.getElementById('preview')!.focus();
          break;
        }

        // Otherwise focus the button to the left.
        // TODO: use refs!
        document.getElementById(controls[i - 1])!.focus();

        break;
      case 'ArrowRight':
        // If the rightmost button is focused, focus the leftmost one.
        if (i === controls.length - 1) {
          // TODO: use refs!
          document.getElementById('delete-all')!.focus();
          break;
        }

        // Otherwise, focus the button to the right.
        // TODO: use refs!
        document.getElementById(controls[i + 1])!.focus();

        break;
      case 'Escape':
        // Hide the controls menu and focus the "Toggle Controls" button.
        toggleControls();
        // TODO: use refs!
        document.getElementById('toggle-controls')!.focus();

        break;
      case 'Tab':
        // `e.shifKey === false` behaviour (when Shift isn't held) is programmed in `AppLayout`.
        if (!e.shiftKey) break;

        e.preventDefault();

        // Hide the controls menu and focus the "Toggle Controls" button.
        toggleControls();
        // TODO: use refs!
        document.getElementById('toggle-controls')!.focus();

        break;
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLUListElement>) {
    const target = e.target as unknown as HTMLButtonElement;
    const id = target.id as ArrayElement<ControlsIds>;

    /**
     * [1]: Otherwise click on "Toggle Controls" will run `toggleControls()`
     * twice.
     */
    if (
      controls.includes(id) &&
      (e.relatedTarget === null ||
        (!controls.includes(e.relatedTarget.id as ArrayElement<ControlsIds>) &&
          e.relatedTarget !== toggleControlsRef.current)) // [1]
    ) {
      toggleControls();
    }
  }

  // ? Should the close button be focused when you open the modal with keyboard? Change it, maybe?
  function showPreviewModal() {
    setIsPreviewModalShown(true);
  }

  // TODO: add proper keyboard a11y, like in the `AddSections` modal.
  function closePreviewModal() {
    setIsPreviewModalShown(false);
  }

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
        /**
         * FYI: There's no point in adding a label on small screens because
         * there's just two items. On larger screens, I'm planning to put the
         * toolbar vertical and remove the toggle buttons. Then labelling it
         * will make much more sense. For now, I'll leave it as it is.
         */
        className={clsx(['Toolbar', className])}
        data-testid="toolbar"
        role="toolbar"
        onKeyDown={handleKeyDown}
      >
        {/* Why doesn't it have `aria-haspopup` like the "toggle-controls" button? */}
        <AppbarIconButton
          alt="Toggle Navigation"
          aria-controls="navbar"
          aria-expanded={isNavbarExpanded}
          // It's different from `alt` because it's used as a label for `navbar`.
          aria-label="Navigation"
          className="Toolbar-Item Toolbar-Item_toggleNavbar"
          iconSrc={isNavbarExpanded ? crossSrc : hamburgerSrc}
          id="toggle-navbar"
          /**
           * I know setting positive tab indices isn't the best practice, but
           * it's the only place I need it in the application, simply to make
           * the button the first element that receives focus in the application.
           */
          // eslint-disable-next-line jsx-a11y/tabindex-no-positive
          tabIndex={2}
          onClick={toggleNavbar}
        />
        {/* TODO: instead of a `...-hidden` class there should be conditional rendering. Right? */}
        <div
          aria-labelledby="toggle-controls"
          aria-orientation="horizontal"
          className={ControlsClassName}
          data-testid="control-btns"
          id="control-btns"
          role="menu"
        >
          <ul className="Toolbar-ControlsList" onBlur={handleBlur}>
            <li>
              {/* TODO: add a warning that clicking "Clear All" will result in loss of all data. */}
              <AppbarIconButton
                alt="Clear All"
                // All sections' tabs but the undeletable "Personal Details"'s one and all tabpanels.
                // TODO: it shouldn't control inactive sections because they are already clear.
                aria-controls={clsx([...deletableSectionIds, ...tabpanelIds])}
                aria-label="Clear All"
                className="Toolbar-Item Toolbar-Item_deleteAll"
                iconSrc={deleteSrc}
                // TODO: make `clear-all`. Don't forget about the `controls` tuple.
                id="delete-all"
                ref={firstControlRef}
                role="menuitem"
                tabIndex={-1}
                onClick={deleteAll}
              />
            </li>
            <li>
              {/* TODO: add a warning that clicking "Fill All" will result in loss of all data. */}
              <AppbarIconButton
                alt="Fill All"
                //? Shouldn't it actually control only those tabs that aren't displayed? Since it can't do anything to those tabs that are displayed.
                // All sections' tabs but the undeletable "Personal Details"'s one and all tabpanels.
                aria-controls={clsx([...deletableSectionIds, ...tabpanelIds])}
                aria-label="Fill All"
                className="Toolbar-Item Toolbar-Item_fillAll"
                iconSrc={fillSrc}
                id="fill-all"
                role="menuitem"
                tabIndex={-1}
                onClick={fillAll}
              />
            </li>
            <li>
              <AppbarIconButton
                // FIXME: add `aria-controls`!
                //? Should `alt` and `aria-label` differ here?
                alt="Preview"
                aria-label="Open Preview"
                className="Toolbar-Item Toolbar-Item_preview"
                iconSrc={previewSrc}
                id="preview"
                role="menuitem"
                tabIndex={-1}
                onClick={showPreviewModal}
              />
            </li>
          </ul>
        </div>
        <AppbarIconButton
          alt="Toggle Controls"
          aria-controls="control-btns"
          aria-expanded={areControlsExpanded}
          aria-haspopup="menu"
          // It's different from `alt` because it's used as a label for the menu
          aria-label="Control Buttons"
          className="Toolbar-Item Toolbar-Item_toggleControls"
          iconSrc={kebabSrc}
          id="toggle-controls"
          ref={toggleControlsRef}
          onClick={toggleControls}
        />
      </div>
      {/* ? What about the `Popup` component? It's strange to use `.showModal()` and `.close()` when in reality it's just conditional rendering... Think if you need to change something here.` */}
      {isPreviewModalShown && (
        <Preview
          activeSectionIds={activeSectionIds}
          data={data}
          isShown={isPreviewModalShown}
          onClose={closePreviewModal}
        />
      )}
    </>
  );
}
