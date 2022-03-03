/**
 * Recursively checks if their properties are equal.
 *
 * Only capable of checking non-recursive type of objects. i.e. Does not support DOM nodes.
 * @param {unknown} a - The first value to compare.
 * @param {unknown} b - The second value to compare.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    JSON.stringify(a) && JSON.stringify(b); // throws Error if a or b is recursive.
    if (a.constructor !== b.constructor) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    if (a instanceof RegExp && b instanceof RegExp){ return a.source === b.source && a.flags === b.flags;}
    if (a instanceof Date && b instanceof Date) {return -a === -b;}
    const a_keys = Object.keys(a) as Array<string & keyof typeof a>;
    const length = a_keys.length;
    const b_keys=Object.keys(b) as Array<string & keyof typeof b>;
    if (length !== b_keys.length) return false;
    for (let i = 0; i < length; i++) {
      if (!deepEqual(a[a_keys[i]], b[a_keys[i]])) {
        return false;
      }
    }
    return true;
  }
  // ~~true if both NaN, false otherwise~~
  return false;
};
