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
