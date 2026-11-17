import { NextRequest, NextResponse } from "next/server";
import { isTrustedAppRequest } from "@/lib/server/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown, max = 120): string | undefined {
  return typeof value === "string" ? value.slice(0, max) : undefined;
}

function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

export async function GET(request: NextRequest) {
  if (!isTrustedAppRequest(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const base = process.env.BOT_API_URL?.replace(/\/+$/, "");
  const token = process.env.BOT_API_TOKEN;

  if (!base || !token) {
    return NextResponse.json({ ok: false, error: "bot_service_not_configured" }, { status: 503 });
  }

  try {
    const response = await fetch(base + "/dashboard/overview", {
      method: "GET",
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "dashboard_data_unavailable" }, { status: response.status === 404 ? 503 : 502 });
    }

    const raw: any = await response.json();
    if (!raw || typeof raw !== "object" || !raw.service || !raw.bots || !raw.sessions || !Array.isArray(raw.activity)) {
      return NextResponse.json({ ok: false, error: "invalid_dashboard_response" }, { status: 502 });
    }

    const items = Array.isArray(raw.bots.items) ? raw.bots.items.slice(0, 100) : [];
    const activity = raw.activity.slice(0, 300);

    const data = {
      checkedAt: text(raw.checkedAt, 40) || new Date().toISOString(),
      service: {
        status: text(raw.service.status, 40) || "unknown",
        uptimeMs: numeric(raw.service.uptimeMs),
        latencyMs: numeric(raw.service.latencyMs),
        memory: raw.service.memory && typeof raw.service.memory === "object" ? {
          rss: numeric(raw.service.memory.rss),
          heapUsed: numeric(raw.service.memory.heapUsed),
          heapTotal: numeric(raw.service.memory.heapTotal),
        } : null,
      },
      bots: {
        total: numeric(raw.bots.total) ?? 0,
        connected: numeric(raw.bots.connected) ?? 0,
        disconnected: numeric(raw.bots.disconnected) ?? 0,
        items: items.map((bot: any, index: number) => ({
          id: text(bot?.id, 100) || String(index),
          name: text(bot?.name, 80),
          number: text(bot?.number, 40),
          status: ["connected", "disconnected", "connecting"].includes(bot?.status) ? bot.status : "disconnected",
          lastActiveAt: numeric(bot?.lastActiveAt),
        })),
      },
      sessions: {
        active: numeric(raw.sessions.active) ?? 0,
        pending: numeric(raw.sessions.pending) ?? 0,
      },
      activity: activity.map((event: any, index: number) => ({
        id: text(event?.id, 100) || String(index),
        type: text(event?.type, 48) || "system_event",
        bot: text(event?.bot, 80) || "النظام",
        command: text(event?.command, 48),
        at: text(event?.at, 40) || "",
        status: ["success", "failed", "info"].includes(event?.status) ? event.status : "info",
      })),
    };

    return NextResponse.json({ ok: true, data }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "bot_service_unreachable" }, { status: 502 });
  }
}
