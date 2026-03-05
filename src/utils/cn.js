/**
 * Join conditional class names without pulling in a utility library.
 *
 * @param {...(string | false | null | undefined)} values
 * @returns {string}
 */
export function cn(...values) {
  return values.filter(Boolean).join(" ");
}
