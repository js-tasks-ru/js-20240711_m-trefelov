const collator = new Intl.Collator(["ru", "en"], { caseFirst: "upper" });

/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {"asc" | "desc"} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  return [...arr].sort(
    param === "asc"
      ? (a, b) => collator.compare(a, b)
      : (a, b) => collator.compare(b, a)
  );
}
