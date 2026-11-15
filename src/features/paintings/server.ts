import "server-only";

import { mutateDb, newId, readDb } from "@/db";
import type {
  StoredEnquiry,
  StoredHeroSlide,
  StoredPainting,
} from "@/db/schema";
import type {
  AdminEnquiryList,
  Enquiry,
  HeroSlide,
  HeroSlideList,
  HeroSlidesInput,
  Painting,
  PaintingCopy,
  PaintingInput,
  PaintingList,
} from "@/features/paintings/types";
import { releaseImages } from "@/server/media";

/** Prices are kept in USD cents; the rates provider converts on the way out. */
export const BASE_CURRENCY = "USD";

/**
 * "Oil on linen · 90 × 120 cm · 2025" is one editorial string in the database
 * — it reads as a caption. The specs table wants it in three pieces, so the
 * split happens here, once, rather than in three components.
 */
function splitMeta(meta: string): Pick<PaintingCopy, "medium" | "size" | "year"> {
  const [medium = "", size = "", year = ""] = meta.split("·").map((s) => s.trim());
  return { medium, size, year };
}

/**
 * Stored row → wire. Cents become a string, and a painting's place in the
 * array becomes its `position` — the file's order *is* the wall's order.
 */
function serializePainting(row: StoredPainting, position: number): Painting {
  const copyOf = (locale: "en" | "ar"): PaintingCopy => ({
    ...row.copy[locale],
    ...splitMeta(row.copy[locale].meta),
  });

  return {
    id: row.id,
    slug: row.slug,
    position,
    plate: row.plate,
    priceMinor: String(row.priceCents),
    currency: BASE_CURRENCY,
    inStock: row.inStock,
    image: row.images[0] ?? null,
    images: row.images,
    copy: { en: copyOf("en"), ar: copyOf("ar") },
  };
}

function serializeHeroSlide(row: StoredHeroSlide, position: number): HeroSlide {
  return { id: row.id, position, image: row.image, alt: row.alt };
}

function serializeEnquiry(row: StoredEnquiry): Enquiry {
  return { ...row };
}

// --- reads ------------------------------------------------------------------

export async function listPaintings(): Promise<PaintingList> {
  const { paintings } = await readDb();
  return { paintings: paintings.map(serializePainting), total: paintings.length };
}

export async function getPaintingBySlug(slug: string): Promise<Painting | null> {
  const { paintings } = await readDb();
  const index = paintings.findIndex((p) => p.slug === slug);
  return index < 0 ? null : serializePainting(paintings[index], index);
}

export async function listHeroSlides(): Promise<HeroSlideList> {
  const { heroSlides } = await readDb();
  return { slides: heroSlides.map(serializeHeroSlide) };
}

/** Newest first, each with the work it was about (if that work still hangs). */
export async function listEnquiries(): Promise<AdminEnquiryList> {
  const { enquiries, paintings } = await readDb();
  const byId = new Map(paintings.map((p) => [p.id, p]));

  return {
    enquiries: enquiries
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((row) => {
        const painting = byId.get(row.paintingId);
        return {
          ...serializeEnquiry(row),
          painting: painting
            ? {
                slug: painting.slug,
                title: {
                  en: painting.copy.en.title,
                  ar: painting.copy.ar.title,
                },
              }
            : null,
        };
      }),
  };
}

// --- writes: the collection -------------------------------------------------

export class SlugTakenError extends Error {
  constructor() {
    super("Another painting already uses this address.");
    this.name = "SlugTakenError";
  }
}

function applyInput(row: StoredPainting, input: PaintingInput): void {
  row.slug = input.slug;
  row.plate = input.plate;
  row.priceCents = Number(input.priceMinor);
  row.inStock = input.inStock;
  row.images = input.images;
  row.copy = input.copy;
  row.updatedAt = new Date().toISOString();
}

/** A new work goes to the end of the wall. */
export async function createPainting(input: PaintingInput): Promise<Painting> {
  return mutateDb((db) => {
    if (db.paintings.some((p) => p.slug === input.slug)) {
      throw new SlugTakenError();
    }
    const now = new Date().toISOString();
    const row = { id: newId(), createdAt: now } as StoredPainting;
    applyInput(row, input);
    db.paintings.push(row);
    return serializePainting(row, db.paintings.length - 1);
  });
}

export async function updatePainting(
  id: string,
  input: PaintingInput,
): Promise<Painting | null> {
  let before: string[] = [];

  const painting = await mutateDb((db) => {
    const index = db.paintings.findIndex((p) => p.id === id);
    if (index < 0) return null;
    if (db.paintings.some((p) => p.slug === input.slug && p.id !== id)) {
      throw new SlugTakenError();
    }
    const row = db.paintings[index];
    before = row.images.map((image) => image.url);
    applyInput(row, input);
    return serializePainting(row, index);
  });

  await releaseImages(before);
  return painting;
}

/** Returns false when there was nothing to delete, so the handler can 404. */
export async function deletePainting(id: string): Promise<boolean> {
  let orphaned: string[] = [];

  const deleted = await mutateDb((db) => {
    const index = db.paintings.findIndex((p) => p.id === id);
    if (index < 0) return false;
    orphaned = db.paintings[index].images.map((image) => image.url);
    db.paintings.splice(index, 1);
    // A work's enquiries go with it, as they did under the cascade.
    db.enquiries = db.enquiries.filter((e) => e.paintingId !== id);
    return true;
  });

  await releaseImages(orphaned);
  return deleted;
}

/**
 * Re-hangs the wall. `ids` must be exactly the current collection in its new
 * order — a list that has drifted from the database is refused (null) rather
 * than guessed at.
 */
export async function reorderPaintings(
  ids: string[],
): Promise<PaintingList | null> {
  return mutateDb((db) => {
    const byId = new Map(db.paintings.map((p) => [p.id, p]));
    const unique = new Set(ids);
    if (unique.size !== byId.size || ids.some((id) => !byId.has(id))) {
      return null;
    }
    db.paintings = ids.map((id) => byId.get(id)!);
    return {
      paintings: db.paintings.map(serializePainting),
      total: db.paintings.length,
    };
  });
}

export async function setPaintingStock(
  slug: string,
  inStock: boolean,
): Promise<Painting | null> {
  return mutateDb((db) => {
    const index = db.paintings.findIndex((p) => p.slug === slug);
    if (index < 0) return null;
    const row = db.paintings[index];
    row.inStock = inStock;
    row.updatedAt = new Date().toISOString();
    return serializePainting(row, index);
  });
}

// --- writes: the hero wall --------------------------------------------------

/** The hero wall is replaced whole; the list's order is the rotation's. */
export async function replaceHeroSlides(
  input: HeroSlidesInput,
): Promise<HeroSlideList> {
  let before: string[] = [];

  const list = await mutateDb((db) => {
    before = db.heroSlides.map((s) => s.image.url);
    db.heroSlides = input.slides.map((slide) => ({
      id: slide.id ?? newId(),
      image: slide.image,
      alt: slide.alt,
    }));
    return { slides: db.heroSlides.map(serializeHeroSlide) };
  });

  await releaseImages(before);
  return list;
}

// --- writes: enquiries ------------------------------------------------------

export class DuplicateEnquiryError extends Error {
  constructor() {
    super("An enquiry from this address already exists for this work.");
    this.name = "DuplicateEnquiryError";
  }
}

export async function createEnquiry(
  slug: string,
  input: { name: string; email: string; message: string },
): Promise<Enquiry | null> {
  return mutateDb((db) => {
    const painting = db.paintings.find((p) => p.slug === slug);
    if (!painting) return null;

    const email = input.email.toLowerCase();
    const existing = db.enquiries.some(
      (e) => e.paintingId === painting.id && e.email.toLowerCase() === email,
    );
    if (existing) throw new DuplicateEnquiryError();

    const row: StoredEnquiry = {
      id: newId(),
      paintingId: painting.id,
      ...input,
      createdAt: new Date().toISOString(),
    };
    db.enquiries.push(row);
    return serializeEnquiry(row);
  });
}

/** Returns false when there was nothing to delete, so the handler can 404. */
export async function deleteEnquiry(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const before = db.enquiries.length;
    db.enquiries = db.enquiries.filter((e) => e.id !== id);
    return db.enquiries.length < before;
  });
}
