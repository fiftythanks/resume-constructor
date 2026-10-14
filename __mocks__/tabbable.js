import { vi } from 'vitest';

const lib = await vi.importActual('tabbable');

const tabbable = (node, options) =>
  lib.tabbable(node, { ...options, displayCheck: 'none' });

const focusable = (node, options) =>
  lib.focusable(node, { ...options, displayCheck: 'none' });

const isFocusable = (node, options) =>
  lib.isFocusable(node, { ...options, displayCheck: 'none' });

const isTabbable = (node, options) =>
  lib.isTabbable(node, { ...options, displayCheck: 'none' });

const getTabIndex = lib.getTabIndex;

export { focusable, getTabIndex, isFocusable, isTabbable, tabbable };
