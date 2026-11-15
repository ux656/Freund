import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: { sessionId: string } }) {
  const base = process.env.BOT_API_URL?.replace(/\/+$/, "");
  const token = process.env.BOT_API_TOKEN;
  if (!base || !token) return NextResponse.json({ error: "bot_service_not_configured" }, { status: 503 });

  try {
    const response = await fetch(base + "/api/install/" + encodeURIComponent(context.params.sessionId), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: data.error || "session_not_found", serverTime: Date.now() }, { status: response.status });
    return NextResponse.json({
      status: data.status,
      code: data.code || undefined,
      expiresAt: data.expiresAt,
      serverTime: data.serverTime || Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "bot_unreachable", serverTime: Date.now() }, { status: 502 });
  }
}
