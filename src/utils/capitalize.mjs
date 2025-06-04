export default function capitalize(word) {
  if (typeof word !== 'string') {
    throw new TypeError(
      'Incorrect argument! `capitalize` accepts only strings.',
    );
  }

  if (/^[a-z]/.test(word)) {
    return `${word.at(0).toUpperCase()}${word.slice(1)}`;
  }

  return word;
}
