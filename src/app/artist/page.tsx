import { Suspense } from "react";

import type { Metadata } from "next";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ArtistPage } from "@/features/artist/components/artist-page";
import { artistKeys } from "@/features/artist/queries";
import { getArtistProfile } from "@/features/artist/server";
import { contentKeys } from "@/features/content/queries";
import { getSiteContent } from "@/features/content/server";
import { ArtistSkeleton } from "@/features/paintings/components/skeletons";
import { T } from "@/lib/i18n";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

/** The name and introduction are site copy, so the tab title follows them. */
export async function generateMetadata(): Promise<Metadata> {
  const copy = { ...T.en, ...(await getSiteContent()).en };
  return {
    title: `${copy.aName} ${copy.aNameB}`,
    description: copy.aIntro,
  };
}

export default async function Artist() {
  const queryClient = makeQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: artistKeys.profile(),
      queryFn: getArtistProfile,
    }),
    queryClient.prefetchQuery({
      queryKey: contentKeys.site(),
      queryFn: getSiteContent,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ArtistSkeleton />}>
        <ArtistPage />
      </Suspense>
    </HydrationBoundary>
  );
}
