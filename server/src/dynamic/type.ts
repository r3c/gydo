type Loose<T> = { [key in keyof T]: unknown };

export function asArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

export function asObject<T>(value: unknown): Loose<T> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Loose<T>)
    : undefined;
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
