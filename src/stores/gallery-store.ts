"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

/**
 * Client state only.
 *
 * Nothing here comes from, or goes to, the server — paintings, hero slides and
 * the studio profile all live in TanStack Query. This store holds what the
 * visitor is currently *doing*: which language they read in, which painting the
 * showcase is on, which page of the index they are looking at.
 */
type GalleryState = {
  locale: Locale;
  /** Index into the collection, in `position` order. */
  current: number;
  /** +1 when moving forward, -1 back. Slides lean the way you are travelling. */
  direction: 1 | -1;
  /** Zero-based page of the "All works" index. */
  indexPage: number;
  /** Set once persisted state has been read, so SSR and the client agree. */
  hydrated: boolean;

  setLocale: (locale: Locale) => void;
  setCurrent: (index: number) => void;
  step: (delta: number, total: number) => void;
  setIndexPage: (page: number) => void;
  setHydrated: () => void;
};

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      current: 0,
      direction: 1,
      indexPage: 0,
      hydrated: false,

      setLocale: (locale) => set({ locale }),
      setCurrent: (index) =>
        set((s) => ({
          current: index,
          direction: index >= s.current ? 1 : -1,
        })),
      step: (delta, total) =>
        set((s) => ({
          current: total > 0 ? (s.current + delta + total) % total : 0,
          direction: delta >= 0 ? 1 : -1,
        })),
      setIndexPage: (indexPage) => set({ indexPage }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "7orlon:gallery",
      storage: createJSONStorage(() => localStorage),
      // Only the reading language deserves to outlive the tab. Where someone
      // happened to be in the carousel does not.
      partialize: (state) => ({ locale: state.locale }),
      // Rehydration is deferred so the server-rendered markup and the first
      // client render match; `hydrated` flips when the stored value lands.
      skipHydration: true,
    },
  ),
);

/** The reading language, and the setter for the EN/عربي switch. */
export function useLocale() {
  return useGalleryStore(
    useShallow((s) => ({
      locale: s.locale,
      hydrated: s.hydrated,
      setLocale: s.setLocale,
    })),
  );
}

/** Where the showcase is, and how to move it. */
export function useShowcase() {
  return useGalleryStore(
    useShallow((s) => ({
      current: s.current,
      direction: s.direction,
      setCurrent: s.setCurrent,
      step: s.step,
    })),
  );
}

export function useIndexPage() {
  return useGalleryStore(
    useShallow((s) => ({
      indexPage: s.indexPage,
      setIndexPage: s.setIndexPage,
    })),
  );
}
