import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Personal from './Personal';

import type { PersonalProps } from './Personal';

function getProps(overrides?: Partial<PersonalProps>): PersonalProps {
  return {
    data: {
      address: 'address',
      email: 'email',
      fullName: 'fullName',
      jobTitle: 'jobTitle',
      phone: 'phone',
      summary: 'summary',
    },
    ref: { current: null },
    functions: {
      updatePersonal(
        _field:
          'address' | 'email' | 'fullName' | 'jobTitle' | 'phone' | 'summary',
        _value: string,
      ) {},
    },
    ...overrides,
  };
}

describe('Personal', () => {
  beforeEach(async () => {
    await render(<div aria-label="Personal" id="personal" />);
  });

  it('should render as a tabpanel with an accessible name derived from an element with an ID "personal"', async () => {
    await render(<Personal {...getProps()} />);

    const personal = page.getByRole('tabpanel', { name: 'Personal' });

    await expect.element(personal).toBeInTheDocument();
  });

  it('should pass the section element to `ref.current`', async () => {
    const ref = { current: null };
    await render(<Personal {...getProps({ ref })} />);

    const personal = page.getByRole('tabpanel');

    expect(ref.current).toBe(personal.element());
  });

  describe('Full Name', () => {
    it('should render a text input for Full Name', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', { name: 'Full Name' });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "John Doe" for Full Name', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', {
        name: 'Full Name',
      });

      await expect.element(input).toHaveAttribute('placeholder', 'John Doe');
    });

    it('should pass the correct value to the text input from `data`', async () => {
      const props = getProps();
      await render(<Personal {...props} />);

      const input = page.getByRole('textbox', {
        name: 'Full Name',
      });

      await expect.element(input).toHaveValue(props.data.fullName);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = vi.fn(
        (
          _field:
            'address' | 'email' | 'fullName' | 'jobTitle' | 'phone' | 'summary',
          _value: string,
        ) => {},
      );

      await render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = page.getByRole('textbox', { name: 'Full Name' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Job Title', () => {
    it('should render a text input for Job Title', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', { name: 'Job Title' });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "Frontend Engineer" for Job Title', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', {
        name: 'Job Title',
      });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', 'Frontend Engineer');
    });

    it('should pass the correct value to the text input from `data`', async () => {
      const props = getProps();
      await render(<Personal {...props} />);

      const input = page.getByRole('textbox', {
        name: 'Job Title',
      });

      await expect.element(input).toHaveValue(props.data.jobTitle);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = vi.fn(
        (
          _field:
            'address' | 'email' | 'fullName' | 'jobTitle' | 'phone' | 'summary',
          _value: string,
        ) => {},
      );

      await render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = page.getByRole('textbox', { name: 'Job Title' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Email', () => {
    it('should render a text input for Email', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', { name: 'Email' });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "john.doe@gmail.com" for Email', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', {
        name: 'Email',
      });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', 'john.doe@gmail.com');
    });

    it('should pass the correct value to the text input from `data`', async () => {
      const props = getProps();
      await render(<Personal {...props} />);

      const input = page.getByRole('textbox', {
        name: 'Email',
      });

      await expect.element(input).toHaveValue(props.data.email);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = vi.fn(
        (
          _field:
            'address' | 'email' | 'fullName' | 'jobTitle' | 'phone' | 'summary',
          _value: string,
        ) => {},
      );

      await render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = page.getByRole('textbox', { name: 'Email' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Phone', () => {
    it('should render a text input for Phone', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', { name: 'Phone' });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "+7 666 534-32-33" for Phone', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', {
        name: 'Phone',
      });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', '+7 666 534-32-33');
    });

    it('should pass the correct value to the text input from `data`', async () => {
      const props = getProps();
      await render(<Personal {...props} />);

      const input = page.getByRole('textbox', {
        name: 'Phone',
      });

      await expect.element(input).toHaveValue(props.data.phone);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = vi.fn(
        (
          _field:
            'address' | 'email' | 'fullName' | 'jobTitle' | 'phone' | 'summary',
          _value: string,
        ) => {},
      );

      await render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = page.getByRole('textbox', { name: 'Phone' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Address', () => {
    it('should render a text input for Address', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', { name: 'Address' });

      await expect.element(input).toBeInTheDocument();
    });

    it('should have a placeholder "Cool St, Cambridge" for Address', async () => {
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', {
        name: 'Address',
      });

      await expect
        .element(input)
        .toHaveAttribute('placeholder', 'Cool St, Cambridge');
    });

    it('should pass the correct value to the text input from `data`', async () => {
      const props = getProps();
      await render(<Personal {...getProps()} />);

      const input = page.getByRole('textbox', {
        name: 'Address',
      });

      await expect.element(input).toHaveValue(props.data.address);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = vi.fn(
        (
          _field:
            'address' | 'email' | 'fullName' | 'jobTitle' | 'phone' | 'summary',
          _value: string,
        ) => {},
      );

      await render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = page.getByRole('textbox', { name: 'Address' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Summary', () => {
    it('should render a textarea for Summary', async () => {
      await render(<Personal {...getProps()} />);

      const textarea = page.getByRole('textbox', { name: 'Summary' });

      await expect.element(textarea).toBeInTheDocument();
    });

    it('should have a placeholder "Detail-oriented Frontend Engineer eager to create seamless user experiences." for Summary', async () => {
      await render(<Personal {...getProps()} />);

      const textarea = page.getByRole('textbox', {
        name: 'Summary',
      });

      await expect
        .element(textarea)
        .toHaveAttribute(
          'placeholder',
          'Detail-oriented Frontend Engineer eager to create seamless user experiences.',
        );
    });

    it('should pass the correct value to the textarea from `data`', async () => {
      const props = getProps();
      await render(<Personal {...props} />);

      const textarea = page.getByRole('textbox', {
        name: 'Summary',
      });

      await expect.element(textarea).toHaveValue(props.data.summary);
    });

    it("should call `updatePersonal` when the textarea's value is changed", async () => {
      const updatePersonalMock = vi.fn(
        (
          _field:
            'address' | 'email' | 'fullName' | 'jobTitle' | 'phone' | 'summary',
          _value: string,
        ) => {},
      );

      await render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const textarea = page.getByRole('textbox', { name: 'Summary' });

      await user.type(textarea, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });
});
