import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.BOT_API_URL?.replace(/\/+$/, "");
  const token = process.env.BOT_API_TOKEN;

  if (!base || !token) {
    return NextResponse.json({ error: "bot_service_not_configured" }, { status: 503 });
  }

  try {
    const response = await fetch(base + "/", {
      method: "GET",
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "bot_service_unavailable" }, { status: 502 });
    }

    const data: unknown = await response.json();
    const serviceStatus =
      data && typeof data === "object" && "status" in data && typeof data.status === "string"
        ? data.status.slice(0, 40)
        : undefined;

    return NextResponse.json(
      {
        ok: true,
        reachable: true,
        serviceStatus,
        checkedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json({ error: "bot_service_unreachable" }, { status: 502 });
  }
}
