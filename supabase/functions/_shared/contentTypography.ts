/**
 * Normalizes punctuation commonly overused by generated copy.
 * Em dashes become commas, while en dashes become ordinary hyphens.
 */
export function normalizeContentTypography(value: string): string {
  return value
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, "-")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ");
}