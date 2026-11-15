import { z } from "zod";

import { PLATE_ORDER } from "@/features/paintings/plates";

/**
 * The wire format for paintings. Everything that crosses the network — route
 * handler responses, client fetchers, query caches — is described here and
 * nowhere else. Prisma rows never leave `server.ts`.
 */

export const localeSchema = z.enum(["en", "ar"]);

export const plateSchema = z.enum(PLATE_ORDER);

export const imageSchema = z.object({
  url: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const paintingCopySchema = z.object({
  title: z.string(),
  /** "Oil on linen · 90 × 120 cm · 2025" */
  meta: z.string(),
  description: z.string(),
  /** The three halves of `meta`, split for the specs table. */
  medium: z.string(),
  size: z.string(),
  year: z.string(),
});

export const paintingSchema = z.object({
  id: z.string(),
  slug: z.string(),
  position: z.number().int().nonnegative(),
  plate: plateSchema,
  /** BigInt cents, serialised as a decimal string. Never a float. */
  priceMinor: z.string().regex(/^\d+$/),
  currency: z.string().length(3),
  inStock: z.boolean(),
  /** The cover — the first of `images`, or null while there are none. */
  image: imageSchema.nullable(),
  /** Every photograph of the work, in viewing order. */
  images: z.array(imageSchema),
  copy: z.record(localeSchema, paintingCopySchema),
});

export const paintingListSchema = z.object({
  paintings: z.array(paintingSchema),
  total: z.number().int().nonnegative(),
});

export const heroSlideSchema = z.object({
  id: z.string(),
  position: z.number().int().nonnegative(),
  image: imageSchema,
  alt: z.record(localeSchema, z.string()),
});

export const heroSlideListSchema = z.object({
  slides: z.array(heroSlideSchema),
});

// --- the studio desk ---------------------------------------------------------

/**
 * A picture the studio is attaching to something. Only paths this app serves
 * itself are accepted: the seeded `/images/` and whatever came through the
 * upload route into `/uploads/`.
 */
export const localImageSchema = imageSchema.extend({
  url: z
    .string()
    .regex(/^\/(?:uploads|images)\/[\w.-]+$/, "Upload the picture first."),
});

export const slugSchema = z
  .string()
  .trim()
  .min(1, "An address is required.")
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Lowercase letters, numbers and hyphens only.",
  );

const copyInputSchema = z.object({
  title: z.string().trim().min(1, "A title is required.").max(200),
  meta: z.string().trim().max(300),
  description: z.string().trim().max(4000),
});

/** How many photographs one work can carry. */
export const MAX_PAINTING_IMAGES = 12;

/** Everything the studio can set on a work. Used to create and to replace. */
export const paintingInputSchema = z.object({
  slug: slugSchema,
  plate: plateSchema,
  priceMinor: z.string().regex(/^\d{1,12}$/, "Enter a price."),
  inStock: z.boolean(),
  /** In viewing order; the first becomes the cover. */
  images: z.array(localImageSchema).max(MAX_PAINTING_IMAGES),
  copy: z.object({ en: copyInputSchema, ar: copyInputSchema }),
});

/** The whole collection's ids, in the order they should hang. */
export const reorderPaintingsSchema = z.object({
  ids: z.array(z.string()).min(1),
});

/** The hero wall is saved as one list; a slide without an id is new. */
export const heroSlidesInputSchema = z.object({
  slides: z
    .array(
      z.object({
        id: z.string().optional(),
        image: localImageSchema,
        alt: z.object({
          en: z.string().trim().max(300),
          ar: z.string().trim().max(300),
        }),
      }),
    )
    .max(12),
});

/** Curator action: mark a work sold, or put it back on the wall. */
export const updatePaintingSchema = z.object({
  inStock: z.boolean(),
});

export const createEnquirySchema = z.object({
  name: z.string().trim().min(2, "Please give a name we can reply to."),
  email: z.email("That does not look like an email address."),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two helps the studio reply well.")
    .max(2000),
});

export const enquirySchema = z.object({
  id: z.string(),
  paintingId: z.string(),
  name: z.string(),
  email: z.string(),
  message: z.string(),
  createdAt: z.iso.datetime(),
});

/** An enquiry as the studio reads it: with the work it was about. */
export const adminEnquirySchema = enquirySchema.extend({
  painting: z
    .object({ slug: z.string(), title: z.record(localeSchema, z.string()) })
    .nullable(),
});

export const adminEnquiryListSchema = z.object({
  enquiries: z.array(adminEnquirySchema),
});

export const ratesSchema = z.object({
  base: z.string().length(3),
  rates: z.record(z.string(), z.number().positive()),
  fetchedAt: z.iso.datetime(),
});

export type PaintingLocale = z.infer<typeof localeSchema>;
export type PaintingImage = z.infer<typeof imageSchema>;
export type PaintingCopy = z.infer<typeof paintingCopySchema>;
export type Painting = z.infer<typeof paintingSchema>;
export type PaintingList = z.infer<typeof paintingListSchema>;
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type HeroSlideList = z.infer<typeof heroSlideListSchema>;
export type PaintingInput = z.infer<typeof paintingInputSchema>;
export type HeroSlidesInput = z.infer<typeof heroSlidesInputSchema>;
export type AdminEnquiry = z.infer<typeof adminEnquirySchema>;
export type AdminEnquiryList = z.infer<typeof adminEnquiryListSchema>;
export type UpdatePaintingInput = z.infer<typeof updatePaintingSchema>;
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type Enquiry = z.infer<typeof enquirySchema>;
export type Rates = z.infer<typeof ratesSchema>;
