/** In-memory driver: used when no database is configured and as the hot path fallback. */

import type { DbDriver, DbRecord } from "../types";

// Kept on globalThis so `next dev` hot reloads do not wipe the data.
declare global {
  var __freundMemoryDb: Map<string, Map<string, DbRecord>> | undefined;
}

function store(): Map<string, Map<string, DbRecord>> {
  return (globalThis.__freundMemoryDb ??= new Map());
}

function collection(name: string): Map<string, DbRecord> {
  let bucket = store().get(name);
  if (!bucket) {
    bucket = new Map();
    store().set(name, bucket);
  }
  return bucket;
}

const clone = (record: DbRecord): DbRecord => ({ ...record });

export function createMemoryDriver(): DbDriver {
  return {
    name: "memory",
    async connect() {
      store();
    },
    async ping() {
      return 0;
    },
    async close() {
      // Nothing to release; the store stays available for the next connect.
    },
    async put(name, record) {
      collection(name).set(record.id, clone(record));
    },
    async get<T extends DbRecord>(name: string, id: string) {
      const found = collection(name).get(id);
      return found ? (clone(found) as T) : null;
    },
    async list<T extends DbRecord>(name: string, limit = 100) {
      return [...collection(name).values()]
        .sort((a, b) => Number(b.updatedAt ?? 0) - Number(a.updatedAt ?? 0))
        .slice(0, Math.max(1, limit))
        .map(entry => clone(entry) as T);
    },
    async remove(name, id) {
      collection(name).delete(id);
    },
    async clear(name) {
      store().delete(name);
    },
  };
}
