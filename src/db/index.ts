import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { databaseSchema, type Database } from "@/db/schema";

/**
 * The database is one JSON file kept in the repository: `data/db.json`.
 *
 * Reads parse the file through its zod schema, so a hand-edit that breaks the
 * shape fails loudly at the first request rather than three components deep.
 * Writes go through `mutateDb`, which serialises them on a single queue and
 * replaces the file atomically — two saves landing together can never
 * interleave, and a crash mid-write can never leave half a file behind.
 *
 * This needs a filesystem that persists between requests: a laptop, a VPS, a
 * container with a volume. It does not work on a read-only serverless host.
 */
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

const DB_FILE = path.join(DATA_DIR, "db.json");

export async function readDb(): Promise<Database> {
  const raw = await fs.readFile(DB_FILE, "utf8");
  return databaseSchema.parse(JSON.parse(raw));
}

async function writeDb(db: Database): Promise<void> {
  const body = `${JSON.stringify(db, null, 2)}\n`;
  const temp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(temp, body, "utf8");

  // Windows refuses to rename over a file another handle still has open (an
  // editor, an indexer). That clears in milliseconds, so try a few times
  // before giving up on atomicity and writing in place.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await fs.rename(temp, DB_FILE);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 20 * (attempt + 1)));
    }
  }
  await fs.writeFile(DB_FILE, body, "utf8");
  await fs.rm(temp, { force: true });
}

// The queue lives on globalThis so a hot reload in development does not start
// a second one racing the first.
const globalForDb = globalThis as unknown as { dbQueue?: Promise<unknown> };

/**
 * Read, change, write — as one step. `change` receives the current database
 * and edits it in place; whatever it returns is handed back to the caller.
 * If it throws, nothing is written.
 */
export function mutateDb<T>(change: (db: Database) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const db = await readDb();
    const result = await change(db);
    await writeDb(databaseSchema.parse(db));
    return result;
  };

  const next = (globalForDb.dbQueue ?? Promise.resolve()).then(run, run);
  globalForDb.dbQueue = next.catch(() => undefined);
  return next;
}

export function newId(): string {
  return randomUUID();
}

/** Every image the database currently points at. */
export function referencedImages(db: Database): Set<string> {
  const urls = new Set<string>();
  for (const p of db.paintings) for (const i of p.images) urls.add(i.url);
  for (const s of db.heroSlides) urls.add(s.image.url);
  if (db.artist.portrait) urls.add(db.artist.portrait.url);
  for (const p of db.artist.studioPhotos) urls.add(p.image.url);
  return urls;
}
