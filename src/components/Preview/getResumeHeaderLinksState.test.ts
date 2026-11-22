import getResumeHeaderLinksState from './getResumeHeaderLinksState';

import type { Links } from '@/types/resumeData';

const EMPTY_LINKS: Links = {
  github: { link: '', text: '' },
  linkedin: { link: '', text: '' },
  telegram: { link: '', text: '' },
  website: { link: '', text: '' },
};

const FILLED_LINKS: Links = {
  github: { link: 'https://github.com/johndoe', text: 'GitHub' },
  linkedin: { link: 'https://linkedin.com/in/johndoe', text: '' },
  telegram: { link: 'https://t.me/johndoe', text: 'Telegram' },
  website: { link: '', text: '' },
};

describe('getResumeHeaderLinksState', () => {
  it('should show inline email when the links section is inactive and email is non-empty', () => {
    const state = getResumeHeaderLinksState(
      ['personal', 'experience'],
      'john.doe@johndoe.com',
      EMPTY_LINKS,
    );

    expect(state).toEqual({
      activeCustomLinks: [],
      hasLinksSection: false,
      hasVisibleLinks: false,
      shouldShowInlineEmail: true,
    });
  });

  it('should not show inline email when email is empty', () => {
    const state = getResumeHeaderLinksState(
      ['personal', 'experience'],
      '',
      EMPTY_LINKS,
    );

    expect(state.shouldShowInlineEmail).toBe(false);
  });

  it('should hide inline email and show visible links row when the links section is active and email is provided', () => {
    const state = getResumeHeaderLinksState(
      ['personal', 'links'],
      'john.doe@johndoe.com',
      EMPTY_LINKS,
    );

    expect(state).toEqual({
      activeCustomLinks: [],
      hasLinksSection: true,
      hasVisibleLinks: true,
      shouldShowInlineEmail: false,
    });
  });

  it('should filter custom links to only those with non-empty anchor text', () => {
    const state = getResumeHeaderLinksState(
      ['personal', 'links'],
      '',
      FILLED_LINKS,
    );

    expect(state).toEqual({
      activeCustomLinks: [
        {
          item: { link: 'https://github.com/johndoe', text: 'GitHub' },
          type: 'github',
        },
        {
          item: { link: 'https://t.me/johndoe', text: 'Telegram' },
          type: 'telegram',
        },
      ],
      hasLinksSection: true,
      hasVisibleLinks: true,
      shouldShowInlineEmail: false,
    });
  });

  it('should set `hasVisibleLinks` to `false` when the links section is active but both email and custom links are empty', () => {
    const state = getResumeHeaderLinksState(
      ['personal', 'links'],
      '',
      EMPTY_LINKS,
    );

    expect(state.hasVisibleLinks).toBe(false);
  });
});
