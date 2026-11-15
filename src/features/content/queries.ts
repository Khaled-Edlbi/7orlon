/**
 * Query options and hooks for site copy. See the note in
 * `features/paintings/queries.ts` on why this file is not "use client".
 */
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { fetchSiteContent, saveSiteContent } from "@/features/content/api";
import type { SiteContentInput } from "@/features/content/types";

export const contentKeys = {
  all: ["content"] as const,
  site: () => [...contentKeys.all, "site"] as const,
};

export const siteContentOptions = () =>
  queryOptions({
    queryKey: contentKeys.site(),
    queryFn: fetchSiteContent,
  });

/**
 * Deliberately not a suspense query. `useT()` reads this from every component
 * on the site, including the error and not-found screens that no page
 * prefetches for; those should render at once with the default copy rather
 * than suspend on a request for text they may not even have overrides for.
 */
export function useSiteContent() {
  return useQuery(siteContentOptions());
}

export function useSaveSiteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SiteContentInput) => saveSiteContent(input),
    onSuccess: (content) => {
      queryClient.setQueryData(contentKeys.site(), content);
    },
  });
}
