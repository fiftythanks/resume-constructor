import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Links from './Links';

import type { LinksProps } from './Links';

type LinkField = 'github' | 'linkedin' | 'telegram' | 'website';
type LinkType = 'link' | 'text';

const DATA: LinksProps['data'] = {
  github: {
    link: 'https://github.com/johndoe/',
    text: 'github.com/johndoe',
  },
  linkedin: {
    link: 'https://linkedin.com/johndoe/',
    text: 'linkedin.com/johndoe',
  },
  telegram: {
    link: 'https://t.me/johndoe/',
    text: '@johndoe',
  },
  website: {
    link: 'https://johndoe.com/',
    text: 'johndoe.com',
  },
};

const FUNCTIONS: LinksProps['functions'] = {
  updateLinks(_field: LinkField, _type: LinkType, _value: string) {},
};

function getProps(overrides?: Partial<LinksProps>): LinksProps {
  return {
    data: structuredClone(DATA),
    ref: { current: null },
    functions: cloneDeep(FUNCTIONS),
    ...overrides,
  };
}

describe('Links', () => {
  beforeEach(() => {
    const labelledElement = document.createElement('div');
    labelledElement.id = 'links';
    labelledElement.setAttribute('aria-label', 'Links');
    document.body.appendChild(labelledElement);
  });

  afterEach(() => {
    document.getElementById('links')?.remove();
  });

  it('should render as a tabpanel with an accessible name derived from an element with an ID "links"', () => {
    render(<Links {...getProps()} />);

    const links = screen.getByRole('tabpanel', { name: 'Links' });

    expect(links).toBeInTheDocument();
  });

  it('should pass the section element to `ref.current`', () => {
    // Arrange
    const ref = { current: null };

    // Act
    render(<Links {...getProps({ ref })} />);
    const links = screen.getByRole('tabpanel');

    // Assert
    expect(ref.current).toBe(links);
  });

  describe('Link inputs', () => {
    const testCases = [
      ['Website (text)', 'website', 'text', 'johndoe.com', DATA.website.text],
      [
        'Website (link)',
        'website',
        'link',
        'https://johndoe.com/',
        DATA.website.link,
      ],
      [
        'GitHub (text)',
        'github',
        'text',
        'github.com/johndoe',
        DATA.github.text,
      ],
      [
        'GitHub (link)',
        'github',
        'link',
        'https://github.com/johndoe/',
        DATA.github.link,
      ],
      [
        'LinkedIn (text)',
        'linkedin',
        'text',
        'linkedin.com/johndoe',
        DATA.linkedin.text,
      ],
      [
        'LinkedIn (link)',
        'linkedin',
        'link',
        'https://linkedin.com/johndoe/',
        DATA.linkedin.link,
      ],
      ['Telegram (text)', 'telegram', 'text', '@johndoe', DATA.telegram.text],
      [
        'Telegram (link)',
        'telegram',
        'link',
        'https://t.me/johndoe/',
        DATA.telegram.link,
      ],
    ] as const;

    it.each(testCases)(
      'should render %s input with placeholder and value',
      (name, _field, _type, placeholder, expectedValue) => {
        // Arrange & Act
        render(<Links {...getProps()} />);
        const input = screen.getByRole('textbox', { name });

        // Assert
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', placeholder);
        expect(input).toHaveValue(expectedValue);
      },
    );

    it.each(testCases)(
      'should call `updateLinks(field, type, value)` when %s is edited',
      async (name, field, type, _placeholder, expectedValue) => {
        // Arrange
        const updateLinksMock = jest.fn<void, [LinkField, LinkType, string]>();
        render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );
        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name });

        // Act
        await user.type(input, 's');

        // Assert
        expect(updateLinksMock).toHaveBeenCalledTimes(1);
        expect(updateLinksMock).toHaveBeenCalledWith(
          field,
          type,
          `${expectedValue}s`,
        );
      },
    );
  });
});
