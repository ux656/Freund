import { NextResponse } from "next/server";
import { dbHealth, pingDb } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health probe: database connection state plus basic process info.
 * Public by design (uptime monitors), so it never exposes connection strings,
 * environment values or raw driver errors in production.
 */
export async function GET() {
  // الاتصال كسول: أول طلب هو اللي يفتح الاتصال بالقاعدة.
  const latencyMs = await pingDb(2000);
  const health = dbHealth();
  const details = health.error
    ? (process.env.NODE_ENV === "production" ? "connection_failed" : health.error)
    : null;

  const ready =
    health.status === "connected" ||
    health.status === "idle" ||
    health.status === "unconfigured" ||
    health.status === "disabled";

  return NextResponse.json(
    {
      ok: ready,
      db: {
        status: health.status,
        driver: health.driver,
        latencyMs,
        since: health.since ? new Date(health.since).toISOString() : null,
        error: details,
      },
      uptimeMs: Math.round(process.uptime() * 1000),
      serverTime: new Date().toISOString(),
    },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
