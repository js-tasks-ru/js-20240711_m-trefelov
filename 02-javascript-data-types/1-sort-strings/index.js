const collator = new Intl.Collator(undefined, { caseFirst: "upper" });

/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {"asc" | "desc"} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  return [...arr].sort((a, b) =>
    param === "asc" ? collator.compare(a, b) : collator.compare(b, a)
  );
}
