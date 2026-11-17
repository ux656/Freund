/**
 * Data access for the dashboard: pairing sessions, activity history,
 * overview snapshots and rate-limit buckets.
 *
 * Every helper is best effort — it resolves to null/false instead of throwing,
 * so a slow or missing database can never break a page or an API route.
 * When no database is configured the in-process driver takes over, which keeps
 * the current behaviour (data lives as long as the server instance).
 */

import { createHash } from "node:crypto";
import { createFallbackDriver, ensureDb } from "./index";
import type { DbDriver, DbRecord } from "./types";

export const COLLECTIONS = {
  sessions: "pairing_sessions",
  activity: "activity_events",
  snapshots: "overview_snapshots",
  rateLimits: "rate_limits",
} as const;

const ENSURE_TIMEOUT_MS = 6_000;
const OP_TIMEOUT_MS = 3_000;
const KEEP = { sessions: 200, activity: 400, snapshots: 300 };

const fallback = createFallbackDriver();

export type PairingSessionRecord = DbRecord & {
  id: string;
  phone: string;
  ip?: string;
  status: string;
  code?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  lastStatusAt?: number;
};

export type ActivityEventRecord = DbRecord & {
  id: string;
  type: string;
  bot: string;
  command?: string;
  at: string;
  status: string;
  updatedAt: number;
};

export type OverviewSnapshotRecord = DbRecord & {
  id: string;
  at: string;
  bots: { total: number; connected: number; disconnected: number };
  sessions: { active: number; pending: number };
  updatedAt: number;
};

export type RateBucket = { hits: number[]; lastAt: number };
export type RateBucketMap = Record<string, RateBucket>;

// ─────────────────────────────────────────────────────────────
//  Plumbing
// ─────────────────────────────────────────────────────────────

const warnedAt = new Map<string, number>();

function warnThrottled(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "error");
  const now = Date.now();
  const last = warnedAt.get(message) || 0;
  if (now - last < 60_000) return;
  warnedAt.set(message, now);
  if (warnedAt.size > 50) {
    for (const [key, at] of warnedAt) if (now - at > 120_000) warnedAt.delete(key);
  }
  console.warn(`[db] ${message}`);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`database operation timed out (${ms}ms)`)), ms);
    promise.then(
      value => { clearTimeout(timer); resolve(value); },
      error => { clearTimeout(timer); reject(error); },
    );
  });
}

/** Runs a database operation with timeouts and error swallowing. */
async function run<T>(work: (db: DbDriver) => Promise<T>): Promise<T | null> {
  try {
    const db = await withTimeout(ensureDb(), ENSURE_TIMEOUT_MS);
    if (!db) return null;
    return await withTimeout(work(db), OP_TIMEOUT_MS);
  } catch (error) {
    warnThrottled(error);
    return null;
  }
}

const now = () => Date.now();
const asNumber = (value: unknown, fallbackValue = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallbackValue;

/** Removes the oldest entries beyond `keep`, best effort. */
async function prune(collection: string, keep: number) {
  await run(async db => {
    const rows = await db.list(collection, keep + 100);
    const excess = rows.slice(keep);
    for (const row of excess) await db.remove(collection, row.id);
    return excess.length;
  });
}

/** Stable pseudonym so raw phone numbers/IPs never land in the database. */
export function hashValue(value: string): string {
  return createHash("sha256").update(String(value || "")).digest("hex").slice(0, 32);
}

// ─────────────────────────────────────────────────────────────
//  Pairing sessions
// ─────────────────────────────────────────────────────────────

export async function savePairingSession(input: {
  sessionId: string;
  phone: string;
  ip?: string;
  code?: string;
  status?: string;
  expiresAt?: number;
}): Promise<boolean> {
  if (!input.sessionId) return false;
  const stamp = now();
  const record: PairingSessionRecord = {
    id: input.sessionId,
    phone: hashValue(input.phone),
    ip: input.ip ? hashValue(input.ip) : undefined,
    status: input.status || "awaiting",
    code: input.code,
    createdAt: stamp,
    updatedAt: stamp,
    expiresAt: input.expiresAt,
    lastStatusAt: stamp,
  };
  const saved = await run(db => db.put(COLLECTIONS.sessions, record as unknown as DbRecord));
  if (saved !== null) void prune(COLLECTIONS.sessions, KEEP.sessions);
  return saved !== null;
}

export async function updatePairingSession(
  sessionId: string,
  patch: Partial<PairingSessionRecord>,
): Promise<boolean> {
  if (!sessionId) return false;
  const updated = await run(async db => {
    const existing = await db.get<PairingSessionRecord>(COLLECTIONS.sessions, sessionId);
    const stamp = now();
    const merged: PairingSessionRecord = {
      phone: "",
      status: "awaiting",
      createdAt: stamp,
      ...existing,
      ...patch,
      id: sessionId,
      updatedAt: stamp,
      lastStatusAt: stamp,
    };
    await db.put(COLLECTIONS.sessions, merged as unknown as DbRecord);
    return true;
  });
  return updated === true;
}

export async function getPairingSession(sessionId: string): Promise<PairingSessionRecord | null> {
  if (!sessionId) return null;
  return run(db => db.get<PairingSessionRecord>(COLLECTIONS.sessions, sessionId));
}

export async function listPairingSessions(limit = 20): Promise<PairingSessionRecord[]> {
  const safeLimit = Math.max(1, Math.min(100, limit));
  return (await run(db => db.list<PairingSessionRecord>(COLLECTIONS.sessions, safeLimit))) || [];
}

// ─────────────────────────────────────────────────────────────
//  Activity history
// ─────────────────────────────────────────────────────────────

export type ActivityInput = {
  id: string;
  type: string;
  bot?: string;
  command?: string;
  at?: string;
  status?: string;
};

export async function recordActivityEvents(events: ActivityInput[]): Promise<number> {
  if (!Array.isArray(events) || !events.length) return 0;
  const stamp = now();
  const records = events
    .filter(event => event && typeof event.id === "string" && event.id)
    .slice(0, 300)
    .map(event => ({
      id: event.id,
      type: String(event.type || "system_event").slice(0, 48),
      bot: String(event.bot || "النظام").slice(0, 80),
      command: event.command ? String(event.command).slice(0, 48) : undefined,
      at: event.at || new Date(stamp).toISOString(),
      status: ["success", "failed", "info"].includes(event.status || "")
        ? (event.status as string)
        : "info",
      updatedAt: stamp,
    })) as ActivityEventRecord[];

  const saved = await run(async db => {
    for (const record of records) {
      await db.put(COLLECTIONS.activity, record as unknown as DbRecord);
    }
    return records.length;
  });
  if (saved !== null) void prune(COLLECTIONS.activity, KEEP.activity);
  return saved ?? 0;
}

export async function listActivityEvents(limit = 300): Promise<ActivityEventRecord[]> {
  const safeLimit = Math.max(1, Math.min(500, limit));
  return (await run(db => db.list<ActivityEventRecord>(COLLECTIONS.activity, safeLimit))) || [];
}

// ─────────────────────────────────────────────────────────────
//  Overview snapshots (dashboard history)
// ─────────────────────────────────────────────────────────────

export async function saveOverviewSnapshot(snapshot: {
  at?: string;
  bots: { total: number; connected: number; disconnected: number };
  sessions: { active: number; pending: number };
}): Promise<boolean> {
  const at = snapshot.at || new Date().toISOString();
  const record: OverviewSnapshotRecord = {
    id: `snap:${at}`,
    at,
    bots: {
      total: asNumber(snapshot.bots?.total),
      connected: asNumber(snapshot.bots?.connected),
      disconnected: asNumber(snapshot.bots?.disconnected),
    },
    sessions: {
      active: asNumber(snapshot.sessions?.active),
      pending: asNumber(snapshot.sessions?.pending),
    },
    updatedAt: now(),
  };
  const saved = await run(db => db.put(COLLECTIONS.snapshots, record as unknown as DbRecord));
  if (saved !== null) void prune(COLLECTIONS.snapshots, KEEP.snapshots);
  return saved !== null;
}

export async function listOverviewSnapshots(limit = 60): Promise<OverviewSnapshotRecord[]> {
  const safeLimit = Math.max(1, Math.min(300, limit));
  return (await run(db => db.list<OverviewSnapshotRecord>(COLLECTIONS.snapshots, safeLimit))) || [];
}

// ─────────────────────────────────────────────────────────────
//  Rate-limit buckets
// ─────────────────────────────────────────────────────────────

const RATE_DOC_ID = "buckets";
const MAX_RATE_BUCKETS = 5_000;

export async function loadRateBuckets(): Promise<RateBucketMap | null> {
  const doc = await run(db => db.get<DbRecord & { buckets?: RateBucketMap }>(COLLECTIONS.rateLimits, RATE_DOC_ID));
  const buckets = doc?.buckets;
  return buckets && typeof buckets === "object" ? buckets : null;
}

export async function saveRateBuckets(buckets: RateBucketMap): Promise<boolean> {
  const entries = Object.entries(buckets || {}).slice(-MAX_RATE_BUCKETS);
  const trimmed: RateBucketMap = {};
  for (const [key, bucket] of entries) {
    if (!bucket || !Array.isArray(bucket.hits)) continue;
    trimmed[key] = { hits: bucket.hits.map(hit => asNumber(hit)), lastAt: asNumber(bucket.lastAt) };
  }
  const record = { id: RATE_DOC_ID, buckets: trimmed, updatedAt: now() };
  const saved = await run(db => db.put(COLLECTIONS.rateLimits, record as unknown as DbRecord));
  return saved !== null;
}

// ─────────────────────────────────────────────────────────────
//  Diagnostics
// ─────────────────────────────────────────────────────────────
