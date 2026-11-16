/** Client adapter. Rate limits and security policy live on the server only. */

type ApiPayload = Record<string, unknown>;

async function readPayload(response: Response): Promise<ApiPayload> {
  const payload: unknown = await response.json().catch(() => null);
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as ApiPayload
    : {};
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export type PairingResult =
  | {
      ok: true;
      sessionId: string;
      code?: string;
      expiresAt: number;
      serverTime: number;
      nextAllowedAt: number;
    }
  | {
      ok: false;
      error?: string;
      retryAfterMs?: number;
      serverTime?: number;
    };

export interface SessionStatus {
  ok: boolean;
  status?: "awaiting" | "confirmed" | "expired";
  code?: string;
  expiresAt?: number;
  serverTime?: number;
  error?: string;
}

export async function requestPairing({ phone }: { phone: string }): Promise<PairingResult> {
  try {
    const response = await fetch("/api/pairing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ phone }),
    });
    const data = await readPayload(response);

    if (!response.ok) {
      return {
        ok: false,
        error: readString(data.error) || "request_failed",
        retryAfterMs: readNumber(data.retryAfterMs),
        serverTime: readNumber(data.serverTime) || Date.now(),
      };
    }

    const sessionId = readString(data.sessionId);
    const expiresAt = readNumber(data.expiresAt);
    const nextAllowedAt = readNumber(data.nextAllowedAt);
    const serverTime = readNumber(data.serverTime);

    // A successful HTTP response is not enough: the pairing flow needs
    // all timing/session fields before it can safely start polling.
    if (
      !sessionId ||
      sessionId.length > 200 ||
      expiresAt === undefined ||
      nextAllowedAt === undefined ||
      serverTime === undefined
    ) {
      return { ok: false, error: "invalid_response", serverTime: Date.now() };
    }

    return {
      ok: true,
      sessionId,
      code: readString(data.code),
      expiresAt,
      nextAllowedAt,
      serverTime,
    };
  } catch {
    return { ok: false, error: "network_error", serverTime: Date.now() };
  }
}

export async function checkSession({ sessionId }: { sessionId: string }): Promise<SessionStatus> {
  try {
    const response = await fetch("/api/pairing/" + encodeURIComponent(sessionId), {
      method: "GET",
      cache: "no-store",
    });
    const data = await readPayload(response);

    if (!response.ok) {
      return {
        ok: false,
        error: readString(data.error) || "session_not_found",
        serverTime: readNumber(data.serverTime) || Date.now(),
      };
    }

    const status = data.status === "linked"
      ? "confirmed"
      : data.status === "expired" || data.status === "failed"
        ? "expired"
        : "awaiting";

    return {
      ok: true,
      status,
      code: readString(data.code),
      expiresAt: readNumber(data.expiresAt),
      serverTime: readNumber(data.serverTime),
    };
  } catch {
    return { ok: false, error: "network_error", serverTime: Date.now() };
  }
}
