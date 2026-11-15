import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PaintingsAdmin } from "@/features/admin/components/paintings-admin";
import { DeskSkeleton } from "@/features/admin/components/ui";
import { requireAdminPage } from "@/features/admin/server";
import { paintingKeys } from "@/features/paintings/queries";
import { listPaintings } from "@/features/paintings/server";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

export default async function AdminPaintingsPage() {
  await requireAdminPage();

  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: paintingKeys.list(),
    queryFn: listPaintings,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DeskSkeleton />}>
        <PaintingsAdmin />
      </Suspense>
    </HydrationBoundary>
  );
}
