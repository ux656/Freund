/** MongoDB driver. Each collection maps to a real MongoDB collection. */

import type { DbDriver, DbRecord } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MongoCollection = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MongoDatabase = any;

const ID_FIELD = "id";

function normalize(doc: Record<string, unknown> | null | undefined): DbRecord | null {
  if (!doc || typeof doc !== "object") return null;
  const { _id, ...rest } = doc as Record<string, unknown> & { _id?: unknown };
  const id = typeof rest[ID_FIELD] === "string" ? (rest[ID_FIELD] as string) : String(_id ?? "");
  if (!id) return null;
  return { ...rest, [ID_FIELD]: id } as DbRecord;
}

export function createMongoDriver(url: string, database?: string): DbDriver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let client: any = null;
  let db: MongoDatabase = null;

  const collection = (name: string): MongoCollection => {
    if (!db) throw new Error("mongodb is not connected");
    return db.collection(name);
  };

  return {
    name: "mongodb",
    async connect() {
      if (client) return;
      const mongodb = (await import("mongodb")) as unknown as {
        MongoClient: new (uri: string, options?: Record<string, unknown>) => {
          connect: () => Promise<unknown>;
          db: (name?: string) => MongoDatabase;
          close: () => Promise<void>;
        };
      };
      client = new mongodb.MongoClient(url, {
        serverSelectionTimeoutMS: 8_000,
        connectTimeoutMS: 8_000,
        maxPoolSize: 4,
      });
      await client.connect();
      db = client.db(database || "freund");
    },
    async ping() {
      const started = Date.now();
      if (!db) throw new Error("mongodb is not connected");
      await db.command({ ping: 1 });
      return Date.now() - started;
    },
    async close() {
      const current = client;
      client = null;
      db = null;
      if (current) await current.close();
    },
    async put(name, record) {
      const updatedAt = Number(record.updatedAt ?? Date.now());
      await collection(name).updateOne(
        { _id: record.id },
        { $set: { ...record, [ID_FIELD]: record.id, updatedAt } },
        { upsert: true },
      );
    },
    async get<T extends DbRecord>(name: string, id: string) {
      return normalize(await collection(name).findOne({ _id: id })) as T | null;
    },
    async list<T extends DbRecord>(name: string, limit = 100) {
      const rows = await collection(name)
        .find({})
        .sort({ updatedAt: -1 })
        .limit(Math.max(1, limit))
        .toArray();
      return (rows as Record<string, unknown>[]).map(normalize).filter(Boolean) as T[];
    },
    async remove(name, id) {
      await collection(name).deleteOne({ _id: id });
    },
    async clear(name) {
      await collection(name).deleteMany({});
    },
  };
}
