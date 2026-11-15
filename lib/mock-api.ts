/**
 * ⚠️ MOCK API — للعرض فقط.
 * في الإنتاج: انقل هذا المنطق بالكامل إلى خادم (Express / Next.js Route Handler)
 * لأن أي مستخدم يمكنه التلاعب به عبر DevTools.
 */

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
  expiresAt?: number;
  serverTime?: number;
  error?: string;
}

const LIMITS = {
  cooldownMs: 60_000,
  perPhoneHourly: 3,
  perIPHourly: 4,
  codeTtlMs: 60_000,
  autoConfirmAfterMs: 8_000, // محاكاة webhook واتساب — للعرض فقط
  clockSkewWarnMs: 30_000,
};

const requestsByPhone = new Map<string, number[]>();
const requestsByIP = new Map<string, number[]>();
const sessions = new Map<
  string,
  { phone: string; code: string; expiresAt: number; createdAt: number; status: "awaiting" | "confirmed" | "expired" }
>();
const attemptsByPhone = new Map<string, number>();
const CLIENT_IP = "client-127.0.0.1";

function now() {
  return Date.now();
}
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function prune(map: Map<string, number[]>) {
  const cutoff = now() - 3_600_000;
  for (const [k, arr] of Array.from(map.entries())) {
    const kept = arr.filter((t) => t > cutoff);
    if (kept.length) map.set(k, kept);
    else map.delete(k);
  }
}

export async function requestPairing({
  phone,
  captchaAnswer,
  captchaExpected,
}: {
  phone: string;
  captchaAnswer?: string;
  captchaExpected?: number;
}): Promise<PairingResult> {
  await delay(400);
  const t = now();
  const ip = CLIENT_IP;

  const attempts = attemptsByPhone.get(phone) || 0;
  if (attempts >= 1) {
    if (captchaAnswer === undefined || captchaAnswer === "") {
      return { ok: false, error: "captcha_required", serverTime: t };
    }
    if (Number(captchaAnswer) !== Number(captchaExpected)) {
      return { ok: false, error: "captcha_wrong", serverTime: t };
    }
  }

  prune(requestsByPhone);
  prune(requestsByIP);

  const phoneHistory = requestsByPhone.get(phone) || [];
  const lastReq = phoneHistory.length ? phoneHistory[phoneHistory.length - 1] : 0;
  if (t - lastReq < LIMITS.cooldownMs) {
    return {
      ok: false,
      error: "cooldown",
      retryAfterMs: LIMITS.cooldownMs - (t - lastReq),
      serverTime: t,
    };
  }

  if (phoneHistory.length >= LIMITS.perPhoneHourly) {
    return {
      ok: false,
      error: "phone_limit",
      retryAfterMs: 3_600_000 - (t - phoneHistory[0]),
      serverTime: t,
    };
  }

  const ipHistory = requestsByIP.get(ip) || [];
  if (ipHistory.length >= LIMITS.perIPHourly) {
    return {
      ok: false,
      error: "ip_limit",
      retryAfterMs: 3_600_000 - (t - ipHistory[0]),
      serverTime: t,
    };
  }

  const code = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
  const sessionId = "sess_" + Math.random().toString(36).slice(2, 12);
  const expiresAt = t + LIMITS.codeTtlMs;

  phoneHistory.push(t);
  requestsByPhone.set(phone, phoneHistory);
  ipHistory.push(t);
  requestsByIP.set(ip, ipHistory);
  attemptsByPhone.set(phone, attempts + 1);
  sessions.set(sessionId, { phone, code, expiresAt, createdAt: t, status: "awaiting" });

  return {
    ok: true,
    sessionId,
    code,
    expiresAt,
    serverTime: t,
    nextAllowedAt: t + LIMITS.cooldownMs,
  };
}

export async function checkSession({ sessionId }: { sessionId: string }): Promise<SessionStatus> {
  await delay(300);
  const t = now();
  const s = sessions.get(sessionId);
  if (!s) return { ok: false, error: "session_not_found", serverTime: t };

  if (s.status === "awaiting" && t - s.createdAt >= LIMITS.autoConfirmAfterMs && t < s.expiresAt) {
    s.status = "confirmed";
  }
  if (s.status === "awaiting" && t >= s.expiresAt) {
    s.status = "expired";
  }
  return { ok: true, status: s.status, expiresAt: s.expiresAt, serverTime: t };
}

export const MOCK_LIMITS = LIMITS;
