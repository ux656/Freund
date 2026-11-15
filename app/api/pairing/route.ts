import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const phoneRequests = new Map<string, number[]>();
const ipRequests = new Map<string, number[]>();
const HOUR = 60 * 60 * 1000;
const COOLDOWN = 60 * 1000;

function takeLimit(map: Map<string, number[]>, key: string, max: number, now: number) {
  const recent = (map.get(key) || []).filter((time) => now - time < HOUR);
  if (recent.length >= max) {
    map.set(key, recent);
    return { allowed: false, retryAfterMs: HOUR - (now - recent[0]) };
  }
  const last = recent[recent.length - 1] || 0;
  if (last && now - last < COOLDOWN) {
    map.set(key, recent);
    return { allowed: false, retryAfterMs: COOLDOWN - (now - last) };
  }
  recent.push(now);
  map.set(key, recent);
  return { allowed: true, retryAfterMs: 0 };
}

async function botFetch(path: string, init?: RequestInit) {
  const base = process.env.BOT_API_URL?.replace(/\/+$/, "");
  const token = process.env.BOT_API_TOKEN;
  if (!base || !token) throw new Error("bot_service_not_configured");
  return fetch(base + path, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
    headers: { Authorization: "Bearer " + token, ...(init?.headers || {}) },
  });
}

export async function POST(request: NextRequest) {
  const now = Date.now();
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone || "").replace(/\D/g, "");
  if (!/^\d{7,15}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone", serverTime: now }, { status: 400 });
  }

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const phoneLimit = takeLimit(phoneRequests, phone, 3, now);
  if (!phoneLimit.allowed) return NextResponse.json({ error: "cooldown", retryAfterMs: phoneLimit.retryAfterMs, serverTime: now }, { status: 429 });
  const ipLimit = takeLimit(ipRequests, ip, 4, now);
  if (!ipLimit.allowed) return NextResponse.json({ error: "ip_limit", retryAfterMs: ipLimit.retryAfterMs, serverTime: now }, { status: 429 });

  try {
    const response = await botFetch("/api/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: data.error || "bot_request_failed", serverTime: Date.now() }, { status: response.status });
    if (!data.sessionId) return NextResponse.json({ error: "invalid_bot_response", serverTime: Date.now() }, { status: 502 });

    let latest = data;
    const deadline = Date.now() + 18_000;
    while (!latest.code && latest.status !== "failed" && latest.status !== "linked" && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const poll = await botFetch("/api/install/" + encodeURIComponent(data.sessionId));
      latest = await poll.json().catch(() => latest);
      if (!poll.ok) break;
    }
    if (latest.status === "failed") {
      return NextResponse.json({ error: latest.error || "pairing_failed", serverTime: Date.now() }, { status: 400 });
    }
    return NextResponse.json({
      sessionId: data.sessionId,
      code: latest.code || undefined,
      expiresAt: latest.expiresAt || data.expiresAt || now + 60_000,
      nextAllowedAt: now + COOLDOWN,
      status: latest.status,
      serverTime: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "bot_unreachable";
    const unavailable = message === "bot_service_not_configured";
    return NextResponse.json({ error: unavailable ? message : "bot_unreachable", serverTime: Date.now() }, { status: unavailable ? 503 : 502 });
  }
}
