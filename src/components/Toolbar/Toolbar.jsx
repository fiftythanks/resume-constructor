import React, { useState } from 'react';

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

  function toggleControls() {
    setAreControlsExpanded(!areControlsExpanded);
  }

  const navbarToggleAttributes = {
    'aria-controls': 'navbar',
    'aria-expanded': isNavbarExpanded,
    'aria-label': 'Toggle Navigation',
  };

  const clearAllBtnAttributes = {
    'aria-controls':
      'links skills experience projects education certifications',
    'aria-label': 'Clear All',
    role: 'menuitem',
    // TODO: Add more ARIA attributes when you create actual resume sections!
  };

  const previewAttributes = {
    'aria-label': 'Open Preview',
    role: 'menuitem',
    // TODO: Add more ARIA attributes when you create actual resume preview!
  };

  const fillAllBtnAttributes = {
    'aria-controls':
      'personal links skills experience projects education certifications',
    'aria-label': 'Fill All',
    role: 'menuitem',
    // TODO: Add more ARIA attributes when you create actual resume sections!
  };

  const controlsToggleAttributes = {
    'aria-controls': 'control-btns',
    'aria-expanded': areControlsExpanded,
    'aria-label': 'Toggle Controls',
  };

  return (
    <div className={`Toolbar ${className}`} role="toolbar">
      <AppbarItem
        action={toggleNavbar}
        alt="Toggle Navigation"
        attributes={navbarToggleAttributes}
        className="Toolbar-Item Toolbar-Item_toggleNavbar"
        iconSrc={isNavbarExpanded ? crossSrc : hamburgerSrc}
      />
      <div
        aria-orientation="horizontal"
        className={`Toolbar-ControlsWrapper${areControlsExpanded ? '' : ' Toolbar-ControlsWrapper_hidden'}`}
        id="control-btns"
        role="menu"
      >
        <ul className="Toolbar-ControlsList">
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
