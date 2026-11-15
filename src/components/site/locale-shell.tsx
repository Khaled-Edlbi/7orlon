"use client";

import * as React from "react";

import { dirOf } from "@/lib/i18n";
import { useGalleryStore, useLocale } from "@/stores/gallery-store";

/**
 * Sets the reading direction for everything inside it.
 *
 * The language is client state (it is a reader's preference, not a route), so
 * the server always renders English left-to-right and this component switches
 * once the persisted choice has been read. Rehydration is deliberately deferred
 * — see `skipHydration` in the store — so the first client render matches the
 * server's exactly and React never has to patch up a mismatch.
 */
export function LocaleShell({ children }: { children: React.ReactNode }) {
  const { locale, hydrated } = useLocale();

  React.useEffect(() => {
    // `rehydrate()` may be async (a custom storage could be), so only flip the
    // flag once the stored language has actually landed in the store.
    void Promise.resolve(useGalleryStore.persist.rehydrate()).then(() =>
      useGalleryStore.getState().setHydrated(),
    );
  }, []);

  const active = hydrated ? locale : "en";
  const dir = dirOf(active);

  React.useEffect(() => {
    document.documentElement.lang = active;
    document.documentElement.dir = dir;
  }, [active, dir]);

  return (
    <div dir={dir} lang={active} className="isolate min-h-screen">
      {children}
    </div>
  );
}
