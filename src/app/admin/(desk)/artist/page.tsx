import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ArtistAdmin } from "@/features/admin/components/artist-admin";
import { DeskSkeleton } from "@/features/admin/components/ui";
import { requireAdminPage } from "@/features/admin/server";
import { artistKeys } from "@/features/artist/queries";
import { getArtistProfile } from "@/features/artist/server";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

export default async function AdminArtistPage() {
  await requireAdminPage();

  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: artistKeys.profile(),
    queryFn: getArtistProfile,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DeskSkeleton />}>
        <ArtistAdmin />
      </Suspense>
    </HydrationBoundary>
  );
}
