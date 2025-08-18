export default function joinSkills(skills) {
  if (!Array.isArray(skills)) {
    throw new TypeError(
      'Incorrect argument! joinSkills() accepts arrays only.',
    );
  }

  return skills
    .map((item) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        item.value === 'undefined' ||
        typeof item.value !== 'string'
      ) {
        throw new TypeError(
          'Incorrect argument! Input array must consist of objects with a property "value" that has a string value.',
        );
      }

      return item.value;
    })
    .join(', ');
}
