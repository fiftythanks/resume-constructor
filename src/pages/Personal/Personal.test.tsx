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

      clear() {},
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

    it('should call `updatePersonal` when Full Name is changed', async () => {
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
            functions: { updatePersonal: updatePersonalMock, clear() {} },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Full Name' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Job Title', () => {
    it('should render a text input for Job Title', () => {
      render(<Personal {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Job Title' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updatePersonal` when Job Title is changed', async () => {
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
            functions: { updatePersonal: updatePersonalMock, clear() {} },
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

    it('should call `updatePersonal` when Email is changed', async () => {
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
            functions: { updatePersonal: updatePersonalMock, clear() {} },
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

    it('should call `updatePersonal` when Phone is changed', async () => {
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
            functions: { updatePersonal: updatePersonalMock, clear() {} },
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

    it('should call `updatePersonal` when Address is changed', async () => {
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
            functions: { updatePersonal: updatePersonalMock, clear() {} },
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
    it('should render a text input for Summary', () => {
      render(<Personal {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Summary' });

      expect(input).toBeInTheDocument();
    });

    it('should call `updatePersonal` when Summary is changed', async () => {
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
            functions: { updatePersonal: updatePersonalMock, clear() {} },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Summary' });

      await user.type(input, 's');

      expect(updatePersonalMock).toHaveBeenCalledTimes(1);
    });
  });
});
