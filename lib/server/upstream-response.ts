/** Runtime guards for JSON returned by the upstream bot service. */

export type JsonRecord = Record<string, unknown>;

export async function readUpstreamJson(response: Response): Promise<JsonRecord> {
  const value: unknown = await response.json().catch(() => null);
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function readNonEmptyString(value: unknown, maxLength = 200): string | undefined {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength
    ? value
    : undefined;
}
