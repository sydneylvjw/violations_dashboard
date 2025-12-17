const NULL_KEY = "__FILTER_NULL__";

export function normalizeFilterValue(value) {
  if (value === null || value === undefined) {
    return NULL_KEY;
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      return NULL_KEY;
    }
    return String(value);
  }

  const str = String(value).trim();
  if (!str) {
    return NULL_KEY;
  }

  return str.toUpperCase();
}

export { NULL_KEY };
