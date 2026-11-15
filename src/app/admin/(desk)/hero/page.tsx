import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { HeroAdmin } from "@/features/admin/components/hero-admin";
import { DeskSkeleton } from "@/features/admin/components/ui";
import { requireAdminPage } from "@/features/admin/server";
import { paintingKeys } from "@/features/paintings/queries";
import { listHeroSlides } from "@/features/paintings/server";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  await requireAdminPage();

  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: paintingKeys.hero(),
    queryFn: listHeroSlides,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DeskSkeleton />}>
        <HeroAdmin />
      </Suspense>
    </HydrationBoundary>
  );
}
