import React, { useEffect, useRef, useState } from 'react';

import AppbarItem from '@/components/AppbarItem';

import clearSrc from '@/assets/icons/clear.svg';
import crossSrc from '@/assets/icons/cross.svg';
import fillSrc from '@/assets/icons/fill.svg';
import hamburgerSrc from '@/assets/icons/hamburger.svg';
import kebabSrc from '@/assets/icons/kebab.svg';
import previewSrc from '@/assets/icons/preview.svg';

import './Toolbar.scss';

export default function Toolbar({
  className,
  clearAll,
  fillAll,
  isNavbarExpanded,
  preview,
  toggleNavbar,
}) {
  const [areControlsExpanded, setAreControlsExpanded] = useState(false);
  const firstControlRef = useRef(null);
  const toggleControlsRef = useRef(null);

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

  const clearAllBtnAttributes = {
    'aria-controls':
      'links skills experience projects education certifications',
    'aria-label': 'Clear All',
    ref: firstControlRef,
    role: 'menuitem',
    // TODO: Add more ARIA attributes when you create actual resume sections!
    id: 'clear-all',
    tabIndex: '-1',
  };

  const previewAttributes = {
    'aria-label': 'Open Preview',
    role: 'menuitem',
    // TODO: Add more ARIA attributes when you create actual resume preview!
    id: 'preview',
    tabIndex: '-1',
  };

  const fillAllBtnAttributes = {
    'aria-controls':
      'personal links skills experience projects education certifications',
    'aria-label': 'Fill All',
    role: 'menuitem',
    // TODO: Add more ARIA attributes when you create actual resume sections!
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
  useEffect(() => {
    if (areControlsExpanded) {
      firstControlRef.current.focus();
    }
  }, [areControlsExpanded]);

  // !Order matters.
  const controls = ['clear-all', 'fill-all', 'preview'];

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
          document.getElementById('clear-all').focus();
        } else {
          document.getElementById(controls[i + 1]).focus();
        }
      }

      if (e.key === 'Tab') {
        e.preventDefault();

        // `e.shifKey === false` behaviour is programmed in AppLayout.
        if (e.shiftKey) {
          toggleControls();
          document.getElementById('toggle-controls').focus();
        }
      }

      if (e.key === 'Escape') {
        toggleControls();
        document.getElementById('toggle-controls').focus();
      }
    }
  }

  function handleBlur(e) {
    if (
      controls.includes(e.target.id) &&
      // Otherwise click on "Toggle Controls" will run `toggleControls()` twice.
      e.relatedTarget !== toggleControlsRef.current
    ) {
      toggleControls();
      toggleControlsRef.current.focus();
    }
  }

  return (
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
          <AppbarItem
            hasInner
            isListItem
            action={clearAll}
            alt="Clear All"
            iconSrc={clearSrc}
            innerAttributes={clearAllBtnAttributes}
            innerClassName="Toolbar-Item Toolbar-Item_clearAll"
          />
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
            action={preview}
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
  );
}
