/**
 * SQLite driver built on the `node:sqlite` module that ships with Node.js >= 22.5.
 * Zero native dependencies, single file database, ideal for self-hosted deployments.
 */

import type { DbDriver, DbRecord } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqliteHandle = any;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS freund_documents (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (collection, id)
);
CREATE INDEX IF NOT EXISTS freund_documents_order
  ON freund_documents (collection, updated_at DESC);
`;

function toRecord(row: { data?: string } | undefined | null): DbRecord | null {
  if (!row || typeof row.data !== "string") return null;
  try {
    const parsed = JSON.parse(row.data);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as DbRecord)
      : null;
  } catch {
    return null;
  }
}

export function createSqliteDriver(filePath: string): DbDriver {
  let db: SqliteHandle = null;
  const statements = new Map<string, SqliteHandle>();

  const prepare = (sql: string): SqliteHandle => {
    if (!db) throw new Error("sqlite is not connected");
    let stmt = statements.get(sql);
    if (!stmt) {
      stmt = db.prepare(sql);
      statements.set(sql, stmt);
    }
    return stmt;
  };

  const run = (sql: string, params: unknown[] = []) =>
    prepare(sql).run(...(params as never[]));

  return {
    name: "sqlite",
    async connect() {
      if (db) return;
      // Ships with Node >= 22.5; on older versions the import rejects with a clear error.
      const sqliteModule = (await import("node:sqlite")) as unknown as {
        DatabaseSync: new (path: string) => SqliteHandle;
      };
      const dir = filePath.replace(/[\\/][^\\/]+$/, "");
      if (dir && dir !== filePath) {
        const fs = await import("node:fs");
        fs.mkdirSync(dir, { recursive: true });
      }
      db = new sqliteModule.DatabaseSync(filePath);
      db.exec("PRAGMA journal_mode = WAL;");
      db.exec("PRAGMA synchronous = NORMAL;");
      db.exec(SCHEMA);
    },
    async ping() {
      const started = Date.now();
      run("SELECT 1 AS ok");
      return Date.now() - started;
    },
    async close() {
      statements.clear();
      try {
        db?.close();
      } catch {
        /* already closed */
      }
      db = null;
    },
    async put(name, record) {
      run(
        `INSERT INTO freund_documents (collection, id, data, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (collection, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
        [name, record.id, JSON.stringify(record), Number(record.updatedAt ?? Date.now())],
      );
    },
    async get<T extends DbRecord>(name: string, id: string) {
      const row = prepare("SELECT data FROM freund_documents WHERE collection = ? AND id = ?")
        .get(...([name, id] as never[])) as { data?: string } | undefined;
      return toRecord(row) as T | null;
    },
    async list<T extends DbRecord>(name: string, limit = 100) {
      const rows = (prepare(
        "SELECT data FROM freund_documents WHERE collection = ? ORDER BY updated_at DESC LIMIT ?",
      ).all(...([name, Math.max(1, limit)] as never[])) ?? []) as { data?: string }[];
      return rows.map(toRecord).filter(Boolean) as T[];
    },
    async remove(name, id) {
      run("DELETE FROM freund_documents WHERE collection = ? AND id = ?", [name, id]);
    },
    async clear(name) {
      run("DELETE FROM freund_documents WHERE collection = ?", [name]);
    },
  };
}
