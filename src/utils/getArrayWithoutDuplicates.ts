/**
 * Filters out duplicate values from arrays.
 */
export default function getArrayWithoutDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}
