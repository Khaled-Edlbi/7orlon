import { Suspense } from "react";

import { notFound } from "next/navigation";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PaintingEditor } from "@/features/admin/components/painting-form";
import { DeskSkeleton } from "@/features/admin/components/ui";
import { requireAdminPage } from "@/features/admin/server";
import { paintingKeys } from "@/features/paintings/queries";
import { listPaintings } from "@/features/paintings/server";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

export default async function AdminEditPaintingPage(
  props: PageProps<"/admin/paintings/[id]">,
) {
  await requireAdminPage();
  const { id } = await props.params;

  const list = await listPaintings();
  if (!list.paintings.some((painting) => painting.id === id)) notFound();

  // The editor reads the work out of the collection, under the list's key, so
  // saving it refreshes the list the studio goes back to.
  const queryClient = makeQueryClient();
  queryClient.setQueryData(paintingKeys.list(), list);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DeskSkeleton />}>
        <PaintingEditor id={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
