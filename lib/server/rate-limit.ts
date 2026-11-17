import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { isDbConfigured } from "@/lib/server/db";
import { loadRateBuckets, saveRateBuckets, type RateBucketMap } from "@/lib/server/db/store";

type Bucket = { hits: number[]; lastAt: number };
type Store = { buckets: Map<string, Bucket>; lastSweep: number };
declare global { var __freundRateLimitStore: Store | undefined; }

const HOUR = 60 * 60 * 1000;
const COOLDOWN = 60 * 1000;
const PHONE_MAX = 5;
const IP_MAX = 12;
const POLL_WINDOW = 60 * 1000;
const POLL_MAX = 100;
const PERSIST_DELAY_MS = 2_000;
const MAX_PERSISTED_BUCKETS = 5_000;

function getStore(): Store {
  return (globalThis.__freundRateLimitStore ??= { buckets: new Map(), lastSweep: 0 });
}
function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const values = forwarded?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
  const ip = values[0] || request.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 64);
}
function cleanup(now: number) {
  const state = getStore();
  if (now - state.lastSweep < 60_000) return;
  state.lastSweep = now;
  state.buckets.forEach((bucket, key) => {
    bucket.hits = bucket.hits.filter((time) => now - time < HOUR);
    if (!bucket.hits.length && now - bucket.lastAt >= HOUR) state.buckets.delete(key);
  });
  if (state.buckets.size > 20_000) {
    const oldest: [string, Bucket][] = [];
    state.buckets.forEach((bucket, key) => oldest.push([key, bucket]));
    oldest.sort((a, b) => a[1].lastAt - b[1].lastAt);
    oldest.slice(0, state.buckets.size - 15_000).forEach(([key]) => state.buckets.delete(key));
  }
}
function inspect(key: string, max: number, now: number, windowMs = HOUR, cooldownMs = COOLDOWN) {
  const state = getStore();
  const bucket = state.buckets.get(key) || { hits: [], lastAt: 0 };
  bucket.hits = bucket.hits.filter((time) => now - time < windowMs);
  if (bucket.hits.length >= max) {
    state.buckets.set(key, bucket);
    return { allowed: false as const, retryAfterMs: Math.max(1000, windowMs - (now - bucket.hits[0])) };
  }
  if (bucket.lastAt && now - bucket.lastAt < cooldownMs) {
    state.buckets.set(key, bucket);
    return { allowed: false as const, retryAfterMs: cooldownMs - (now - bucket.lastAt) };
  }
  return { allowed: true as const, bucket };
}
function record(key: string, bucket: Bucket, now: number) {
  bucket.hits.push(now);
  bucket.lastAt = now;
  getStore().buckets.set(key, bucket);
  schedulePersist();
}

// ── مزامنة الحدود مع قاعدة البيانات (best effort) ──
// الذاكرة تبقى المصدر السريع، والقاعدة تخزّن النسخة لتعود بعد إعادة النشر.

let hydrated = false;
let hydrating: Promise<void> | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function hydrateFromDb() {
  if (hydrated || hydrating) return;
  hydrating = (async () => {
    try {
      const stored = await loadRateBuckets();
      if (stored) {
        const state = getStore();
        for (const [key, bucket] of Object.entries(stored)) {
          if (!bucket || !Array.isArray(bucket.hits) || state.buckets.has(key)) continue;
          state.buckets.set(key, { hits: [...bucket.hits], lastAt: bucket.lastAt || 0 });
        }
      }
    } catch {
      /* الذاكرة تبقى كما هي */
    } finally {
      hydrated = true;
      hydrating = null;
    }
  })();
}

function serializeBuckets(now: number): RateBucketMap {
  const state = getStore();
  const out: RateBucketMap = {};
  let count = 0;
  for (const [key, bucket] of state.buckets) {
    const hits = bucket.hits.filter(time => now - time < HOUR);
    if (!hits.length && now - bucket.lastAt >= HOUR) continue;
    out[key] = { hits, lastAt: bucket.lastAt };
    if (++count >= MAX_PERSISTED_BUCKETS) break;
  }
  return out;
}

function schedulePersist() {
  if (!isDbConfigured() || persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void saveRateBuckets(serializeBuckets(Date.now()));
  }, PERSIST_DELAY_MS);
  persistTimer.unref?.();
}

export function enforcePairingLimits(request: NextRequest, phone: string) {
  hydrateFromDb();
  const now = Date.now();
  cleanup(now);
  const phoneKey = "phone:" + hash(phone);
  const ipKey = "ip:" + hash(clientIp(request));
  const phoneCheck = inspect(phoneKey, PHONE_MAX, now);
  if (!phoneCheck.allowed) return { allowed: false as const, error: "phone_limit", retryAfterMs: phoneCheck.retryAfterMs };
  const ipCheck = inspect(ipKey, IP_MAX, now);
  if (!ipCheck.allowed) return { allowed: false as const, error: ipCheck.retryAfterMs <= COOLDOWN ? "cooldown" : "ip_limit", retryAfterMs: ipCheck.retryAfterMs };
  record(phoneKey, phoneCheck.bucket, now);
  record(ipKey, ipCheck.bucket, now);
  return { allowed: true as const };
}

export function enforceSessionPollLimit(request: NextRequest) {
  hydrateFromDb();
  const now = Date.now();
  cleanup(now);
  const key = "poll:" + hash(clientIp(request));
  const result = inspect(key, POLL_MAX, now, POLL_WINDOW, 0);
  if (!result.allowed) return result;
  record(key, result.bucket, now);
  return { allowed: true as const };
}
