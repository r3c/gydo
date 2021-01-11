type Object = { [key: string]: unknown };

export function asArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

export function asObject(value: unknown): Object | undefined {
  return typeof value === "object" ? (value as Object) : undefined;
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
