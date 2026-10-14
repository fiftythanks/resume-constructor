import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

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
    ref: { current: null },
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
  it('should render as a tabpanel with an accessible name derived from an element with an ID "links"', async () => {
    await render(<div aria-label="Links" id="links" />);
    await render(<Links {...getProps()} />);

    const links = page.getByRole('tabpanel', { name: 'Links' });

    await expect.element(links).toBeInTheDocument();
  });

  it('should pass the section element to `ref.current`', async () => {
    // Arrange
    const ref = { current: null };
    const props = getProps({ ref });

    await render(<div aria-label="Links" id="links" />);
    await render(<Links {...props} />);

    // Act
    const links = page.getByRole('tabpanel');

    // Assert
    expect(ref.current).toBe(links.element());
  });

  describe('Website', () => {
    describe('Text', () => {
      it("should render a text input for Website link's text", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'Website (text)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have the correct value from `data` for Website link's text", async () => {
        const props = getProps();
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...props} />);

        const input = page.getByRole('textbox', {
          name: 'Website (text)',
        });

        await expect.element(input).toHaveValue(props.data.website.text);
      });

      it("should have a placeholder 'johndoe.com' for Website link's text", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Website (text)',
        });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'johndoe.com');
      });

      it("should call `updateLinks` when Website link's text is changed via the corresponding text input", async () => {
        await render(<div aria-label="Links" id="links" />);

        const updateLinksMock = vi.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'Website (text)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for Website link's URL", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'Website (link)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have the correct value from `data` for Website link's URL", async () => {
        const props = getProps();
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...props} />);

        const input = page.getByRole('textbox', {
          name: 'Website (link)',
        });

        await expect.element(input).toHaveValue(props.data.website.link);
      });

      it("should have a placeholder 'https://johndoe.com/' for Website link's URL", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Website (link)',
        });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'https://johndoe.com/');
      });

      it("should call `updateLinks` when Website link's URL is changed via the corresponding text input", async () => {
        await render(<div aria-label="Links" id="links" />);

        const updateLinksMock = vi.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'Website (link)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GitHub', () => {
    describe('Text', () => {
      it("should render a text input for GitHub link's text", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'GitHub (text)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have the correct value from `data` for GitHub's text", async () => {
        const props = getProps();
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...props} />);

        const input = page.getByRole('textbox', {
          name: 'GitHub (text)',
        });

        await expect.element(input).toHaveValue(props.data.github.text);
      });

      it("should have a placeholder 'github.com/johndoe' for GitHub's text", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'GitHub (text)',
        });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'github.com/johndoe');
      });

      it("should call `updateLinks` when GitHub link's text is changed via the corresponding text input", async () => {
        await render(<div aria-label="Links" id="links" />);

        const updateLinksMock = vi.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'GitHub (text)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for GitHub link's URL", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'GitHub (link)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have the correct value from `data` for GitHub's URL", async () => {
        const props = getProps();
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...props} />);

        const input = page.getByRole('textbox', {
          name: 'GitHub (link)',
        });

        await expect.element(input).toHaveValue(props.data.github.link);
      });

      it("should have a placeholder 'https://github.com/johndoe/' for GitHub's URL", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'GitHub (link)',
        });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'https://github.com/johndoe/');
      });

      it("should call `updateLinks` when GitHub link's URL is changed via the corresponding text input", async () => {
        await render(<div aria-label="Links" id="links" />);

        const updateLinksMock = vi.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'GitHub (link)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('LinkedIn', () => {
    describe('Text', () => {
      it("should render a text input for LinkedIn link's text", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'LinkedIn (text)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have the correct value from `data` for LinkedIn link's text", async () => {
        const props = getProps();
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...props} />);

        const input = page.getByRole('textbox', {
          name: 'LinkedIn (text)',
        });

        await expect.element(input).toHaveValue(props.data.linkedin.text);
      });

      it("should have a placeholder 'linkedin.com/johndoe' for LinkedIn link's text", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'LinkedIn (text)',
        });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'linkedin.com/johndoe');
      });

      it("should call `updateLinks` when LinkedIn link's text is changed via the corresponding text input", async () => {
        await render(<div aria-label="Links" id="links" />);

        const updateLinksMock = vi.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'LinkedIn (text)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for LinkedIn link's URL", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'LinkedIn (link)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have the correct value from `data` for LinkedIn link's URL", async () => {
        const props = getProps();
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...props} />);

        const input = page.getByRole('textbox', {
          name: 'LinkedIn (link)',
        });

        await expect.element(input).toHaveValue(props.data.linkedin.link);
      });

      it("should have a placeholder 'https://linkedin.com/johndoe/' for LinkedIn link's URL", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'LinkedIn (link)',
        });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'https://linkedin.com/johndoe/');
      });

      it("should call `updateLinks` when LinkedIn link's URL is changed", async () => {
        await render(<div aria-label="Links" id="links" />);

        const updateLinksMock = vi.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'LinkedIn (link)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Telegram', () => {
    describe('Text', () => {
      it("should render a text input for Telegram link's text", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'Telegram (text)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have the correct value from `data` for Telegram link's text", async () => {
        const props = getProps();
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...props} />);

        const input = page.getByRole('textbox', {
          name: 'Telegram (text)',
        });

        await expect.element(input).toHaveValue(props.data.telegram.text);
      });

      it("should have a placeholder '@johndoe' for Telegram link's text", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Telegram (text)',
        });

        await expect.element(input).toHaveAttribute('placeholder', '@johndoe');
      });

      it("should call `updateLinks` when Telegram link's text is changed via the corresponding text input", async () => {
        await render(<div aria-label="Links" id="links" />);

        const updateLinksMock = vi.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'Telegram (text)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('URL', () => {
      it("should render a text input for Telegram link's URL", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', { name: 'Telegram (link)' });

        await expect.element(input).toBeInTheDocument();
      });

      it("should have the correct value from `data` for Telegram link's URL", async () => {
        const props = getProps();
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...props} />);

        const input = page.getByRole('textbox', {
          name: 'Telegram (link)',
        });

        await expect.element(input).toHaveValue(props.data.telegram.link);
      });

      it("should have a placeholder 'https://t.me/johndoe/' for Telegram link's URL", async () => {
        await render(<div aria-label="Links" id="links" />);
        await render(<Links {...getProps()} />);

        const input = page.getByRole('textbox', {
          name: 'Telegram (link)',
        });

        await expect
          .element(input)
          .toHaveAttribute('placeholder', 'https://t.me/johndoe/');
      });

      it("should call `updateLinks` when Telegram link's URL is changed via the corresponding text input", async () => {
        await render(<div aria-label="Links" id="links" />);

        const updateLinksMock = vi.fn(
          (
            _field: 'github' | 'linkedin' | 'telegram' | 'website',
            _type: 'link' | 'text',
            _value: string,
          ) => {},
        );

        await render(
          <Links
            {...getProps({ functions: { updateLinks: updateLinksMock } })}
          />,
        );

        const user = userEvent.setup();
        const input = page.getByRole('textbox', { name: 'Telegram (link)' });

        await user.type(input, 's');

        expect(updateLinksMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
