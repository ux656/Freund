/** Shared JSON request handling for browser-side API calls. */

export type ApiPayload = Record<string, unknown>;

export interface JsonResponse<T extends ApiPayload = ApiPayload> {
  response: Response;
  data: T;
}

export async function requestJson<T extends ApiPayload = ApiPayload>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<JsonResponse<T>> {
  const response = await fetch(input, init);
  const payload: unknown = await response.json().catch(() => null);
  const data = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as T
    : {} as T;

  return { response, data };
}

export function readApiString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function readApiNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
