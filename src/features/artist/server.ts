import "server-only";

import { mutateDb, newId, readDb } from "@/db";
import type { StoredArtist } from "@/db/schema";
import type { ArtistInput, ArtistProfile } from "@/features/artist/types";
import { releaseImages } from "@/server/media";

export const ARTIST_ID = "default";

/** Stored document → wire. Photographs take their position from their order. */
function serializeArtist(row: StoredArtist): ArtistProfile {
  return {
    id: ARTIST_ID,
    portrait: row.portrait,
    email: row.email,
    instagramUrl: row.instagramUrl,
    pinterestUrl: row.pinterestUrl,
    behanceUrl: row.behanceUrl,
    studioPhotos: row.studioPhotos.map((photo, position) => ({
      ...photo,
      position,
    })),
    // Most recent first, however they were entered.
    milestones: row.milestones.toSorted((a, b) => b.year - a.year),
  };
}

function imagesOf(row: StoredArtist): Array<string | undefined> {
  return [row.portrait?.url, ...row.studioPhotos.map((p) => p.image.url)];
}

/**
 * The studio is a single document. It is still fetched through the feature
 * layer so the page, the route handler and the client hook all read the same
 * shape.
 */
export async function getArtistProfile(): Promise<ArtistProfile> {
  const { artist } = await readDb();
  return serializeArtist(artist);
}

export async function updateArtistProfile(
  input: ArtistInput,
): Promise<ArtistProfile> {
  let before: Array<string | undefined> = [];

  const profile = await mutateDb((db) => {
    before = imagesOf(db.artist);
    db.artist = {
      portrait: input.portrait,
      email: input.email,
      instagramUrl: input.instagramUrl,
      pinterestUrl: input.pinterestUrl,
      behanceUrl: input.behanceUrl,
      studioPhotos: input.studioPhotos.map((photo) => ({
        id: photo.id ?? newId(),
        image: photo.image,
        caption: photo.caption,
      })),
      milestones: input.milestones.map((milestone) => ({
        id: milestone.id ?? newId(),
        year: milestone.year,
        text: milestone.text,
      })),
    };
    return serializeArtist(db.artist);
  });

  await releaseImages(before);
  return profile;
}
