import React, { useEffect, useRef, useState } from 'react';

import { clsx } from 'clsx';

import AppbarIconButton from '@/components/AppbarIconButton';
import Preview from '@/components/Preview';

import clearSrc from '@/assets/icons/clear.svg';
import crossSrc from '@/assets/icons/cross.svg';
import fillSrc from '@/assets/icons/fill.svg';
import hamburgerSrc from '@/assets/icons/hamburger.svg';
import kebabSrc from '@/assets/icons/kebab.svg';
import previewSrc from '@/assets/icons/preview.svg';

import './Toolbar.scss';

import type { ResumeData, SectionId, SectionIds } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

export interface ToolbarProps {
  activeSectionIds: SectionId[];
  className?: string;
  data: ResumeData;
  deleteAll: () => void;
  fillAll: () => void;
  isNavbarExpanded: boolean;
  possibleSectionIds: SectionIds;
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
  deleteAll,
  fillAll,
  isNavbarExpanded,
  possibleSectionIds,
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

  const toggleControlsBtnClassName = clsx([
    'Toolbar-ControlsWrapper',
    !areControlsExpanded && 'Toolbar-ControlsWrapper_hidden',
  ]);

  function toggleControls() {
    setAreControlsExpanded(!areControlsExpanded);
  }

  // Keyboard navigation.

  //! Order matters.
  const controls = ['delete-all', 'fill-all', 'preview'];

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLDivElement;
    const id = target.id;

    // "Toggle Navbar" button.

    if (
      id === 'toggle-navbar' &&
      (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
    ) {
      document.getElementById('toggle-controls')!.focus();
    }

    // "Toggle Controls" button, i.e. the button expanding/hiding the toolbar.

    if (
      id === 'toggle-controls' &&
      (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
    ) {
      document.getElementById('toggle-navbar')!.focus();
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
          document.getElementById('preview')!.focus();
          break;
        }

        // Otherwise focus the button to the left.
        document.getElementById(controls[i - 1])!.focus();

        break;
      case 'ArrowRight':
        // If the rightmost button is focused, focus the leftmost one.
        if (i === controls.length - 1) {
          document.getElementById('delete-all')!.focus();
          break;
        }

        // Otherwise, focus the button to the right.
        document.getElementById(controls[i + 1])!.focus();

        break;
      case 'Escape':
        // Hide the toolbar and focus the "Toggle Controls" button.
        toggleControls();
        document.getElementById('toggle-controls')!.focus();

        break;
      case 'Tab':
        // `e.shifKey === false` behaviour is programmed in `AppLayout`.
        if (!e.shiftKey) break;

        e.preventDefault();

        // Hide the toolbar and focus the "Toggle Controls" button.
        toggleControls();
        document.getElementById('toggle-controls')!.focus();

        break;
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLUListElement>) {
    /**
     * [1]: Otherwise click on "Toggle Controls" will run `toggleControls()`
     * twice.
     */
    if (
      controls.includes(e.target.id) &&
      (e.relatedTarget === null ||
        (!controls.includes(e.relatedTarget.id) &&
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

  return (
    <>
      <div
        className={clsx(['Toolbar', className])}
        role="toolbar"
        onKeyDown={handleKeyDown}
      >
        <AppbarIconButton
          alt="Toggle Navigation"
          aria-controls="navbar"
          aria-expanded={isNavbarExpanded}
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
        <div
          aria-labelledby="toggle-controls"
          aria-orientation="horizontal"
          className={toggleControlsBtnClassName}
          id="control-btns"
          role="menu"
        >
          <ul className="Toolbar-ControlsList" onBlur={handleBlur}>
            <li>
              {/* TODO: add a warning that clicking "Clear All" will result in loss of all data. */}
              <AppbarIconButton
                //! WTF? WHY ARE THEY DIFFERENT?
                alt="Clear All"
                // All sections but the undeletable "Personal Details" section
                aria-controls={clsx(possibleSectionIds.toSpliced(1, 1))}
                //! WTF? WHY ARE THEY DIFFERENT?
                aria-label="Delete All"
                className="Toolbar-Item Toolbar-Item_deleteAll"
                iconSrc={clearSrc}
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
                aria-controls={clsx(possibleSectionIds)}
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
          // TODO: so, is it "Toggle Controls"...
          alt="Toggle Controls"
          aria-controls="control-btns"
          aria-expanded={areControlsExpanded}
          aria-haspopup="menu"
          // TODO: or "Control Buttons"?
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
