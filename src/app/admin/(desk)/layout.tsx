import type { Metadata } from "next";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { requireAdminPage } from "@/features/admin/server";
import { contentKeys } from "@/features/content/queries";
import { getSiteContent } from "@/features/content/server";
import { makeQueryClient } from "@/lib/query-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio desk",
  robots: { index: false, follow: false },
};

/**
 * The frame around every desk page. The session is checked here *and* in each
 * page: a layout is not re-rendered on client-side navigation, so the pages —
 * and every admin route handler — never rely on this check alone.
 */
export default async function DeskLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminPage();

  // The shell shows the brand name, which is site copy the studio may have
  // rewritten — prefetched here so it is right on the first paint.
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: contentKeys.site(),
    queryFn: getSiteContent,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminShell>{children}</AdminShell>
    </HydrationBoundary>
  );
}
