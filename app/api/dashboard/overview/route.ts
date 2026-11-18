import { NextRequest, NextResponse } from "next/server";
import { isTrustedAppRequest } from "@/lib/server/request-guard";
import {
  listActivityEvents,
  recordActivityEvents,
  saveOverviewSnapshot,
} from "@/lib/server/db/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown, max = 120): string | undefined {
  return typeof value === "string" ? value.slice(0, max) : undefined;
}

function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function buildDemoOverview() {
  const now = Date.now();
  const bots = [
    { id: "freund-main-01", name: "Freund Main", status: "connected", lastActiveAt: now - 45000 },
    { id: "freund-sub-02", name: "Freund Sub 02", status: "connected", lastActiveAt: now - 180000 },
    { id: "freund-sub-03", name: "Freund Sub 03", status: "connecting", lastActiveAt: now - 1080000 },
    { id: "freund-sub-04", name: "Freund Sub 04", status: "disconnected", lastActiveAt: now - 14400000 },
  ];
  const samples = [
    ["message_received", "استقبال رسالة", "success"], ["command_executed", ".منيو", "success"],
    ["group_event", "تحديث بيانات مجموعة", "info"], ["command_executed", ".حالة", "success"],
    ["connection_event", "إعادة اتصال جلسة", "info"], ["command_failed", ".تحميل", "failed"],
    ["message_received", "استقبال رسالة", "success"], ["command_executed", ".مساعدة", "success"],
    ["group_event", "تحديث أعضاء", "info"], ["command_executed", ".بروفايل", "success"],
    ["message_received", "استقبال رسالة", "success"], ["command_executed", ".منيو", "success"],
  ];
  const activity = samples.map(([type, command, status], index) => ({
    id: "demo-event-" + index, type, command, status, bot: bots[index % bots.length].name,
    at: new Date(now - (index * 17 + (index % 3) * 8) * 60000).toISOString(),
  }));
  return { demo: true, checkedAt: new Date(now).toISOString(),
    service: { status: "online", uptimeMs: 543600000, latencyMs: 42, memory: { rss: 192937984, heapUsed: 75497472, heapTotal: 134217728 } },
    bots: { total: 4, connected: 2, disconnected: 1, items: bots },
    sessions: { active: 2, pending: 1 }, activity };
}

export async function GET(request: NextRequest) {
  if (!isTrustedAppRequest(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  // Demo data is enabled by default until a real bot integration is ready.\n  if (process.env.DASHBOARD_DEMO_MODE !== "false") {\n    return NextResponse.json({ ok: true, data: buildDemoOverview() }, { headers: { "Cache-Control": "no-store, max-age=0" } });\n  }\n\n  const base = process.env.BOT_API_URL?.replace(/\/+$/, "");
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

    // دمج سجل النشاط المحفوظ في قاعدة البيانات مع البيانات الحية من البوت،
    // حتى يبقى التاريخ ظاهراً بعد إعادة النشر أو انقطاع البوت (best effort).
    type ActivityItem = { id: string; type: string; bot: string; command?: string; at: string; status: string };
    const live: ActivityItem[] = Array.isArray(data.activity) ? data.activity : [];
    const stored = await listActivityEvents(300);
    const seen = new Set<string>();
    const merged: ActivityItem[] = [];
    for (const event of [...live, ...(stored as unknown as ActivityItem[])]) {
      if (!event?.id || seen.has(event.id)) continue;
      seen.add(event.id);
      merged.push(event);
    }
    merged.sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0));
    data.activity = merged.slice(0, 300);

    void recordActivityEvents(data.activity);
    void saveOverviewSnapshot({
      at: data.checkedAt,
      bots: { total: data.bots.total, connected: data.bots.connected, disconnected: data.bots.disconnected },
      sessions: data.sessions,
    });

    return NextResponse.json({ ok: true, data }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "bot_service_unreachable" }, { status: 502 });
  }
}
