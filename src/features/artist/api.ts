import { apiFetch } from "@/lib/api";
import {
  artistProfileSchema,
  type ArtistInput,
  type ArtistProfile,
} from "@/features/artist/types";

export async function fetchArtistProfile(): Promise<ArtistProfile> {
  return artistProfileSchema.parse(await apiFetch("/api/artist"));
}

/** Studio desk only: answers 401 without the admin session cookie. */
export async function saveArtistProfile(
  input: ArtistInput,
): Promise<ArtistProfile> {
  return artistProfileSchema.parse(
    await apiFetch("/api/admin/artist", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  );
}
