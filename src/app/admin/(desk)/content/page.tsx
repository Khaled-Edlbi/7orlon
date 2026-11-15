import { Suspense } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ContentAdmin } from "@/features/admin/components/content-admin";
import { DeskSkeleton } from "@/features/admin/components/ui";
import { requireAdminPage } from "@/features/admin/server";
import { contentKeys } from "@/features/content/queries";
import { getSiteContent } from "@/features/content/server";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdminPage();

  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: contentKeys.site(),
    queryFn: getSiteContent,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DeskSkeleton />}>
        <ContentAdmin />
      </Suspense>
    </HydrationBoundary>
  );
}
