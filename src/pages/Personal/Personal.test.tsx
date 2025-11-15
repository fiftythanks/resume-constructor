import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

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

    functions: {
      updatePersonal(
        _field:
          | 'address'
          | 'email'
          | 'fullName'
          | 'jobTitle'
          | 'phone'
          | 'summary',
        _value: string,
      ) {},
    },

    ...overrides,
  };
}

describe('Personal', () => {
  render(<div aria-label="Personal" id="personal" />);

  it('should render as a tabpanel with an accessible name derived from an element with an ID "personal"', () => {
    render(<Personal {...getProps()} />);

    const personal = screen.getByRole('tabpanel', { name: 'Personal' });

    expect(personal).toBeInTheDocument();
  });

  describe('Full Name', () => {
    it('should render a text input for Full Name', () => {
      render(<Personal {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Full Name' });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "John Doe" for Full Name', () => {
      render(<Personal {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Full Name',
      });

      expect(input.placeholder).toBe('John Doe');
    });

    it('should pass the correct value to the text input from `data`', () => {
      const props = getProps();
      render(<Personal {...props} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Full Name',
      });

      expect(input.value).toBe(props.data.fullName);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = jest.fn(
        (
          _field:
            | 'address'
            | 'email'
            | 'fullName'
            | 'jobTitle'
            | 'phone'
            | 'summary',
          _value: string,
        ) => {},
      );

      render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Full Name' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('Job Title', () => {
    it('should render a text input for Job Title', () => {
      render(<Personal {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Job Title' });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "Frontend Engineer" for Job Title', () => {
      render(<Personal {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Job Title',
      });

      expect(input.placeholder).toBe('Frontend Engineer');
    });

    it('should pass the correct value to the text input from `data`', () => {
      const props = getProps();
      render(<Personal {...props} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Job Title',
      });

      expect(input.value).toBe(props.data.jobTitle);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = jest.fn(
        (
          _field:
            | 'address'
            | 'email'
            | 'fullName'
            | 'jobTitle'
            | 'phone'
            | 'summary',
          _value: string,
        ) => {},
      );

      render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Job Title' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Email', () => {
    it('should render a text input for Email', () => {
      render(<Personal {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Email' });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "john.doe@gmail.com" for Email', () => {
      render(<Personal {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Email',
      });

      expect(input.placeholder).toBe('john.doe@gmail.com');
    });

    it('should pass the correct value to the text input from `data`', () => {
      const props = getProps();
      render(<Personal {...props} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Email',
      });

      expect(input.value).toBe(props.data.email);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = jest.fn(
        (
          _field:
            | 'address'
            | 'email'
            | 'fullName'
            | 'jobTitle'
            | 'phone'
            | 'summary',
          _value: string,
        ) => {},
      );

      render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Email' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Phone', () => {
    it('should render a text input for Phone', () => {
      render(<Personal {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Phone' });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "+7 666 534-32-33" for Phone', () => {
      render(<Personal {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Phone',
      });

      expect(input.placeholder).toBe('+7 666 534-32-33');
    });

    it('should pass the correct value to the text input from `data`', () => {
      const props = getProps();
      render(<Personal {...props} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Phone',
      });

      expect(input.value).toBe(props.data.phone);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = jest.fn(
        (
          _field:
            | 'address'
            | 'email'
            | 'fullName'
            | 'jobTitle'
            | 'phone'
            | 'summary',
          _value: string,
        ) => {},
      );

      render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Phone' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Address', () => {
    it('should render a text input for Address', () => {
      render(<Personal {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Address' });

      expect(input).toBeInTheDocument();
    });

    it('should have a placeholder "Cool St, Cambridge" for Address', () => {
      render(<Personal {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Address',
      });

      expect(input.placeholder).toBe('Cool St, Cambridge');
    });

    it('should pass the correct value to the text input from `data`', () => {
      const props = getProps();
      render(<Personal {...getProps()} />);

      const input: HTMLInputElement = screen.getByRole('textbox', {
        name: 'Address',
      });

      expect(input.value).toBe(props.data.address);
    });

    it("should call `updatePersonal` when the text input's value is changed", async () => {
      const updatePersonalMock = jest.fn(
        (
          _field:
            | 'address'
            | 'email'
            | 'fullName'
            | 'jobTitle'
            | 'phone'
            | 'summary',
          _value: string,
        ) => {},
      );

      render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Address' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Summary', () => {
    it('should render a textarea for Summary', () => {
      render(<Personal {...getProps()} />);

      const textarea = screen.getByRole('textbox', { name: 'Summary' });

      expect(textarea).toBeInTheDocument();
    });

    it('should have a placeholder "Detail-oriented Frontend Engineer eager to create seamless user experiences." for Summary', () => {
      render(<Personal {...getProps()} />);

      const textarea: HTMLTextAreaElement = screen.getByRole('textbox', {
        name: 'Summary',
      });

      expect(textarea.placeholder).toBe(
        'Detail-oriented Frontend Engineer eager to create seamless user experiences.',
      );
    });

    it('should pass the correct value to the textarea from `data`', () => {
      const props = getProps();
      render(<Personal {...props} />);

      const textarea: HTMLTextAreaElement = screen.getByRole('textbox', {
        name: 'Summary',
      });

      expect(textarea.value).toBe(props.data.summary);
    });

    it("should call `updatePersonal` when the textarea's value is changed", async () => {
      const updatePersonalMock = jest.fn(
        (
          _field:
            | 'address'
            | 'email'
            | 'fullName'
            | 'jobTitle'
            | 'phone'
            | 'summary',
          _value: string,
        ) => {},
      );

      render(
        <Personal
          {...getProps({
            functions: { updatePersonal: updatePersonalMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const textarea = screen.getByRole('textbox', { name: 'Summary' });

      await user.type(textarea, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });
});
