/**
 * Capitalises the first letter of the string if it's a lower-case letter.
 * Otherwise, returns the string unchanged.
 *
 * @param word The string to capitalise.
 * @returns The capitalised string or the original string.
 */
export default function capitalize(word: string): string {
  if (word.length === 0) return '';

  if (/^[a-z]/.test(word)) {
    return `${word[0].toUpperCase()}${word.slice(1)}`;
  }

  return word;
}
