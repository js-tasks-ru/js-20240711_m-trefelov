/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} keys - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...keys) => {
  const result = {};

  for (const key of keys) {
    const value = obj[key];

    if (value != null) {
      result[key] = value;
    }
  }

  return result;
};
