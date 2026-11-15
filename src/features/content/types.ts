import { z } from "zod";

/**
 * Site copy on the wire: for each language, the lines the studio has
 * rewritten, keyed by their name in `src/lib/i18n.ts`. A key that is absent
 * means "use the default" — the response is a set of overrides, not a full
 * dictionary.
 */
const overridesSchema = z.record(z.string(), z.string());

export const siteContentSchema = z.object({
  en: overridesSchema,
  ar: overridesSchema,
});

/**
 * What the desk sends back: the full text of every line, in both languages.
 * The server keeps only the ones that differ from the default.
 */
const linesSchema = z.record(z.string(), z.string().max(2000));

export const siteContentInputSchema = z.object({
  en: linesSchema,
  ar: linesSchema,
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type SiteContentInput = z.infer<typeof siteContentInputSchema>;
