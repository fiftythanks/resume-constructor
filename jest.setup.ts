import { deserialize, serialize } from 'node:v8';

/**
 * The Orta Jest extension didn't want to recognise `structuredClone`
 * as a function, and nothing worked. So I found this solution.
 */
if (typeof structuredClone !== 'function') {
  global.structuredClone = (value) => {
    return deserialize(serialize(value));
  };
}

/**
 * There's no implementation for `HTMLDialogElement.prototype.close`
 * and `HTMLDialogElement.prototype.showModal` in JSDOM yet.
 */

HTMLDialogElement.prototype.close = jest.fn(function () {
  this.open = false;
});

HTMLDialogElement.prototype.showModal = jest.fn(function () {
  this.open = true;
});
