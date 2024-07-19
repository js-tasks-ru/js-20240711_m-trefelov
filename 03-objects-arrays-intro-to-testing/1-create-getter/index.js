/**
 * @param {Object} object - an object to select value of
 * @param {string} path - path to nested object property
 * @returns {*} - value of the given object property or `undefined`
 */
const getNestedProperty = (object, path) => {
  const pathTokens = path.split(".");

  let currentObject = object;

  for (const pathToken of pathTokens) {
    if (currentObject == null || !Object.hasOwn(currentObject, pathToken)) {
      return;
    }

    currentObject = currentObject[pathToken];
  }

  return currentObject;
};

/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return (object) => getNestedProperty(object, path);
}
