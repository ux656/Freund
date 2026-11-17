/** PostgreSQL driver (pg). One shared table stores every collection as JSONB. */

import type { DbDriver, DbRecord } from "../types";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS freund_documents (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (collection, id)
);
CREATE INDEX IF NOT EXISTS freund_documents_order
  ON freund_documents (collection, updated_at DESC);
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PgPool = any;

function parseData(value: unknown): DbRecord | null {
  const data = typeof value === "string" ? safeParse(value) : value;
  return data && typeof data === "object" && !Array.isArray(data) ? (data as DbRecord) : null;
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createPostgresDriver(url: string): DbDriver {
  let pool: PgPool = null;

  const query = async (sql: string, params: unknown[] = []) => {
    if (!pool) throw new Error("postgres is not connected");
    return pool.query(sql, params);
  };

  return {
    name: "postgres",
    async connect() {
      if (pool) return;
      const { Pool } = (await import("pg")) as unknown as {
        Pool: new (options: Record<string, unknown>) => PgPool;
      };
      pool = new Pool({
        connectionString: url,
        max: 4,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
        application_name: "freund-dashboard",
      });
      await query(SCHEMA);
    },
    async ping() {
      const started = Date.now();
      await query("SELECT 1");
      return Date.now() - started;
    },
    async close() {
      const current = pool;
      pool = null;
      if (current) await current.end();
    },
    async put(name, record) {
      await query(
        `INSERT INTO freund_documents (collection, id, data, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (collection, id)
         DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
        [name, record.id, JSON.stringify(record), Number(record.updatedAt ?? Date.now())],
      );
    },
    async get<T extends DbRecord>(name: string, id: string) {
      const result = await query(
        "SELECT data FROM freund_documents WHERE collection = $1 AND id = $2",
        [name, id],
      );
      return parseData(result.rows?.[0]?.data) as T | null;
    },
    async list<T extends DbRecord>(name: string, limit = 100) {
      const result = await query(
        "SELECT data FROM freund_documents WHERE collection = $1 ORDER BY updated_at DESC LIMIT $2",
        [name, Math.max(1, limit)],
      );
      return (result.rows ?? [])
        .map((row: { data: unknown }) => parseData(row.data))
        .filter(Boolean) as T[];
    },
    async remove(name, id) {
      await query("DELETE FROM freund_documents WHERE collection = $1 AND id = $2", [name, id]);
    },
    async clear(name) {
      await query("DELETE FROM freund_documents WHERE collection = $1", [name]);
    },
  };
}
