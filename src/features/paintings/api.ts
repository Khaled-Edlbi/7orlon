import { apiFetch } from "@/lib/api";
import {
  adminEnquiryListSchema,
  enquirySchema,
  heroSlideListSchema,
  paintingListSchema,
  paintingSchema,
  type AdminEnquiryList,
  type CreateEnquiryInput,
  type Enquiry,
  type HeroSlideList,
  type HeroSlidesInput,
  type Painting,
  type PaintingInput,
  type PaintingList,
} from "@/features/paintings/types";

/**
 * Thin client fetchers. Each one parses the response with the feature's schema,
 * so a route handler that starts returning a different shape fails here rather
 * than three components deep.
 */

export async function fetchPaintings(): Promise<PaintingList> {
  return paintingListSchema.parse(await apiFetch("/api/paintings"));
}

export async function fetchPainting(slug: string): Promise<Painting> {
  return paintingSchema.parse(
    await apiFetch(`/api/paintings/${encodeURIComponent(slug)}`),
  );
}

export async function fetchHeroSlides(): Promise<HeroSlideList> {
  return heroSlideListSchema.parse(await apiFetch("/api/hero-slides"));
}

export async function updatePaintingStock(
  slug: string,
  inStock: boolean,
): Promise<Painting> {
  return paintingSchema.parse(
    await apiFetch(`/api/paintings/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      body: JSON.stringify({ inStock }),
    }),
  );
}

export async function createEnquiry(
  slug: string,
  input: CreateEnquiryInput,
): Promise<Enquiry> {
  return enquirySchema.parse(
    await apiFetch(`/api/paintings/${encodeURIComponent(slug)}/enquiries`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

export async function deleteEnquiry(id: string): Promise<void> {
  await apiFetch<void>(`/api/enquiries/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// --- the studio desk ---------------------------------------------------------
// Everything below answers 401 without the admin session cookie.

export async function createPainting(input: PaintingInput): Promise<Painting> {
  return paintingSchema.parse(
    await apiFetch("/api/admin/paintings", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

export async function updatePainting(
  id: string,
  input: PaintingInput,
): Promise<Painting> {
  return paintingSchema.parse(
    await apiFetch(`/api/admin/paintings/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  );
}

export async function deletePainting(id: string): Promise<void> {
  await apiFetch<void>(`/api/admin/paintings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function reorderPaintings(ids: string[]): Promise<PaintingList> {
  return paintingListSchema.parse(
    await apiFetch("/api/admin/paintings/order", {
      method: "PUT",
      body: JSON.stringify({ ids }),
    }),
  );
}

export async function saveHeroSlides(
  input: HeroSlidesInput,
): Promise<HeroSlideList> {
  return heroSlideListSchema.parse(
    await apiFetch("/api/admin/hero-slides", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  );
}

export async function fetchEnquiries(): Promise<AdminEnquiryList> {
  return adminEnquiryListSchema.parse(await apiFetch("/api/admin/enquiries"));
}
