import { apiFetch } from "@/lib/api";
import {
  siteContentSchema,
  type SiteContent,
  type SiteContentInput,
} from "@/features/content/types";

export async function fetchSiteContent(): Promise<SiteContent> {
  return siteContentSchema.parse(await apiFetch("/api/content"));
}

/** Studio desk only: answers 401 without the admin session cookie. */
export async function saveSiteContent(
  input: SiteContentInput,
): Promise<SiteContent> {
  return siteContentSchema.parse(
    await apiFetch("/api/admin/content", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  );
}
