import { NextRequest, NextResponse } from "next/server";
import { enforceSessionPollLimit } from "@/lib/server/rate-limit";
import { isTrustedAppRequest } from "@/lib/server/request-guard";
import { isFiniteNumber, readNonEmptyString, readUpstreamJson } from "@/lib/server/upstream-response";
import { updatePairingSession } from "@/lib/server/db/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: { sessionId: string } }) {
  if (!isTrustedAppRequest(request)) {
    return NextResponse.json(
      { error: "forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }
  const sessionId = context.params.sessionId;
  if (!/^[a-zA-Z0-9_-]{8,200}$/.test(sessionId)) {
    return NextResponse.json({ error: "invalid_session" }, { status: 400 });
  }
  const limit = enforceSessionPollLimit(request);
  if (!limit.allowed) {
    return NextResponse.json({ error: "too_many_checks", retryAfterMs: limit.retryAfterMs, serverTime: Date.now() }, {
      status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)), "Cache-Control": "no-store" },
    });
  }
  const base = process.env.BOT_API_URL?.replace(/\/+$/, "");
  const token = process.env.BOT_API_TOKEN;
  if (!base || !token) return NextResponse.json({ error: "bot_service_not_configured" }, { status: 503 });
  try {
    const response = await fetch(base + "/api/install/" + encodeURIComponent(sessionId), {
      headers: { Authorization: "Bearer " + token }, cache: "no-store", signal: AbortSignal.timeout(8_000),
    });
    const data = await readUpstreamJson(response);
    if (!response.ok) {
      const missing = response.status === 404;
      return NextResponse.json(
        { error: missing ? "session_not_found" : "session_check_failed", serverTime: Date.now() },
        { status: missing ? 404 : 502, headers: { "Cache-Control": "no-store" } }
      );
    }
    const storedStatus = readNonEmptyString(data.status, 40);
    // حدّث حالة الجلسة في القاعدة (best effort) حتى تبقى السجلات موثقة.
    void updatePairingSession(sessionId, {
      status: storedStatus || "awaiting",
      error: readNonEmptyString(data.error, 160),
      code: readNonEmptyString(data.code, 40),
      expiresAt: isFiniteNumber(data.expiresAt) ? data.expiresAt : undefined,
    });
    return NextResponse.json({
      status: storedStatus,
      error: readNonEmptyString(data.error, 160),
      code: readNonEmptyString(data.code, 40),
      expiresAt: isFiniteNumber(data.expiresAt) ? data.expiresAt : undefined,
      serverTime: isFiniteNumber(data.serverTime) ? data.serverTime : undefined,
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ error: "bot_unreachable", serverTime: Date.now() }, { status: 502 });
  }
}
