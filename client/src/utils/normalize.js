export function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalizeList(items = []) {
  return items.map((item) => normalizeText(item));
}