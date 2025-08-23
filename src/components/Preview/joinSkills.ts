/**
 * Transforms an array of skill objects into a single, comma-separated string.
 *
 * @param skills The array of skill objects to join.
 * @returns A string of skill values.
 */
export default function joinSkills(skills: { value: string }[]): string {
  return skills.map((item) => item.value).join(', ');
}
