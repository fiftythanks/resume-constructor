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
        <AppbarItem
          action={clearAll}
          alt="Clear All"
          attributes={clearAllBtnAttributes}
          className="Toolbar-Item Toolbar-Item_clearAll"
          iconSrc={clearSrc}
        />
        <AppbarItem
          action={fillAll}
          alt="Fill All"
          attributes={fillAllBtnAttributes}
          className="Toolbar-Item Toolbar-Item_fillAll"
          iconSrc={fillSrc}
        />
        <AppbarItem
          action={preview}
          alt="Preview"
          attributes={previewAttributes}
          className="Toolbar-Item Toolbar-Item_preview"
          iconSrc={previewSrc}
        />
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
