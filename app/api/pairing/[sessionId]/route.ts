import { NextRequest, NextResponse } from "next/server";
import { enforceSessionPollLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: { sessionId: string } }) {
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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: "session_not_found", serverTime: Date.now() }, { status: response.status === 404 ? 404 : 502 });
    return NextResponse.json({
      status: data.status,
      code: typeof data.code === "string" ? data.code : undefined,
      expiresAt: data.expiresAt,
      serverTime: data.serverTime || Date.now(),
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ error: "bot_unreachable", serverTime: Date.now() }, { status: 502 });
  }
}
