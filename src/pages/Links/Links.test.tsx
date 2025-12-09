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
    firstTabbable: { current: null },
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

  it('should pass the first tabbable element to `firstTabbable.current`', () => {
    // Arrange
    const firstTabbable = { current: null };
    const props = getProps({ firstTabbable });

    render(<div aria-label="Links" id="links" />);
    render(<Links {...props} />);

    // Act
    const firstTabbableNode = screen.getByTestId('first-tabbable-links');

    // Assert
    expect(firstTabbable.current).toBe(firstTabbableNode);
  });

  describe('Website', () => {
    describe('Text', () => {
      it("should render a text input for Website link's text", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input = screen.getByRole('textbox', { name: 'Website (text)' });

        expect(input).toBeInTheDocument();
      });

      it("should have the correct value from `data` for Website link's text", () => {
        const props = getProps();
        render(<div aria-label="Links" id="links" />);
        render(<Links {...props} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Website (text)',
        });

        expect(input.value).toBe(props.data.website.text);
      });

      it("should have a placeholder 'johndoe.com' for Website link's text", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Website (text)',
        });

        expect(input.placeholder).toBe('johndoe.com');
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

      it("should have the correct value from `data` for Website link's URL", () => {
        const props = getProps();
        render(<div aria-label="Links" id="links" />);
        render(<Links {...props} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Website (link)',
        });

        expect(input.value).toBe(props.data.website.link);
      });

      it("should have a placeholder 'https://johndoe.com/' for Website link's URL", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Website (link)',
        });

        expect(input.placeholder).toBe('https://johndoe.com/');
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

      it("should have the correct value from `data` for GitHub's text", () => {
        const props = getProps();
        render(<div aria-label="Links" id="links" />);
        render(<Links {...props} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'GitHub (text)',
        });

        expect(input.value).toBe(props.data.github.text);
      });

      it("should have a placeholder 'github.com/johndoe' for GitHub's text", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'GitHub (text)',
        });

        expect(input.placeholder).toBe('github.com/johndoe');
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

      it("should have the correct value from `data` for GitHub's URL", () => {
        const props = getProps();
        render(<div aria-label="Links" id="links" />);
        render(<Links {...props} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'GitHub (link)',
        });

        expect(input.value).toBe(props.data.github.link);
      });

      it("should have a placeholder 'https://github.com/johndoe/' for GitHub's URL", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'GitHub (link)',
        });

        expect(input.placeholder).toBe('https://github.com/johndoe/');
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

      it("should have the correct value from `data` for LinkedIn link's text", () => {
        const props = getProps();
        render(<div aria-label="Links" id="links" />);
        render(<Links {...props} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'LinkedIn (text)',
        });

        expect(input.value).toBe(props.data.linkedin.text);
      });

      it("should have a placeholder 'linkedin.com/johndoe' for LinkedIn link's text", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'LinkedIn (text)',
        });

        expect(input.placeholder).toBe('linkedin.com/johndoe');
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

      it("should have the correct value from `data` for LinkedIn link's URL", () => {
        const props = getProps();
        render(<div aria-label="Links" id="links" />);
        render(<Links {...props} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'LinkedIn (link)',
        });

        expect(input.value).toBe(props.data.linkedin.link);
      });

      it("should have a placeholder 'https://linkedin.com/johndoe/' for LinkedIn link's URL", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'LinkedIn (link)',
        });

        expect(input.placeholder).toBe('https://linkedin.com/johndoe/');
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

      it("should have the correct value from `data` for Telegram link's text", () => {
        const props = getProps();
        render(<div aria-label="Links" id="links" />);
        render(<Links {...props} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Telegram (text)',
        });

        expect(input.value).toBe(props.data.telegram.text);
      });

      it("should have a placeholder '@johndoe' for Telegram link's text", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Telegram (text)',
        });

        expect(input.placeholder).toBe('@johndoe');
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

      it("should have the correct value from `data` for Telegram link's URL", () => {
        const props = getProps();
        render(<div aria-label="Links" id="links" />);
        render(<Links {...props} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Telegram (link)',
        });

        expect(input.value).toBe(props.data.telegram.link);
      });

      it("should have a placeholder 'https://t.me/johndoe/' for Telegram link's URL", () => {
        render(<div aria-label="Links" id="links" />);
        render(<Links {...getProps()} />);

        const input: HTMLInputElement = screen.getByRole('textbox', {
          name: 'Telegram (link)',
        });

        expect(input.placeholder).toBe('https://t.me/johndoe/');
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
