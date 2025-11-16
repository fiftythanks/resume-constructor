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
    it('should render a text area for Certificates', () => {
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...getProps()} />);

      const textArea = screen.getByRole('textbox', { name: 'Certificates' });

      expect(textArea).toBeInTheDocument();
    });

    it('should have the correct value for Certificates from `data`', () => {
      const props = getProps();
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...props} />);

      const textArea: HTMLTextAreaElement = screen.getByRole('textbox', {
        name: 'Certificates',
      });

      expect(textArea.value).toBe(props.data.certificates);
    });

    it('should have a placeholder "List any relevant certifications, e.g., AWS Certified Cloud Practitioner, Google IT Support Professional Certificate." for Certificates', () => {
      const props = getProps();
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...props} />);

      const textArea: HTMLTextAreaElement = screen.getByRole('textbox', {
        name: 'Certificates',
      });

      expect(textArea.placeholder).toBe(
        'List any relevant certifications, e.g., AWS Certified Cloud Practitioner, Google IT Support Professional Certificate.',
      );
    });

    it('should call `updateCertifications` when the Certificates value is changed via the text area', async () => {
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
      const textArea = screen.getByRole('textbox', { name: 'Certificates' });

      await user.type(textArea, 's');

      expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Skills', () => {
    it('should render a text area for Skills', () => {
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...getProps()} />);

      const textArea = screen.getByRole('textbox', { name: 'Skills' });

      expect(textArea).toBeInTheDocument();
    });

    it('should have the correct value for Skills from `data`', () => {
      const props = getProps();
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...props} />);

      const textArea: HTMLTextAreaElement = screen.getByRole('textbox', {
        name: 'Skills',
      });

      expect(textArea.value).toBe(props.data.skills);
    });

    it('should have a placeholder "Highlight key skills not covered elsewhere, e.g., Strategic Planning, Problem Solving, Leadership, Teamwork." for Skills', () => {
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...getProps()} />);

      const textArea: HTMLTextAreaElement = screen.getByRole('textbox', {
        name: 'Skills',
      });

      expect(textArea.placeholder).toBe(
        'Highlight key skills not covered elsewhere, e.g., Strategic Planning, Problem Solving, Leadership, Teamwork.',
      );
    });

    it('should call updateCertifications when the Skills value is changed via the text area', async () => {
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
      const textArea = screen.getByRole('textbox', { name: 'Skills' });

      await user.type(textArea, 's');

      expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Interests', () => {
    it('should render a text area for Interests', () => {
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...getProps()} />);

      const textArea = screen.getByRole('textbox', { name: 'Interests' });

      expect(textArea).toBeInTheDocument();
    });

    it('should have the correct value for Interests from `data`', () => {
      const props = getProps();
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...props} />);

      const textArea: HTMLTextAreaElement = screen.getByRole('textbox', {
        name: 'Interests',
      });

      expect(textArea.value).toBe(props.data.interests);
    });

    it('should have a placeholder "Mention relevant interests that showcase personality or relate to the field, e.g., Open Source Contributions, Tech Meetups, Hiking." for Interests', () => {
      render(<div aria-label="Certifications" id="certifications" />);
      render(<Certifications {...getProps()} />);

      const textArea: HTMLTextAreaElement = screen.getByRole('textbox', {
        name: 'Interests',
      });

      expect(textArea.placeholder).toBe(
        'Mention relevant interests that showcase personality or relate to the field, e.g., Open Source Contributions, Tech Meetups, Hiking.',
      );
    });

    it('should call `updateCertifications` when the Interests value is changed via the text area', async () => {
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
      const textArea = screen.getByRole('textbox', { name: 'Interests' });

      await user.type(textArea, 's');

      expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
    });
  });
});
