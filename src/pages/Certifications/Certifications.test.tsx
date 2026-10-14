import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Certifications from './Certifications';

import type { CertificationsProps } from './Certifications';

function getProps(
  overrides?: Partial<CertificationsProps>,
): CertificationsProps {
  return {
    ref: { current: null },
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
  it('should render as a tabpanel with an accessible name derived from an element with an ID "certifications"', async () => {
    await render(<div aria-label="Certifications" id="certifications" />);
    await render(<Certifications {...getProps()} />);

    const certifications = page.getByRole('tabpanel', {
      name: 'Certifications',
    });

    await expect.element(certifications).toBeInTheDocument();
  });

  describe('Certificates', () => {
    it('should render a text area for Certificates', async () => {
      await render(<div aria-label="Certifications" id="certifications" />);
      await render(<Certifications {...getProps()} />);

      const textArea = page.getByRole('textbox', { name: 'Certificates' });

      await expect.element(textArea).toBeInTheDocument();
    });

    it('should have the correct value for Certificates from `data`', async () => {
      const props = getProps();
      await render(<div aria-label="Certifications" id="certifications" />);
      await render(<Certifications {...props} />);

      const textArea = page.getByRole('textbox', {
        name: 'Certificates',
      });

      await expect.element(textArea).toHaveValue(props.data.certificates);
    });

    it('should have a placeholder "List any relevant certifications, e.g., AWS Certified Cloud Practitioner, Google IT Support Professional Certificate." for Certificates', async () => {
      const props = getProps();
      await render(<div aria-label="Certifications" id="certifications" />);
      await render(<Certifications {...props} />);

      const textArea = page.getByRole('textbox', {
        name: 'Certificates',
      });

      await expect
        .element(textArea)
        .toHaveAttribute(
          'placeholder',
          'List any relevant certifications, e.g., AWS Certified Cloud Practitioner, Google IT Support Professional Certificate.',
        );
    });

    it('should call `updateCertifications` when the Certificates value is changed via the text area', async () => {
      await render(<div aria-label="Certifications" id="certifications" />);

      const updateCertificationsMock = vi.fn(
        (_field: 'certificates' | 'interests' | 'skills', _value: string) => {},
      );

      await render(
        <Certifications
          {...getProps({
            functions: { updateCertifications: updateCertificationsMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const textArea = page.getByRole('textbox', { name: 'Certificates' });

      await user.type(textArea, 's');

      expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Skills', () => {
    it('should render a text area for Skills', async () => {
      await render(<div aria-label="Certifications" id="certifications" />);
      await render(<Certifications {...getProps()} />);

      const textArea = page.getByRole('textbox', { name: 'Skills' });

      await expect.element(textArea).toBeInTheDocument();
    });

    it('should have the correct value for Skills from `data`', async () => {
      const props = getProps();
      await render(<div aria-label="Certifications" id="certifications" />);
      await render(<Certifications {...props} />);

      const textArea = page.getByRole('textbox', {
        name: 'Skills',
      });

      await expect.element(textArea).toHaveValue(props.data.skills);
    });

    it('should have a placeholder "Highlight key skills not covered elsewhere, e.g., Strategic Planning, Problem Solving, Leadership, Teamwork." for Skills', async () => {
      await render(<div aria-label="Certifications" id="certifications" />);
      await render(<Certifications {...getProps()} />);

      const textArea = page.getByRole('textbox', {
        name: 'Skills',
      });

      await expect
        .element(textArea)
        .toHaveAttribute(
          'placeholder',
          'Highlight key skills not covered elsewhere, e.g., Strategic Planning, Problem Solving, Leadership, Teamwork.',
        );
    });

    it('should call updateCertifications when the Skills value is changed via the text area', async () => {
      await render(<div aria-label="Certifications" id="certifications" />);

      const updateCertificationsMock = vi.fn(
        (_field: 'certificates' | 'interests' | 'skills', _value: string) => {},
      );

      await render(
        <Certifications
          {...getProps({
            functions: { updateCertifications: updateCertificationsMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const textArea = page.getByRole('textbox', { name: 'Skills' });

      await user.type(textArea, 's');

      expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Interests', () => {
    it('should render a text area for Interests', async () => {
      await render(<div aria-label="Certifications" id="certifications" />);
      await render(<Certifications {...getProps()} />);

      const textArea = page.getByRole('textbox', { name: 'Interests' });

      await expect.element(textArea).toBeInTheDocument();
    });

    it('should have the correct value for Interests from `data`', async () => {
      const props = getProps();
      await render(<div aria-label="Certifications" id="certifications" />);
      await render(<Certifications {...props} />);

      const textArea = page.getByRole('textbox', {
        name: 'Interests',
      });

      await expect.element(textArea).toHaveValue(props.data.interests);
    });

    it('should have a placeholder "Mention relevant interests that showcase personality or relate to the field, e.g., Open Source Contributions, Tech Meetups, Hiking." for Interests', async () => {
      await render(<div aria-label="Certifications" id="certifications" />);
      await render(<Certifications {...getProps()} />);

      const textArea = page.getByRole('textbox', {
        name: 'Interests',
      });

      await expect
        .element(textArea)
        .toHaveAttribute(
          'placeholder',
          'Mention relevant interests that showcase personality or relate to the field, e.g., Open Source Contributions, Tech Meetups, Hiking.',
        );
    });

    it('should call `updateCertifications` when the Interests value is changed via the text area', async () => {
      await render(<div aria-label="Certifications" id="certifications" />);

      const updateCertificationsMock = vi.fn(
        (_field: 'certificates' | 'interests' | 'skills', _value: string) => {},
      );

      await render(
        <Certifications
          {...getProps({
            functions: { updateCertifications: updateCertificationsMock },
          })}
        />,
      );

      const user = userEvent.setup();
      const textArea = page.getByRole('textbox', { name: 'Interests' });

      await user.type(textArea, 's');

      expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should pass the section element to `ref.current`', async () => {
    // Arrange
    const ref = { current: null };
    const props = getProps({ ref });

    await render(<div aria-label="Certifications" id="certifications" />);
    await render(<Certifications {...props} />);

    const certifications = page.getByRole('tabpanel');

    // Assert
    expect(ref.current).toBe(certifications.element());
  });
});
