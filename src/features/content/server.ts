import "server-only";

import { mutateDb, readDb } from "@/db";
import type { SiteContent, SiteContentInput } from "@/features/content/types";
import { DICTIONARY_KEYS, LOCALES, T } from "@/lib/i18n";

export async function getSiteContent(): Promise<SiteContent> {
  const { content } = await readDb();
  return content;
}

/**
 * Replaces the studio's rewrites. Only lines that exist in the dictionary, are
 * not blank, and actually differ from the default are kept — so clearing a
 * field, or typing the default back in, quietly returns that line to
 * `i18n.ts`, and the database never accumulates keys nothing reads.
 */
export async function updateSiteContent(
  input: SiteContentInput,
): Promise<SiteContent> {
  return mutateDb((db) => {
    const next: SiteContent = { en: {}, ar: {} };

    for (const locale of LOCALES) {
      for (const key of DICTIONARY_KEYS) {
        const value = input[locale][key]?.trim();
        if (value && value !== T[locale][key]) next[locale][key] = value;
      }
    }

    db.content = next;
    return next;
  });
}
