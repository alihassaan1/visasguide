/**
 * Normalizes punctuation commonly overused by generated copy.
 * Em dashes become commas, while en dashes become ordinary hyphens.
 * Horizontal whitespace is cleaned without changing paragraph breaks.
 */
export function normalizeContentTypography(value: string): string {
  return value
    .replace(/[ \t]*—[ \t]*/g, ", ")
    .replace(/[ \t]*–[ \t]*/g, "-")
    .replace(/[ \t]+,/g, ",")
    .replace(/,([A-Za-z])/g, ", $1")
    .replace(/,{2,}/g, ",")
    .replace(/[ \t]{2,}/g, " ");
}
