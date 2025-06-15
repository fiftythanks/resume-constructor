import React from 'react';

import AppbarItem from '@/components/AppbarItem';

import cross from '@/assets/icons/cross.svg';
import hamburger from '@/assets/icons/hamburger.svg';

import './Toolbar.scss';

export default function Toolbar({ isNavbarExpanded, toggleNavbar, className }) {
  const navbarToggleAttributes = {
    'aria-controls': 'navbar',
    'aria-expanded': isNavbarExpanded,
    'aria-label': 'Toggle Navigation',
  };

  return (
    <div className={`Toolbar ${className}`} role="toolbar">
      <AppbarItem
        action={toggleNavbar}
        alt="Toggle Navigation"
        attributes={navbarToggleAttributes}
        iconSrc={isNavbarExpanded ? cross : hamburger}
      />
    </div>
  );
}
