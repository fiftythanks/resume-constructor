import React, { useEffect, useRef, useState } from 'react';

import AppbarItem from '@/components/AppbarItem';
import Preview from '@/components/Preview';

import clearSrc from '@/assets/icons/clear.svg';
import crossSrc from '@/assets/icons/cross.svg';
import fillSrc from '@/assets/icons/fill.svg';
import hamburgerSrc from '@/assets/icons/hamburger.svg';
import kebabSrc from '@/assets/icons/kebab.svg';
import previewSrc from '@/assets/icons/preview.svg';

import './Toolbar.scss';

export default function Toolbar({
  activeSectionIDs,
  className,
  deleteAll,
  data,
  fillAll,
  isNavbarExpanded,
  toggleNavbar,
}) {
  const [areControlsExpanded, setAreControlsExpanded] = useState(false);
  const firstControlRef = useRef(null);
  const toggleControlsRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [isPreviewModalShown, setIsPreviewModalShown] = useState(false);

  const navbarToggleAttributes = {
    'aria-controls': 'navbar',
    'aria-expanded': isNavbarExpanded,
    'aria-label': 'Navigation',
    id: 'toggle-navbar',
    /**
     * I know setting positive tab indices isn't the best practice, but
     * it's the only place I need it in the application, simply to make
     * the button the first element that receives focus in the application.
     */
    tabIndex: '2',
  };

  const deleteAllBtnAttributes = {
    // TODO: add more ARIA attributes when you create actual resume sections.
    'aria-controls':
      'links skills experience projects education certifications',
    'aria-label': 'Delete All',
    ref: firstControlRef,
    role: 'menuitem',
    id: 'delete-all',
    tabIndex: '-1',
  };

  const previewAttributes = {
    // TODO: add more ARIA attributes when you create actual resume preview.
    'aria-label': 'Open Preview',
    role: 'menuitem',
    id: 'preview',
    tabIndex: '-1',
  };

  const fillAllBtnAttributes = {
    // TODO: add more ARIA attributes when you create actual resume sections.
    'aria-controls':
      'personal links skills experience projects education certifications',
    'aria-label': 'Fill All',
    role: 'menuitem',
    id: 'fill-all',
    tabIndex: '-1',
  };

  function toggleControls() {
    setAreControlsExpanded(!areControlsExpanded);
  }

  const controlsToggleAttributes = {
    'aria-controls': 'control-btns',
    'aria-expanded': areControlsExpanded,
    'aria-haspopup': 'menu',
    'aria-label': 'Control Buttons',
    id: 'toggle-controls',
    ref: toggleControlsRef,
  };

  // Keyboard navigation.
  // ? Probably unnecessary `useEffect`? Analyse what else you could use here instead of it, and if you find a better solution, refactor.
  useEffect(() => {
    if (areControlsExpanded) {
      firstControlRef.current.focus();
    }
  }, [areControlsExpanded]);

  //! Order matters.
  const controls = ['delete-all', 'fill-all', 'preview'];

  function handleKeyDown(e) {
    const { id } = e.target;

    if (
      id === 'toggle-navbar' &&
      (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
    ) {
      document.getElementById('toggle-controls').focus();
    }

    if (
      id === 'toggle-controls' &&
      (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
    ) {
      document.getElementById('toggle-navbar').focus();
    }

    if (controls.includes(id)) {
      const i = controls.indexOf(id);

      if (e.key === 'ArrowLeft') {
        if (i === 0) {
          document.getElementById('preview').focus();
        } else {
          document.getElementById(controls[i - 1]).focus();
        }
      }

      if (e.key === 'ArrowRight') {
        if (i === controls.length - 1) {
          document.getElementById('delete-all').focus();
        } else {
          document.getElementById(controls[i + 1]).focus();
        }
      }

      // `e.shifKey === false` behaviour is programmed in `AppLayout`.
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();

        toggleControls();
        document.getElementById('toggle-controls').focus();
      }

      if (e.key === 'Escape') {
        toggleControls();
        document.getElementById('toggle-controls').focus();
      }
    }
  }

  function handleBlur(e) {
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
        className={`Toolbar ${className}`}
        role="toolbar"
        onKeyDown={handleKeyDown}
      >
        <AppbarItem
          action={toggleNavbar}
          alt="Toggle Navigation"
          attributes={navbarToggleAttributes}
          className="Toolbar-Item Toolbar-Item_toggleNavbar"
          iconSrc={isNavbarExpanded ? crossSrc : hamburgerSrc}
        />
        <div
          aria-labelledby="toggle-controls"
          aria-orientation="horizontal"
          className={`Toolbar-ControlsWrapper${areControlsExpanded ? '' : ' Toolbar-ControlsWrapper_hidden'}`}
          id="control-btns"
          role="menu"
        >
          <ul className="Toolbar-ControlsList" onBlur={handleBlur}>
            {/* TODO: add a warning that clicking "Clear All" will result in loss of all data. */}
            <AppbarItem
              hasInner
              isListItem
              action={deleteAll}
              alt="Clear All"
              iconSrc={clearSrc}
              innerAttributes={deleteAllBtnAttributes}
              innerClassName="Toolbar-Item Toolbar-Item_deleteAll"
            />
            {/* TODO: add a warning that clicking "Fill All" will result in loss of all data. */}
            <AppbarItem
              hasInner
              isListItem
              action={fillAll}
              alt="Fill All"
              iconSrc={fillSrc}
              innerAttributes={fillAllBtnAttributes}
              innerClassName="Toolbar-Item Toolbar-Item_fillAll"
            />
            <AppbarItem
              hasInner
              isListItem
              action={showPreviewModal}
              alt="Preview"
              iconSrc={previewSrc}
              innerAttributes={previewAttributes}
              innerClassName="Toolbar-Item Toolbar-Item_preview"
            />
          </ul>
        </div>
        <AppbarItem
          action={toggleControls}
          alt="Toggle Controls"
          attributes={controlsToggleAttributes}
          className="Toolbar-Item Toolbar-Item_toggleControls"
          iconSrc={kebabSrc}
        />
      </div>
      {/* ? What about the `Popup` component? It's strange to use `.showModal()` and `.close()` when in reality it's just conditional rendering... Think if you need to change something here.` */}
      {isPreviewModalShown && (
        <Preview
          activeSectionIDs={activeSectionIDs}
          data={data}
          isShown={isPreviewModalShown}
          onClose={closePreviewModal}
        />
      )}
    </>
  );
}
