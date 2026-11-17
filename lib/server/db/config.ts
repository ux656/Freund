/** Reads the database configuration out of the environment. */

import type { DbConfig, DbDriverName } from "./types";

const KNOWN_DRIVERS: DbDriverName[] = ["memory", "sqlite", "postgres", "mysql", "mongodb"];

function normalize(value: string | undefined): string {
  return (value || "").trim();
}

/** Detects the driver from a connection string scheme. */
function inferDriver(url: string): DbDriverName | null {
  const scheme = url.toLowerCase();
  if (scheme.startsWith("postgres://") || scheme.startsWith("postgresql://")) return "postgres";
  if (scheme.startsWith("mysql://") || scheme.startsWith("mysql2://")) return "mysql";
  if (scheme.startsWith("mongodb://") || scheme.startsWith("mongodb+srv://")) return "mongodb";
  if (scheme.startsWith("sqlite:") || scheme.startsWith("file:")) return "sqlite";
  if (/\.(db|sqlite3?)(\?|$)/.test(scheme)) return "sqlite";
  if (scheme === "memory" || scheme === "local") return "memory";
  return null;
}

function databaseNameFromUrl(url: string, driver: DbDriverName): string | undefined {
  const explicit = normalize(process.env.DB_NAME);
  if (explicit) return explicit;
  if (driver === "mongodb") {
    try {
      const parsed = new URL(url);
      const fromPath = decodeURIComponent(parsed.pathname.replace(/^\//, "")).trim();
      return fromPath || "freund";
    } catch {
      return "freund";
    }
  }
  if (driver === "postgres" || driver === "mysql") {
    try {
      const parsed = new URL(url);
      const fromPath = decodeURIComponent(parsed.pathname.replace(/^\//, "")).trim();
      return fromPath || undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Resolves the active configuration.
 * Returns null when no database is configured (memory fallback) or the layer is disabled.
 *
 * Supported variables:
 *   DATABASE_URL / DB_URL  connection string, its scheme picks the driver
 *   DB_DRIVER              forces a driver (memory|sqlite|postgres|mysql|mongodb)
 *   DB_SQLITE_PATH         file path for the sqlite driver (default .data/freund.db)
 *   DB_NAME                database/schema name override
 *   DB_DISABLE=1           turns the layer off entirely
 */
export function isDbDisabled(): boolean {
  return /^(1|true|yes|on)$/i.test(normalize(process.env.DB_DISABLE));
}

export function resolveDbConfig(): DbConfig | null {
  if (isDbDisabled()) return null;

  const url = normalize(process.env.DATABASE_URL) || normalize(process.env.DB_URL);
  const forced = normalize(process.env.DB_DRIVER).toLowerCase() as DbDriverName;
  const forcedIsKnown = KNOWN_DRIVERS.includes(forced);

  if (!url && !forcedIsKnown) return null;
  if (!url && forced === "memory") return { driver: "memory", url: "memory" };
  if (!url && forced !== "sqlite") return null; // every other driver needs a connection string

  if (url) {
    const inferred = inferDriver(url);
    const driver = forcedIsKnown && forced !== "memory" ? forced : (inferred || "memory");
    if (driver === "memory") return null;
    if (!inferred && !forcedIsKnown) return null;
    return { driver, url, database: databaseNameFromUrl(url, driver) };
  }

  // No URL: only sqlite can work with a local file path.
  const sqlitePath = normalize(process.env.DB_SQLITE_PATH) || ".data/freund.db";
  return { driver: "sqlite", url: sqlitePath };
}
