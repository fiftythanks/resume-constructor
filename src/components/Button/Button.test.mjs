import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Button from './Button';

describe('Button', () => {
  it('renders with the correct accessible name from its children', () => {
    render(<Button>Click me</Button>);

    const btn = screen.getByRole('button', { name: /click me/i });

    expect(btn).toBeInTheDocument();
  });

  it('uses the `label` prop for its accessible name when provided', () => {
    render(<Button label="Close Dialog">X</Button>);

    const btn = screen.getByRole('button', { name: /close dialog/i });

    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('X');
  });

  it('calls the `onClick` handler when the user clicks the button', async () => {
    const user = userEvent.setup();
    const handleClickMock = jest.fn();
    render(<Button onClick={handleClickMock}>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });

    await user.click(btn);

    expect(handleClickMock).toHaveBeenCalledTimes(1);
  });

  it('has type "submit" when `isSubmit` is `true`', () => {
    render(<Button isSubmit={true}>Click me</Button>);

    const btn = screen.getByRole('button', { name: /click me/i });

    expect(btn).toHaveAttribute('type', 'submit');
  });

  describe('when validating props', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      // Prevents Jest from logging the error to the console.
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });
  });

  describe('for array props', () => {
    const invalidArrayValues = [
      { value: 'string', type: 'String' },
      { value: 5, type: 'Number' },
      { value: null, type: 'Null' },
      { value: Symbol('string'), type: 'Symbol' },
      { value: true, type: 'Boolean' },
      { value: 151324314n, type: 'BigInt' },
      { value: { string: 'string' }, type: 'Object' },
      { value: function () {}, type: 'Function' },
    ];

    it.each(invalidArrayValues)(
      'throws if `elements` is $type',
      ({ value }) => {
        expect(() => {
          render(<Button elements={value}>Click me</Button>);
        }).toThrow(TypeError);
      },
    );

    it.each(invalidArrayValues)(
      'throws if `modifiers` is $type',
      ({ value }) => {
        expect(() => {
          render(<Button modifiers={value}>Click me</Button>);
        }).toThrow(TypeError);
      },
    );
  });

  describe('for string props', () => {
    const invalidStringValues = [
      { value: 5, type: 'Number' },
      { value: null, type: 'Null' },
      { value: Symbol('string'), type: 'Symbol' },
      { value: true, type: 'Boolean' },
      { value: 151324314n, type: 'BigInt' },
      { value: { string: 'string' }, type: 'Object' },
      { value: ['string', 'test'], type: 'Array' },
      { value: function () {}, type: 'Function' },
    ];

    it.each(invalidStringValues)(
      'throws if `elements` contains $type',
      ({ value }) => {
        expect(() => {
          render(<Button elements={['Button', value]}>Click me</Button>);
        }).toThrow(TypeError);
      },
    );

    it.each(invalidStringValues)(
      'throws if `modifiers` contains $type',
      ({ value }) => {
        expect(() => {
          render(<Button modifiers={['Button', value]}>Click me</Button>);
        }).toThrow(TypeError);
      },
    );

    it.each(invalidStringValues)(
      'throws if `className` is $type',
      ({ value }) => {
        expect(() => {
          render(<Button className={value}>Click me</Button>);
        }).toThrow(TypeError);
      },
    );

    it.each(invalidStringValues)('throws if `label` is $type', ({ value }) => {
      expect(() => {
        render(<Button label={value}>Click me</Button>);
      }).toThrow(TypeError);
    });

    it.each(invalidStringValues)('throws if `id` is $type', ({ value }) => {
      expect(() => {
        render(<Button id={value}>Click me</Button>);
      }).toThrow(TypeError);
    });
  });

  describe('for functional props', () => {
    const invalidFunctionValues = [
      { value: 'string', type: 'String' },
      { value: 5, type: 'Number' },
      { value: null, type: 'Null' },
      { value: Symbol('string'), type: 'Symbol' },
      { value: true, type: 'Boolean' },
      { value: 151324314n, type: 'BigInt' },
      { value: { string: 'string' }, type: 'Object' },
      { value: ['string', 'test'], type: 'Array' },
    ];

    it.each([
      ...invalidFunctionValues,
      { value: undefined, type: 'Undefined' },
    ])('throws if `onClick` is $type', ({ value }) => {
      expect(() => {
        render(<Button onClick={value}>Click me</Button>);
      }).toThrow(TypeError);
    });
  });
});
