import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { contentKeys } from "@/features/content/queries";
import { getSiteContent } from "@/features/content/server";
import { Home } from "@/features/paintings/components/home";
import { HomeSkeleton } from "@/features/paintings/components/skeletons";
import { paintingKeys } from "@/features/paintings/queries";
import { listHeroSlides, listPaintings } from "@/features/paintings/server";
import { makeQueryClient } from "@/lib/query-client";

// The catalogue is read from the database on every request, so an edit made at
// the studio desk is on the wall at the next page load.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const queryClient = makeQueryClient();

  // Prefetch with exactly the keys the client hooks will ask for, using the
  // feature's own server functions — no HTTP round trip to our own API.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: paintingKeys.list(),
      queryFn: listPaintings,
    }),
    queryClient.prefetchQuery({
      queryKey: paintingKeys.hero(),
      queryFn: listHeroSlides,
    }),
    queryClient.prefetchQuery({
      queryKey: contentKeys.site(),
      queryFn: getSiteContent,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<HomeSkeleton />}>
        <Home />
      </Suspense>
    </HydrationBoundary>
  );
}
