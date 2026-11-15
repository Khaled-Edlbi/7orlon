import "server-only";

import { readDb, referencedImages } from "@/db";
import { imageStorage } from "@/server/providers/storage";

/**
 * Deletes uploaded files that nothing in the database points at any more.
 *
 * Call it after a write, with the URLs the write let go of. A URL that is
 * still used somewhere else (the same photograph on a painting and on the hero
 * wall, say) is left alone, and so is anything the storage provider did not
 * issue — the seeded pictures in `public/images/` are never touched.
 */
export async function releaseImages(
  urls: Array<string | null | undefined>,
): Promise<void> {
  const candidates = urls.filter((url): url is string => Boolean(url));
  if (candidates.length === 0) return;

  const inUse = referencedImages(await readDb());
  await Promise.all(
    candidates
      .filter((url) => !inUse.has(url))
      // A file that will not delete is litter, not a failed save.
      .map((url) => imageStorage.remove(url).catch(() => undefined)),
  );
}
