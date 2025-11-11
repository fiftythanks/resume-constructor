import type { Skills } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

/**
 * Transforms an array of skill objects into a single, comma-separated string.
 *
 * @param skills The array of skill objects to join.
 * @returns A string of skill values.
 */
export default function joinSkills<K extends keyof Skills>(
  skills: ReadonlyDeep<Skills[K]>,
): string {
  return skills.map((item) => item.value).join(', ');
}
