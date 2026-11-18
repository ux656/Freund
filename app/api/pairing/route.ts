import { NextRequest, NextResponse } from "next/server";
import { enforcePairingLimits } from "@/lib/server/rate-limit";
import { isTrustedAppRequest } from "@/lib/server/request-guard";
import { isFiniteNumber, readNonEmptyString, readUpstreamJson } from "@/lib/server/upstream-response";
import { savePairingSession } from "@/lib/server/db/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 2048;

export async function POST(request: NextRequest) {
  const now = Date.now();
  if (!isTrustedAppRequest(request, true)) {
    return NextResponse.json({ error: "forbidden", serverTime: now }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "unsupported_media_type", serverTime: now }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large", serverTime: now }, { status: 413 });
  }

  let raw: string;
  try {
    raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "payload_too_large", serverTime: now }, { status: 413 });
    }
  } catch {
    return NextResponse.json({ error: "invalid_json", serverTime: now }, { status: 400 });
  }
  let body: unknown;
  try { body = JSON.parse(raw); } catch {
    return NextResponse.json({ error: "invalid_json", serverTime: now }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid_request", serverTime: now }, { status: 400 });
  }
  const value = (body as Record<string, unknown>).phone;
  if (typeof value !== "string" || value.length > 32) {
    return NextResponse.json({ error: "invalid_phone", serverTime: now }, { status: 400 });
  }
  const phone = value.replace(/\D/g, "");
  if (!/^\d{7,15}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone", serverTime: now }, { status: 400 });
  }

  const limit = enforcePairingLimits(request, phone);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: limit.error, retryAfterMs: limit.retryAfterMs, serverTime: now },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)), "Cache-Control": "no-store" } }
    );
  }

  const base = process.env.BOT_API_URL?.replace(/\/+$/, "");
  const token = process.env.BOT_API_TOKEN;
  if (!base || !token) return NextResponse.json({ error: "bot_service_not_configured", serverTime: now }, { status: 503 });

  try {
    const response = await fetch(base + "/api/install", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const data = await readUpstreamJson(response);
    if (!response.ok) return NextResponse.json({ error: "bot_request_failed", serverTime: Date.now() }, { status: response.status >= 500 ? 502 : response.status });
    const sessionId = readNonEmptyString(data.sessionId);
    if (!sessionId) {
      return NextResponse.json({ error: "invalid_bot_response", serverTime: Date.now() }, { status: 502 });
    }
    if (data.status === "failed") return NextResponse.json({ error: "pairing_failed", serverTime: Date.now() }, { status: 400 });
    const botServerTime = data.serverTime;
    const botExpiresAt = data.expiresAt;
    if (!isFiniteNumber(botServerTime) || !isFiniteNumber(botExpiresAt)) {
      return NextResponse.json({ error: "invalid_bot_time", serverTime: Date.now() }, { status: 502 });
    }
    // سجل الجلسة في قاعدة البيانات (best effort): الرقم يُخزَّن مجزَّأً فقط.
    void savePairingSession({
      sessionId,
      phone,
      code: typeof data.code === "string" ? data.code : undefined,
      status: data.status === "failed" ? "failed" : "awaiting",
      expiresAt: botExpiresAt,
    });
    return NextResponse.json({
      sessionId,
      code: typeof data.code === "string" ? data.code : undefined,
      expiresAt: botExpiresAt,
      nextAllowedAt: botServerTime + 60_000,
      serverTime: botServerTime,
    }, { headers: { "Cache-Control": "no-store, max-age=0", "Pragma": "no-cache" } });
  } catch {
    return NextResponse.json({ error: "bot_unreachable", serverTime: Date.now() }, { status: 502 });
  }
}
