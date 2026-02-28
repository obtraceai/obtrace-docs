function normalize(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(normalize);
  if (typeof value === "string") return [value];
  return [];
}

export function cn(...values: unknown[]) {
  return values.flatMap(normalize).join(" ");
}
