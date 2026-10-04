import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cloneDeep from 'lodash/cloneDeep';
import '@testing-library/jest-dom';

import Personal from './Personal';

import type { PersonalProps } from './Personal';

type Field =
  | 'address'
  | 'email'
  | 'fullName'
  | 'jobTitle'
  | 'phone'
  | 'summary';

const DATA: PersonalProps['data'] = {
  address: 'address',
  email: 'email',
  fullName: 'fullName',
  jobTitle: 'jobTitle',
  phone: 'phone',
  summary: 'summary',
};

const FUNCTIONS: PersonalProps['functions'] = {
  updatePersonal(_field: Field, _value: string) {},
};

function getProps(overrides?: Partial<PersonalProps>): PersonalProps {
  return {
    data: structuredClone(DATA),
    ref: { current: null },
    functions: cloneDeep(FUNCTIONS),
    ...overrides,
  };
}

describe('Personal', () => {
  beforeEach(() => {
    const labelledElement = document.createElement('div');
    labelledElement.id = 'personal';
    labelledElement.setAttribute('aria-label', 'Personal');
    document.body.appendChild(labelledElement);
  });

  afterEach(() => {
    document.getElementById('personal')?.remove();
  });

  it('should render as a tabpanel with an accessible name derived from an element with an ID "personal"', () => {
    render(<Personal {...getProps()} />);

    const personal = screen.getByRole('tabpanel', { name: 'Personal' });

    expect(personal).toBeInTheDocument();
  });

  it('should pass the section element to `ref.current`', () => {
    // Arrange
    const ref = { current: null };

    // Act
    render(<Personal {...getProps({ ref })} />);
    const personal = screen.getByRole('tabpanel');

    // Assert
    expect(ref.current).toBe(personal);
  });

  describe('Fields', () => {
    it.each([
      ['Full Name', 'John Doe', DATA.fullName],
      ['Job Title', 'Frontend Engineer', DATA.jobTitle],
      ['Email', 'john.doe@gmail.com', DATA.email],
      ['Phone', '+7 666 534-32-33', DATA.phone],
      ['Address', 'Cool St, Cambridge', DATA.address],
      [
        'Summary',
        'Detail-oriented Frontend Engineer eager to create seamless user experiences.',
        DATA.summary,
      ],
    ] as const)(
      'should render %s input with placeholder and initial value',
      (name, placeholder, expectedValue) => {
        // Arrange & Act
        render(<Personal {...getProps()} />);
        const input = screen.getByRole('textbox', { name });

        // Assert
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', placeholder);
        expect(input).toHaveValue(expectedValue);
      },
    );

    it.each([
      ['Full Name', 'fullName', `${DATA.fullName}s`],
      ['Job Title', 'jobTitle', `${DATA.jobTitle}s`],
      ['Email', 'email', `${DATA.email}s`],
      ['Phone', 'phone', `${DATA.phone}s`],
      ['Address', 'address', `${DATA.address}s`],
      ['Summary', 'summary', `${DATA.summary}s`],
    ] as const)(
      'should call `updatePersonal(field, value)` when %s is edited',
      async (name, field, expectedValue) => {
        // Arrange
        const updatePersonalMock = jest.fn<void, [Field, string]>();
        render(
          <Personal
            {...getProps({
              functions: { updatePersonal: updatePersonalMock },
            })}
          />,
        );
        const user = userEvent.setup();
        const input = screen.getByRole('textbox', { name });

        // Act
        await user.type(input, 's');

        // Assert
        expect(updatePersonalMock).toHaveBeenCalledTimes(1);
        expect(updatePersonalMock).toHaveBeenCalledWith(field, expectedValue);
      },
    );
  });
});
