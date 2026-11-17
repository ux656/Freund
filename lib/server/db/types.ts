/** Shared types for the database connection layer. */

/** Drivers the connection layer understands. */
export type DbDriverName = "memory" | "sqlite" | "postgres" | "mysql" | "mongodb";

/**
 * unconfigured  – no DATABASE_URL/DB_DRIVER in the environment (memory only)
 * disabled      – DB_DISABLE=1, the layer stays out of the way
 * idle          – configured, first connection attempt not made yet
 * connecting    – first connection attempt in flight
 * connected     – driver is ready
 * error         – last attempt failed, retries are on cooldown
 */
export type DbStatus =
  | "unconfigured"
  | "disabled"
  | "idle"
  | "connecting"
  | "connected"
  | "error";

/** A stored record. `id` is the primary key inside its collection. */
export type DbRecord = Record<string, unknown> & { id: string };

export interface DbDriver {
  readonly name: DbDriverName;
  connect(): Promise<void>;
  /** Round-trip probe, resolves to the latency in milliseconds. */
  ping(): Promise<number>;
  close(): Promise<void>;
  put(collection: string, record: DbRecord): Promise<void>;
  get<T extends DbRecord>(collection: string, id: string): Promise<T | null>;
  /** Newest first, ordered by `updatedAt`. */
  list<T extends DbRecord>(collection: string, limit?: number): Promise<T[]>;
  remove(collection: string, id: string): Promise<void>;
  clear(collection: string): Promise<void>;
}

export interface DbConfig {
  driver: DbDriverName;
  /** Connection string (postgres/mysql/mongodb) or file path (sqlite). */
  url: string;
  database?: string;
}

export interface DbHealth {
  status: DbStatus;
  driver: DbDriverName | null;
  latencyMs: number | null;
  since: number | null;
  error: string | null;
}
