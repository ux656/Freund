/**
 * Database connection manager.
 *
 * One lazily created connection per server instance, shared across requests and
 * kept on globalThis so `next dev` hot reloads reuse it instead of opening a
 * second connection. Every public helper is failure tolerant: a broken database
 * must never break a page or an API route.
 */

import { isDbDisabled, resolveDbConfig } from "./config";
import { createMemoryDriver } from "./drivers/memory";
import { createMysqlDriver } from "./drivers/mysql";
import { createMongoDriver } from "./drivers/mongodb";
import { createPostgresDriver } from "./drivers/postgres";
import { createSqliteDriver } from "./drivers/sqlite";
import type { DbConfig, DbDriver, DbHealth, DbStatus } from "./types";

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [0, 700, 2000];
const FAILURE_COOLDOWN_MS = 20_000;

interface DbState {
  driver: DbDriver | null;
  promise: Promise<DbDriver | null> | null;
  status: DbStatus;
  error: string | null;
  since: number | null;
  retryAt: number;
}

declare global {
  var __freundDbState: DbState | undefined;
}

function state(): DbState {
  return (globalThis.__freundDbState ??= {
    driver: null,
    promise: null,
    status: "unconfigured",
    error: null,
    since: null,
    retryAt: 0,
  });
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function shortError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "unknown error");
  return message.replace(/\s+/g, " ").trim().slice(0, 200);
}

function createDriver(config: DbConfig): DbDriver {
  switch (config.driver) {
    case "sqlite":
      return createSqliteDriver(config.url);
    case "postgres":
      return createPostgresDriver(config.url);
    case "mysql":
      return createMysqlDriver(config.url);
    case "mongodb":
      return createMongoDriver(config.url, config.database);
    case "memory":
    default:
      return createMemoryDriver();
  }
}

/** True when an external database is configured (not merely the memory fallback). */
export function isDbConfigured(): boolean {
  return resolveDbConfig() !== null;
}

/** In-process fallback used when no database is configured. */
export function createFallbackDriver(): DbDriver {
  return createMemoryDriver();
}

/**
 * Connects on first use and resolves to the ready driver,
 * or null when the database is unavailable/disabled.
 */
export async function ensureDb(): Promise<DbDriver | null> {
  const config = resolveDbConfig();
  const current = state();

  if (!config) {
    current.status = isDbDisabled() ? "disabled" : "unconfigured";
    current.driver = null;
    current.error = null;
    return null;
  }

  if (current.driver) return current.driver;
  if (current.promise) return current.promise;
  if (current.status === "error" && Date.now() < current.retryAt) return null;

  current.status = "connecting";
  current.error = null;

  current.promise = (async () => {
    const driver = createDriver(config);
    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt] ?? 2000);
      try {
        await driver.connect();
        await driver.ping();
        current.driver = driver;
        current.status = "connected";
        current.error = null;
        current.since = Date.now();
        current.retryAt = 0;
        return driver;
      } catch (error) {
        lastError = error;
      }
    }

    current.driver = null;
    current.status = "error";
    current.error = shortError(lastError);
    current.since = null;
    current.retryAt = Date.now() + FAILURE_COOLDOWN_MS;
    try {
      await driver.close();
    } catch {
      /* the connection never came up */
    }
    return null;
  })();

  try {
    return await current.promise;
  } finally {
    current.promise = null;
  }
}

/** Snapshot for the health endpoint; never throws. */
export function dbHealth(): DbHealth {
  const config = resolveDbConfig();
  const current = state();

  if (!config) {
    return {
      status: isDbDisabled() ? "disabled" : "unconfigured",
      driver: null,
      latencyMs: null,
      since: null,
      error: null,
    };
  }

  return {
    status: current.status === "unconfigured" ? "idle" : current.status,
    driver: current.driver?.name ?? config.driver,
    latencyMs: null,
    since: current.since,
    error: current.error,
  };
}

/** Live round-trip probe with a hard timeout; resolves to null when it cannot run. */
export async function pingDb(timeoutMs = 2500): Promise<number | null> {
  const driver = await ensureDb();
  if (!driver) return null;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const latency = await Promise.race([
      driver.ping(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("database ping timed out")), timeoutMs);
      }),
    ]);
    return latency;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Releases the connection (used by tests and graceful shutdowns). */
export async function closeDb(): Promise<void> {
  const current = state();
  const driver = current.driver;
  current.driver = null;
  current.status = resolveDbConfig() ? "idle" : "unconfigured";
  current.since = null;
  current.error = null;
  if (!driver) return;
  try {
    await driver.close();
  } catch {
    /* already closed */
  }
}
