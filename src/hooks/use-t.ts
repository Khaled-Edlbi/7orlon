"use client";

import * as React from "react";

import { useSiteContent } from "@/features/content/queries";
import { ADMIN_T, dirOf, T, type Dictionary, type Locale } from "@/lib/i18n";
import { useLocale } from "@/stores/gallery-store";

/**
 * The active language and its dictionary.
 *
 * Before the persisted preference has been read, this reports English — the
 * same thing the server rendered — so nothing flickers between markup and
 * hydration.
 *
 * The dictionary is the default copy from `i18n.ts` with the studio's rewrites
 * (server state, edited at /admin/content) laid over it. Pages prefetch those
 * rewrites, so the first paint already has them; where nothing was prefetched
 * the defaults show until the request lands.
 */
export function useT() {
  const { locale, hydrated } = useLocale();
  const active: Locale = hydrated ? locale : "en";
  const { data: content } = useSiteContent();

  const overrides = content?.[active];
  const t = React.useMemo<Dictionary>(
    () => (overrides ? { ...T[active], ...overrides } : T[active]),
    [active, overrides],
  );

  return {
    locale: active,
    t,
    /** The desk's own labels — never rewritten, see `ADMIN_T`. */
    a: ADMIN_T[active],
    rtl: active === "ar",
    dir: dirOf(active),
    /** +1 in LTR, -1 in RTL — multiply any horizontal offset by this. */
    sign: active === "ar" ? -1 : 1,
  } as const;
}
