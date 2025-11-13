import React from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Certifications from './Certifications';

import type { CertificationsProps } from './Certifications';

function getProps(
  overrides?: Partial<CertificationsProps>,
): CertificationsProps {
  return {
    data: {
      certificates: '',
      interests: '',
      skills: '',
    },

    functions: {
      updateCertifications(
        _field: 'certificates' | 'interests' | 'skills',
        _value: string,
      ) {},
    },

    ...overrides,
  };
}

describe('Certifications', () => {
  it('should render as a tabpanel with an accessible name derived from an element with an ID "certifications"', () => {
    render(<div aria-label="Certifications" id="certifications" />);
    render(<Certifications {...getProps()} />);

    const certifications = screen.getByRole('tabpanel', {
      name: 'Certifications',
    });

    expect(certifications).toBeInTheDocument();
  });

  describe('Certificates', () => {
    it('should render a text input for Certificates', () => {
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Certificates' });

      expect(input).toBeInTheDocument();
    });

    it('should call updateCertifications when Certificates is changed', async () => {
      render(<div aria-label="Certifications" id="certifications" />);

      const updateCertificationsMock = jest.fn(
        (_field: 'certificates' | 'interests' | 'skills', _value: string) => {},
      );

      render(
        <Certifications
          {...getProps({
            functions: { updateCertifications: updateCertificationsMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Certificates' });

      await user.type(input, 's');

      expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Interests', () => {
    it('should render a text input for Interests', () => {
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Interests' });

      expect(input).toBeInTheDocument();
    });

    it('should call updateCertifications when Interests is changed', async () => {
      render(<div aria-label="Certifications" id="certifications" />);

      const updateCertificationsMock = jest.fn(
        (_field: 'certificates' | 'interests' | 'skills', _value: string) => {},
      );

      render(
        <Certifications
          {...getProps({
            functions: { updateCertifications: updateCertificationsMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Interests' });

      await user.type(input, 's');

      expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Skills', () => {
    it('should render a text input for Skills', () => {
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...getProps()} />);

      const input = screen.getByRole('textbox', { name: 'Skills' });

      expect(input).toBeInTheDocument();
    });

    it('should call updateCertifications when Skills is changed', async () => {
      render(<div aria-label="Certifications" id="certifications" />);

      const updateCertificationsMock = jest.fn(
        (_field: 'certificates' | 'interests' | 'skills', _value: string) => {},
      );

      render(
        <Certifications
          {...getProps({
            functions: { updateCertifications: updateCertificationsMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const input = screen.getByRole('textbox', { name: 'Skills' });

      await user.type(input, 's');

      expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
    });
  });
});
