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

describe('Links', () => {
  it('should render as a tabpanel with an accessible name derived from an element with an ID "links"', () => {
    render(<div aria-label="Links" id="links" />);
    render(<Links {...getProps()} />);

    const links = screen.getByRole('tabpanel', { name: 'Links' });

    expect(links).toBeInTheDocument();
  });

  describe('Website (text)', () => {
    it('should render a text input for Website (text)', () => {
      render(<div aria-label="Links" id="links" />);
      render(<Links {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Website (text)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updateLinks` when Website (text) is changed', async () => {
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

  describe('Website (link)', () => {
    it('should render a text input for Website (link)', () => {
      render(<div aria-label="Links" id="links" />);
      render(<Links {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Website (link)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updateLinks` when Website (link) is changed', async () => {
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

  describe('GitHub (text)', () => {
    it('should render a text input for GitHub (text)', () => {
      render(<div aria-label="Links" id="links" />);
      render(<Links {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'GitHub (text)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updateLinks` when GitHub (text) is changed', async () => {
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

  describe('GitHub (link)', () => {
    it('should render a text input for GitHub (link)', () => {
      render(<div aria-label="Links" id="links" />);
      render(<Links {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'GitHub (link)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updateLinks` when GitHub (link) is changed', async () => {
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

  describe('LinkedIn (text)', () => {
    it('should render a text input for LinkedIn (text)', () => {
      render(<div aria-label="Links" id="links" />);
      render(<Links {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'LinkedIn (text)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updateLinks` when LinkedIn (text) is changed', async () => {
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

  describe('LinkedIn (link)', () => {
    it('should render a text input for LinkedIn (link)', () => {
      render(<div aria-label="Links" id="links" />);
      render(<Links {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'LinkedIn (link)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updateLinks` when LinkedIn (link) is changed', async () => {
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

  describe('Telegram (text)', () => {
    it('should render a text input for Telegram (text)', () => {
      render(<div aria-label="Links" id="links" />);
      render(<Links {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Telegram (text)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updateLinks` when Telegram (text) is changed', async () => {
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

  describe('Telegram (link)', () => {
    it('should render a text input for Telegram (link)', () => {
      render(<div aria-label="Links" id="links" />);
      render(<Links {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Telegram (link)' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updateLinks` when Telegram (link) is changed', async () => {
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
