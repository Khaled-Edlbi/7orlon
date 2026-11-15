/**
 * Query options and hooks for the artist feature. See the note in
 * `features/paintings/queries.ts` on why this file is not "use client".
 */
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { fetchArtistProfile, saveArtistProfile } from "@/features/artist/api";
import type { ArtistInput } from "@/features/artist/types";

export const artistKeys = {
  all: ["artist"] as const,
  profile: () => [...artistKeys.all, "profile"] as const,
};

export const artistProfileOptions = () =>
  queryOptions({
    queryKey: artistKeys.profile(),
    queryFn: fetchArtistProfile,
  });

export function useArtistProfile() {
  return useSuspenseQuery(artistProfileOptions());
}

export function useSaveArtistProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ArtistInput) => saveArtistProfile(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(artistKeys.profile(), profile);
    },
  });
}
