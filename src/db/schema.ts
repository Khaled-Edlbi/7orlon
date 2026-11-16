import { z } from "zod";

import { PLATE_ORDER } from "@/features/paintings/plates";

/**
 * The shape of `data/db.json` — the whole database, in one file.
 *
 * These are *stored* shapes. They are not the wire format: `features/*\/server.ts`
 * turns a stored row into what crosses the network (cents → string, array
 * index → `position`), exactly as it used to turn a Prisma row into one.
 * Nothing outside `src/db` and the `server.ts` files should import from here.
 */

const storedImage = z.object({
  url: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const bilingual = z.object({ en: z.string(), ar: z.string() });

const storedCopy = z.object({
  title: z.string(),
  /** "Oil on linen · 90 × 120 cm · 2025" */
  meta: z.string(),
  description: z.string(),
});

const storedPainting = z.object({
  id: z.string(),
  slug: z.string(),
  plate: z.enum(PLATE_ORDER),
  /** Minor units. An integer, never a float; a string on the wire. */
  priceCents: z.number().int().nonnegative(),
  inStock: z.boolean(),
  /** In viewing order. The first is the cover; an empty list is "no photograph yet". */
  images: z.array(storedImage),
  /**
   * The work's real size, in centimetres — what the view-on-your-wall scales
   * the picture to. The "90 × 120 cm" in `copy.meta` is a caption, written
   * per language; this is the measurement. Null until the studio enters it.
   */
  sizeCm: z
    .object({ width: z.number().positive(), height: z.number().positive() })
    .nullable(),
  copy: z.object({ en: storedCopy, ar: storedCopy }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const storedEnquiry = z.object({
  id: z.string(),
  paintingId: z.string(),
  name: z.string(),
  email: z.string(),
  message: z.string(),
  createdAt: z.string(),
});

const storedHeroSlide = z.object({
  id: z.string(),
  image: storedImage,
  alt: bilingual,
});

const storedArtist = z.object({
  portrait: storedImage.nullable(),
  email: z.string(),
  instagramUrl: z.string(),
  pinterestUrl: z.string(),
  behanceUrl: z.string(),
  studioPhotos: z.array(
    z.object({ id: z.string(), image: storedImage, caption: bilingual }),
  ),
  milestones: z.array(
    z.object({ id: z.string(), year: z.number().int(), text: bilingual }),
  ),
});

export const databaseSchema = z.object({
  /** In wall order: a painting's `position` is its index in this array. */
  paintings: z.array(storedPainting),
  enquiries: z.array(storedEnquiry),
  /** In rotation order. */
  heroSlides: z.array(storedHeroSlide),
  artist: storedArtist,
  /** Interface copy the studio has rewritten; anything absent uses i18n.ts. */
  content: z.object({
    en: z.record(z.string(), z.string()),
    ar: z.record(z.string(), z.string()),
  }),
});

export type Database = z.infer<typeof databaseSchema>;
export type StoredPainting = z.infer<typeof storedPainting>;
export type StoredEnquiry = z.infer<typeof storedEnquiry>;
export type StoredHeroSlide = z.infer<typeof storedHeroSlide>;
export type StoredArtist = z.infer<typeof storedArtist>;
export type StoredImage = z.infer<typeof storedImage>;
