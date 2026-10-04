import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Certifications from './Certifications';

import type { CertificationsProps } from './Certifications';

type CertificationField = 'certificates' | 'interests' | 'skills';

const DATA: CertificationsProps['data'] = {
  certificates: 'Some certifications',
  interests: 'Some interests',
  skills: 'Some skills',
};

const FUNCTIONS: CertificationsProps['functions'] = {
  updateCertifications(_field: CertificationField, _value: string) {},
};

function getProps(
  overrides?: Partial<CertificationsProps>,
): CertificationsProps {
  return {
    ref: { current: null },
    data: structuredClone(DATA),
    functions: cloneDeep(FUNCTIONS),
    ...overrides,
  };
}

describe('Certifications', () => {
  beforeEach(() => {
    const labelledElement = document.createElement('div');
    labelledElement.id = 'certifications';
    labelledElement.setAttribute('aria-label', 'Certifications');
    document.body.appendChild(labelledElement);
  });

  afterEach(() => {
    document.getElementById('certifications')?.remove();
  });

  it('should render as a tabpanel with an accessible name derived from an element with an ID "certifications"', () => {
    render(<Certifications {...getProps()} />);

    const certifications = screen.getByRole('tabpanel', {
      name: 'Certifications',
    });

    expect(certifications).toBeInTheDocument();
  });

  it('should pass the section element to `ref.current`', () => {
    // Arrange
    const ref = { current: null };

    // Act
    render(<Certifications {...getProps({ ref })} />);
    const certifications = screen.getByRole('tabpanel');

    // Assert
    expect(ref.current).toBe(certifications);
  });

  describe('Text areas', () => {
    const testCases = [
      [
        'Certificates',
        'certificates',
        'List any relevant certifications, e.g., AWS Certified Cloud Practitioner, Google IT Support Professional Certificate.',
        DATA.certificates,
      ],
      [
        'Skills',
        'skills',
        'Highlight key skills not covered elsewhere, e.g., Strategic Planning, Problem Solving, Leadership, Teamwork.',
        DATA.skills,
      ],
      [
        'Interests',
        'interests',
        'Mention relevant interests that showcase personality or relate to the field, e.g., Open Source Contributions, Tech Meetups, Hiking.',
        DATA.interests,
      ],
    ] as const;

    it.each(testCases)(
      'should render %s textarea with placeholder and initial value',
      (name, _field, placeholder, expectedValue) => {
        // Arrange & Act
        render(<Certifications {...getProps()} />);
        const textArea = screen.getByRole('textbox', { name });

        // Assert
        expect(textArea).toBeInTheDocument();
        expect(textArea).toHaveAttribute('placeholder', placeholder);
        expect(textArea).toHaveValue(expectedValue);
      },
    );

    it.each(testCases)(
      'should call `updateCertifications(field, value)` when %s is edited',
      async (name, field, _placeholder, expectedValue) => {
        // Arrange
        const updateCertificationsMock = jest.fn<
          void,
          [CertificationField, string]
        >();
        render(
          <Certifications
            {...getProps({
              functions: { updateCertifications: updateCertificationsMock },
            })}
          />,
        );
        const user = userEvent.setup();
        const textArea = screen.getByRole('textbox', { name });

        // Act
        await user.type(textArea, 's');

        // Assert
        expect(updateCertificationsMock).toHaveBeenCalledTimes(1);
        expect(updateCertificationsMock).toHaveBeenCalledWith(
          field,
          `${expectedValue}s`,
        );
      },
    );
  });
});
