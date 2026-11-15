"use client";

import Link from "next/link";

import { Brush, BrushSwatches } from "@/components/brush";
import { LanguageSwitch } from "@/components/site/language-switch";
import { useScrolled } from "@/hooks/use-scrolled";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

/**
 * The header is an island: a soft-cornered strip floating a little below the
 * top edge, centred, narrower than the page. These two class lists are its
 * whole shape, shared with `BackHeader` so the two headers cannot drift.
 *
 * The dock is the full-width sticky strip the island sits in. It takes no
 * clicks itself, so the page shows — and works — either side of the island.
 */
export const ISLAND_DOCK =
  "pointer-events-none sticky top-0 z-20 px-[clamp(12px,3vw,40px)] pt-[var(--space-2)]";

export const ISLAND =
  "domino pointer-events-auto mx-auto flex max-w-[1080px] items-center gap-2 rounded-[18px] px-[clamp(12px,2.2vw,28px)] sm:gap-[var(--space-4)] py-[var(--space-2)] transition-[background,backdrop-filter,box-shadow] duration-[400ms]";

/**
 * The main nav. It floats over the hero with no background at all, and only
 * earns its veil of paper once the page has moved beneath it.
 */
export function SiteHeader({ onCollection }: { onCollection?: () => void }) {
  const { t } = useT();
  const scrolled = useScrolled();

  return (
    <header className={ISLAND_DOCK}>
      <div
        className={cn(
          ISLAND,
          "[--domino-step:60ms]",
          scrolled ? "atelier-veil" : "bg-transparent",
        )}
      >
        {/* On a phone the island is about 330px of room: the swatches and the
            divider step aside, and the links scroll sideways if a longer
            translation still does not fit. */}
        <div className="me-auto flex items-center gap-[var(--space-2)]">
          <BrushSwatches className="hidden sm:flex" />
          <span className="font-scribble text-[21px] font-semibold tracking-[-0.01em]">
            {t.brand}
          </span>
        </div>

        <nav className="flex min-w-0 gap-2.5 overflow-x-auto text-[14px] whitespace-nowrap [scrollbar-width:none] sm:gap-[var(--space-4)] sm:text-[15px]">
          <a
            href="#collection"
            onClick={(e) => {
              if (!onCollection) return;
              e.preventDefault();
              onCollection();
            }}
          >
            {t.navCollection}
          </a>
          <Link href="/artist">{t.navArtist}</Link>
        </nav>

        <Brush
          shape="vert"
          color="currentColor"
          className="hidden h-[26px] w-1.5 flex-none opacity-50 sm:block"
        />

        <LanguageSwitch />
      </div>
    </header>
  );
}
