/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing didn't pass
 */
export function invertObj(obj) {
  if (obj == null) {
    return;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key])
  );
}
