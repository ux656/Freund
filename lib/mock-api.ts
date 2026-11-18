/** Client adapter. Rate limits and security policy live on the server only. */

import { requestJson, readApiNumber, readApiString, type ApiPayload } from "./api-client";

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
      demo?: boolean;
    };

export type SessionState = "awaiting" | "confirmed" | "expired" | "failed";

export type SessionStatus =
  | {
      ok: true;
      status: SessionState;
      error?: string;
      code?: string;
      expiresAt?: number;
      serverTime?: number;
      demo?: boolean;
    }
  | {
      ok: false;
      error?: string;
      retryAfterMs?: number;
      serverTime?: number;
      httpStatus?: number;
    };

export async function requestPairing({ phone }: { phone: string }): Promise<PairingResult> {
  try {
    const { response, data } = await requestJson<ApiPayload>("/api/pairing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: readApiString(data.error) || "request_failed",
        retryAfterMs: readApiNumber(data.retryAfterMs),
        serverTime: readApiNumber(data.serverTime) || Date.now(),
        httpStatus: response.status,
      };
    }

    const sessionId = readApiString(data.sessionId);
    const expiresAt = readApiNumber(data.expiresAt);
    const nextAllowedAt = readApiNumber(data.nextAllowedAt);
    const serverTime = readApiNumber(data.serverTime);

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
      code: readApiString(data.code),
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
    const { response, data } = await requestJson<ApiPayload>(
      "/api/pairing/" + encodeURIComponent(sessionId),
      { method: "GET", cache: "no-store" },
    );

    if (!response.ok) {
      return {
        ok: false,
        error: readApiString(data.error) || (
          response.status === 404
            ? "session_not_found"
            : response.status === 429
              ? "too_many_checks"
              : "session_check_failed"
        ),
        retryAfterMs: readApiNumber(data.retryAfterMs),
        serverTime: readApiNumber(data.serverTime) || Date.now(),
        httpStatus: response.status,
      };
    }

    const rawStatus = readApiString(data.status);
    const status: SessionState | undefined =
      rawStatus === "linked"
        ? "confirmed"
        : rawStatus === "expired"
          ? "expired"
          : rawStatus === "failed"
            ? "failed"
            : rawStatus === "starting" || rawStatus === "code_ready" || rawStatus === "pending" || rawStatus === "awaiting"
              ? "awaiting"
              : undefined;

    if (!status) {
      return {
        ok: false,
        error: "invalid_response",
        serverTime: readApiNumber(data.serverTime) || Date.now(),
      };
    }

    return {
      ok: true,
      status,
      demo: data.demo === true,
      error: readApiString(data.error),
      code: readApiString(data.code),
      expiresAt: readApiNumber(data.expiresAt),
      serverTime: readApiNumber(data.serverTime),
    };
  } catch {
    return { ok: false, error: "network_error", serverTime: Date.now() };
  }
}
