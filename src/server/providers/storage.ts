import "server-only";

import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Where uploaded photographs go.
 *
 * Kept behind a small interface, like every other provider, so the day the
 * gallery outgrows a folder the bucket can be swapped in without touching a
 * feature. Today there is one implementation: the repository itself.
 */
export interface ImageStorage {
  /** Stores the bytes and returns the public URL they are served from. */
  save(bytes: Uint8Array, extension: ImageExtension): Promise<string>;
  /** Reads a stored file back by its bare name, or null if it is not ours. */
  read(name: string): Promise<{ bytes: Uint8Array; contentType: string } | null>;
  /** Deletes a stored file. A URL this provider did not issue is ignored. */
  remove(url: string): Promise<void>;
}

export type ImageExtension = "jpg" | "png" | "webp" | "gif";

export class StorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "StorageError";
  }
}

const CONTENT_TYPE: Record<ImageExtension, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

/** Names this provider issues: nothing that could climb out of the folder. */
const SAFE_NAME = /^[a-z0-9]+-[a-f0-9]+\.(jpg|png|webp|gif)$/;

const PUBLIC_PREFIX = "/uploads/";

/**
 * Files land in `public/uploads/`, inside the repository, so a photograph is
 * committed alongside the row in `data/db.json` that points at it.
 */
function repoStorage(): ImageStorage {
  const dir = path.join(process.cwd(), "public", "uploads");

  return {
    async save(bytes, extension) {
      const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${extension}`;
      try {
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, name), bytes);
      } catch (cause) {
        throw new StorageError("The photograph could not be stored.", { cause });
      }
      return `${PUBLIC_PREFIX}${name}`;
    },

    async read(name) {
      if (!SAFE_NAME.test(name)) return null;
      try {
        const bytes = await fs.readFile(path.join(dir, name));
        const extension = name.slice(name.lastIndexOf(".") + 1) as ImageExtension;
        return { bytes, contentType: CONTENT_TYPE[extension] };
      } catch {
        return null;
      }
    },

    async remove(url) {
      if (!url.startsWith(PUBLIC_PREFIX)) return;
      const name = url.slice(PUBLIC_PREFIX.length);
      if (!SAFE_NAME.test(name)) return;
      await fs.rm(path.join(dir, name), { force: true });
    },
  };
}

export const imageStorage: ImageStorage = repoStorage();
