import React from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Links from './Links';

import type { LinksProps } from './Links';

function getProps(overrides?: Partial<LinksProps>): LinksProps {
  return {
    data: {
      github: {
        link: '',
        text: '',
      },

      linkedin: {
        link: '',
        text: '',
      },

      telegram: {
        link: '',
        text: '',
      },

      website: {
        link: '',
        text: '',
      },
    },

    functions: {
      updateLinks(
        _field: 'github' | 'linkedin' | 'telegram' | 'website',
        _type: 'link' | 'text',
        _value: string,
      ) {},
    },

    ...overrides,
  };
}

// values
// placeholders

describe('Links', () => {
  it('should render as a tabpanel with an accessible name derived from an element with an ID "links"', () => {
    render(<div aria-label="Links" id="links" />);
    render(<Links {...getProps()} />);

    const links = screen.getByRole('tabpanel', { name: 'Links' });

    expect(links).toBeInTheDocument();
  });

  describe('Website', () => {
    describe('Text', () => {
      it("should render a text input for Website link's text", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'Website (text)' });

        expect(input).toBeInTheDocument();
      });

      it("should call `updateLinks` when Website link's text is changed via the corresponding text input", async () => {
        render(<div aria-label="Links" id="links" />);

        const updateLinksMock = jest.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'Website (text)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for Website link's URL", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'Website (link)' });

        expect(input).toBeInTheDocument();
      });

      it("should call `updateLinks` when Website link's URL is changed via the corresponding text input", async () => {
        render(<div aria-label="Links" id="links" />);

        const updateLinksMock = jest.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'Website (link)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GitHub', () => {
    describe('Text', () => {
      it("should render a text input for GitHub link's text", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'GitHub (text)' });

        expect(input).toBeInTheDocument();
      });

      it("should call `updateLinks` when GitHub link's text is changed via the corresponding text input", async () => {
        render(<div aria-label="Links" id="links" />);

        const updateLinksMock = jest.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'GitHub (text)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for GitHub link's URL", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'GitHub (link)' });

        expect(input).toBeInTheDocument();
      });

      it("should call `updateLinks` when GitHub link's URL is changed via the corresponding text input", async () => {
        render(<div aria-label="Links" id="links" />);

        const updateLinksMock = jest.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'GitHub (link)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('LinkedIn', () => {
    describe('Text', () => {
      it("should render a text input for LinkedIn link's text", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'LinkedIn (text)' });

        expect(input).toBeInTheDocument();
      });

      it("should call `updateLinks` when LinkedIn link's text is changed via the corresponding text input", async () => {
        render(<div aria-label="Links" id="links" />);

        const updateLinksMock = jest.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'LinkedIn (text)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for LinkedIn link's URL", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'LinkedIn (link)' });

        expect(input).toBeInTheDocument();
      });

      it("should call `updateLinks` when LinkedIn link's URL is changed", async () => {
        render(<div aria-label="Links" id="links" />);

        const updateLinksMock = jest.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'LinkedIn (link)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Telegram', () => {
    describe('Text', () => {
      it("should render a text input for Telegram link's text", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'Telegram (text)' });

        expect(input).toBeInTheDocument();
      });

      it("should call `updateLinks` when Telegram link's text is changed via the corresponding text input", async () => {
        render(<div aria-label="Links" id="links" />);

        const updateLinksMock = jest.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'Telegram (text)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for Telegram link's URL", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'Telegram (link)' });

        expect(input).toBeInTheDocument();
      });

      it("should call `updateLinks` when Telegram link's URL is changed via the corresponding text input", async () => {
        render(<div aria-label="Links" id="links" />);

        const updateLinksMock = jest.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name: 'Telegram (link)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
