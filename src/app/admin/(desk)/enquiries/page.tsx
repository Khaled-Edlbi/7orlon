import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { EnquiriesAdmin } from "@/features/admin/components/enquiries-admin";
import { DeskSkeleton } from "@/features/admin/components/ui";
import { requireAdminPage } from "@/features/admin/server";
import { paintingKeys } from "@/features/paintings/queries";
import { listEnquiries } from "@/features/paintings/server";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  await requireAdminPage();

  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: paintingKeys.enquiries(),
    queryFn: listEnquiries,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DeskSkeleton />}>
        <EnquiriesAdmin />
      </Suspense>
    </HydrationBoundary>
  );
}
