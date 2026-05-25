export function normalize(value: string) {
  return value.trim();
}

export function normalizeBookText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeToLowerCase(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeOptionalBookText(value: string | undefined) {
  if (value === undefined) {
    return null;
  }

  const normalized = normalizeBookText(value);

  return normalized.length === 0 ? null : normalized;
}
