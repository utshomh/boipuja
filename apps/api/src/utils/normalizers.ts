export function normalizeToLowerCase(value: string) {
  return value.trim().toLowerCase();
}

export function normalize(value: string) {
  return value.trim();
}

export function normalizeBookText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeOptionalBookText(value: string | undefined) {
  return value === undefined ? null : normalizeBookText(value);
}
