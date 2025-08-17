/**
 * Because right now the function is hard to grasp just from looking
 * at it. I haven't used it for a long time an it was hard to get
 * what it was doing initially. And I don't even remember where it's
 * used clearly.
 */
// TODO: rename `joinItems()` to something more telling, like `joinObjectItems()`.
export default function joinItems(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('Incorrect argument! joinItems() accepts arrays only.');
  }

  return items
    .map((item) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        item.value === 'undefined' ||
        typeof item.value !== 'string'
      ) {
        throw new TypeError(
          'Incorrect argument! Input array must consist of objects with properties "value" with string values.',
        );
      }

      return item.value;
    })
    .join(', ');
}
