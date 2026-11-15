import { z } from "zod";

import {
  imageSchema,
  localeSchema,
  localImageSchema,
} from "@/features/paintings/types";

export const studioPhotoSchema = z.object({
  id: z.string(),
  position: z.number().int().nonnegative(),
  image: imageSchema,
  caption: z.record(localeSchema, z.string()),
});

export const milestoneSchema = z.object({
  id: z.string(),
  year: z.number().int(),
  text: z.record(localeSchema, z.string()),
});

export const artistProfileSchema = z.object({
  id: z.string(),
  portrait: imageSchema.nullable(),
  email: z.email(),
  instagramUrl: z.url(),
  pinterestUrl: z.url(),
  behanceUrl: z.url(),
  studioPhotos: z.array(studioPhotoSchema),
  milestones: z.array(milestoneSchema),
});

// --- the studio desk ---------------------------------------------------------

/** These become `href`s, so only a web address will do — never `javascript:`. */
const webUrl = z.url({
  protocol: /^https?$/,
  error: "Use a full web address, starting with https://",
});

const bilingualText = z.object({
  en: z.string().trim().max(400),
  ar: z.string().trim().max(400),
});

/**
 * The studio profile is saved as one document. Photographs keep the order they
 * are sent in; a photograph or milestone without an id is new.
 */
export const artistInputSchema = z.object({
  portrait: localImageSchema.nullable(),
  email: z.email("That does not look like an email address."),
  instagramUrl: webUrl,
  pinterestUrl: webUrl,
  behanceUrl: webUrl,
  studioPhotos: z
    .array(
      z.object({
        id: z.string().optional(),
        image: localImageSchema,
        caption: bilingualText,
      }),
    )
    .max(24),
  milestones: z
    .array(
      z.object({
        id: z.string().optional(),
        year: z.number().int().min(1900).max(2100),
        text: bilingualText,
      }),
    )
    .max(60),
});

export type StudioPhoto = z.infer<typeof studioPhotoSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type ArtistProfile = z.infer<typeof artistProfileSchema>;
export type ArtistInput = z.infer<typeof artistInputSchema>;
