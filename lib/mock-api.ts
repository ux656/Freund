/** Client-side adapter for the authenticated Freund server routes. */
export interface PairingResult {
  ok: boolean;
  sessionId?: string;
  code?: string;
  expiresAt?: number;
  serverTime?: number;
  nextAllowedAt?: number;
  error?: string;
  retryAfterMs?: number;
}

export interface SessionStatus {
  ok: boolean;
  status?: "awaiting" | "confirmed" | "expired";
  code?: string;
  expiresAt?: number;
  serverTime?: number;
  error?: string;
}

export const MOCK_LIMITS = {
  cooldownMs: 60_000,
  perPhoneHourly: 3,
  perIPHourly: 4,
  codeTtlMs: 60_000,
};

export async function requestPairing({ phone, captchaAnswer, captchaExpected }: {
  phone: string;
  captchaAnswer?: string;
  captchaExpected?: number;
}): Promise<PairingResult> {
  try {
    const response = await fetch("/api/pairing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ phone, captchaAnswer, captchaExpected }),
    });
    const data = await response.json();
    if (!response.ok) return {
      ok: false,
      error: data.error || "request_failed",
      retryAfterMs: data.retryAfterMs,
      serverTime: data.serverTime || Date.now(),
    };
    return { ok: true, ...data, serverTime: data.serverTime || Date.now() };
  } catch {
    return { ok: false, error: "network_error", serverTime: Date.now() };
  }
}

export async function checkSession({ sessionId }: { sessionId: string }): Promise<SessionStatus> {
  try {
    const response = await fetch("/api/pairing/" + encodeURIComponent(sessionId), { method: "GET", cache: "no-store" });
    const data = await response.json();
    if (!response.ok) return { ok: false, error: data.error || "session_not_found", serverTime: data.serverTime || Date.now() };
    const status = data.status === "linked" ? "confirmed" : data.status === "expired" || data.status === "failed" ? "expired" : "awaiting";
    return { ok: true, status, code: data.code, expiresAt: data.expiresAt, serverTime: data.serverTime || Date.now() };
  } catch {
    return { ok: false, error: "network_error", serverTime: Date.now() };
  }
}
