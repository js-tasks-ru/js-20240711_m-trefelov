/**
 * trimSymbols - removes consecutive identical symbols if their quantity is greater than size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according to passed size
 */
export function trimSymbols(string, size) {
  if (string.length === 0 || size === 0) {
    return "";
  }

  if (size == null || size > string.length) {
    return string;
  }

  let currentCharacter = string[0];
  let characterCount = 1;
  const result = [currentCharacter];

  for (let i = 1; i < string.length; i++) {
    const character = string[i];

    if (character !== currentCharacter) {
      result.push(character);
      currentCharacter = character;
      characterCount = 1;
      continue;
    }

    characterCount++;

    if (characterCount <= size) {
      result.push(character);
    }
  }

  return result.join("");
}
