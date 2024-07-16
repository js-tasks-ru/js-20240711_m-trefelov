/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} keys - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...keys) => {
  const result = { ...obj };

  for (const key of keys) {
    if (Object.hasOwn(result, key)) {
      delete result[key];
    }
  }

  return result;
};
