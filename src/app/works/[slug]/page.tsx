import { Suspense } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { contentKeys } from "@/features/content/queries";
import { getSiteContent } from "@/features/content/server";
import { PaintingDetail } from "@/features/paintings/components/painting-detail";
import { DetailSkeleton } from "@/features/paintings/components/skeletons";
import { paintingKeys } from "@/features/paintings/queries";
import { getPaintingBySlug, listPaintings } from "@/features/paintings/server";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/works/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const painting = await getPaintingBySlug(slug);
  if (!painting) return { title: "Not found" };

  return {
    title: painting.copy.en.title,
    description: painting.copy.en.description,
    openGraph: {
      title: painting.copy.en.title,
      description: painting.copy.en.description,
      images: painting.image ? [painting.image.url] : undefined,
    },
  };
}

export default async function WorkPage(props: PageProps<"/works/[slug]">) {
  const { slug } = await props.params;

  const painting = await getPaintingBySlug(slug);
  if (!painting) notFound();

  const queryClient = makeQueryClient();
  queryClient.setQueryData(paintingKeys.detail(slug), painting);
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: paintingKeys.list(),
      queryFn: listPaintings,
    }),
    queryClient.prefetchQuery({
      queryKey: contentKeys.site(),
      queryFn: getSiteContent,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DetailSkeleton />}>
        {/* Keyed so each work opens on its cover, not on whichever
            photograph the previous work happened to be showing. */}
        <PaintingDetail key={slug} slug={slug} />
      </Suspense>
    </HydrationBoundary>
  );
}
