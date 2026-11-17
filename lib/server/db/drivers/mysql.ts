/** MySQL / MariaDB driver (mysql2). One shared table stores every collection as JSON. */

import type { DbDriver, DbRecord } from "../types";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS freund_documents (
  collection VARCHAR(191) NOT NULL,
  id VARCHAR(191) NOT NULL,
  data JSON NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (collection, id),
  KEY freund_documents_order (collection, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MysqlPool = any;

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

export function createMysqlDriver(url: string): DbDriver {
  let pool: MysqlPool = null;

  const query = async (sql: string, params: unknown[] = []) => {
    if (!pool) throw new Error("mysql is not connected");
    return pool.query(sql, params);
  };

  return {
    name: "mysql",
    async connect() {
      if (pool) return;
      const mysql = (await import("mysql2/promise")) as unknown as {
        createPool: (options: Record<string, unknown>) => MysqlPool;
      };
      pool = mysql.createPool({
        uri: url,
        connectionLimit: 4,
        connectTimeout: 10_000,
        waitForConnections: true,
        queueLimit: 0,
        charset: "utf8mb4",
      });
      await query(SCHEMA);
    },
    async ping() {
      const started = Date.now();
      await query("SELECT 1 AS ok");
      return Date.now() - started;
    },
    async close() {
      const current = pool;
      pool = null;
      if (current) await current.end();
    },
    async put(name, record) {
      const payload = JSON.stringify(record);
      const updatedAt = Number(record.updatedAt ?? Date.now());
      await query(
        `INSERT INTO freund_documents (collection, id, data, updated_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE data = ?, updated_at = ?`,
        [name, record.id, payload, updatedAt, payload, updatedAt],
      );
    },
    async get<T extends DbRecord>(name: string, id: string) {
      const rows = await query(
        "SELECT data FROM freund_documents WHERE collection = ? AND id = ?",
        [name, id],
      );
      return parseData(rows?.[0]?.data) as T | null;
    },
    async list<T extends DbRecord>(name: string, limit = 100) {
      const rows = await query(
        "SELECT data FROM freund_documents WHERE collection = ? ORDER BY updated_at DESC LIMIT ?",
        [name, Math.max(1, limit)],
      );
      return (Array.isArray(rows) ? rows : [])
        .map((row: { data: unknown }) => parseData(row.data))
        .filter(Boolean) as T[];
    },
    async remove(name, id) {
      await query("DELETE FROM freund_documents WHERE collection = ? AND id = ?", [name, id]);
    },
    async clear(name) {
      await query("DELETE FROM freund_documents WHERE collection = ?", [name]);
    },
  };
}
