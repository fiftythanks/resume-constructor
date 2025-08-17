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

  it.each([
    { elements: 'string', type: 'string' },
    { elements: 5, type: 'number' },
    { elements: null, type: 'null' },
    { elements: Symbol('string'), type: 'symbol' },
    { elements: true, type: 'boolean' },
    { elements: 151324314n, type: 'bigint' },
    { elements: { string: 'string' }, type: 'object' },
    { elements: function () {}, type: 'function' },
  ])('throws if `elements` is $type', ({ elements }) => {
    // Prevents Jest from logging the error to the console.
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(<Button elements={elements}>Click me</Button>);
    }).toThrow(TypeError('Elements must be wrapped in an array!'));
  });

  it.each([
    { modifiers: 'string', type: 'string' },
    { modifiers: 5, type: 'number' },
    { modifiers: null, type: 'null' },
    { modifiers: Symbol('string'), type: 'symbol' },
    { modifiers: true, type: 'boolean' },
    { modifiers: 151324314n, type: 'bigint' },
    { modifiers: { string: 'string' }, type: 'object' },
    { modifiers: function () {}, type: 'function' },
  ])('throws if `modifiers` is $type', ({ modifiers }) => {
    // Prevents Jest from logging the error to the console.
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(<Button modifiers={modifiers}>Click me</Button>);
    }).toThrow(TypeError('Modifiers must be wrapped in an array!'));
  });

  it.each([
    { value: 5, type: 'number' },
    { value: null, type: 'null' },
    { value: undefined, type: 'undefined' },
    { value: Symbol('string'), type: 'symbol' },
    { value: true, type: 'boolean' },
    { value: 151324314n, type: 'bigint' },
    { value: { string: 'string' }, type: 'object' },
    { value: ['string', 'test'], type: 'array' },
    { value: function () {}, type: 'function' },
  ])('throws if `elements` contains a $type', ({ value }) => {
    // Prevents Jest from logging the error to the console.
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(<Button elements={['Button', value]}>Click me</Button>);
    }).toThrow(TypeError('Elements must be strings!'));
  });

  it.each([
    { value: 5, type: 'number' },
    { value: null, type: 'null' },
    { value: undefined, type: 'undefined' },
    { value: Symbol('string'), type: 'symbol' },
    { value: true, type: 'boolean' },
    { value: 151324314n, type: 'bigint' },
    { value: { string: 'string' }, type: 'object' },
    { value: ['string', 'test'], type: 'array' },
    { value: function () {}, type: 'function' },
  ])('throws if `modifiers` contains a $type', ({ value }) => {
    // Prevents Jest from logging the error to the console.
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(<Button modifiers={['Button', value]}>Click me</Button>);
    }).toThrow(TypeError('Modifiers must be strings!'));
  });

  it.each([
    { value: 5, type: 'number' },
    { value: null, type: 'null' },
    { value: Symbol('string'), type: 'symbol' },
    { value: true, type: 'boolean' },
    { value: 151324314n, type: 'bigint' },
    { value: { string: 'string' }, type: 'object' },
    { value: ['string', 'test'], type: 'array' },
    { value: function () {}, type: 'function' },
  ])('throws if `className` is $type', ({ value }) => {
    // Prevents Jest from logging the error to the console.
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(<Button className={value}>Click me</Button>);
    }).toThrow(TypeError('`className` must be a string!'));
  });
});
