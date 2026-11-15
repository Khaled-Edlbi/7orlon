import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Dashboard } from "@/features/admin/components/dashboard";
import { DeskSkeleton } from "@/features/admin/components/ui";
import { requireAdminPage } from "@/features/admin/server";
import { paintingKeys } from "@/features/paintings/queries";
import { listEnquiries, listPaintings } from "@/features/paintings/server";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdminPage();

  const queryClient = makeQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: paintingKeys.list(),
      queryFn: listPaintings,
    }),
    queryClient.prefetchQuery({
      queryKey: paintingKeys.enquiries(),
      queryFn: listEnquiries,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DeskSkeleton />}>
        <Dashboard />
      </Suspense>
    </HydrationBoundary>
  );
}
