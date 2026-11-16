"use client";

import Link from "next/link";

import { Brush, BrushSwatches } from "@/components/brush";
import { LanguageSwitch } from "@/components/site/language-switch";
import { useScrolled } from "@/hooks/use-scrolled";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

/**
 * The header has two widths. At the top of a page it is part of the page: as
 * wide as the 1440px column every section is laid out on, with the same
 * gutter, so the brand sits exactly above the hero's first line. Once the page
 * moves beneath it, it draws in to an island: a soft-cornered strip floating a
 * little below the top edge, centred, narrower than the page.
 *
 * These two class lists are its whole shape, shared with `BackHeader` so the
 * two headers cannot drift. Width and padding are plain lengths in both
 * states, so the change between them is a transition, not a jump — a slow
 * one, on `--ease-settle`, with the veil fading in over the same 900ms so the
 * strip narrows and gains its paper as one movement.
 *
 * The dock is the full-width sticky strip the island sits in. It takes no
 * clicks itself, so the page shows — and works — either side of the island.
 */
export function islandDock(scrolled: boolean) {
  return cn(
    // `island-dock` is a hook for globals.css: the section after it waits for
    // the header before starting its own cascade.
    "island-dock ease-settle pointer-events-none sticky top-0 z-20 pt-[var(--space-2)] transition-[padding] duration-[900ms]",
    scrolled ? "px-[clamp(12px,3vw,40px)]" : "px-0",
  );
}

export function island(scrolled: boolean) {
  return cn(
    "domino ease-settle pointer-events-auto mx-auto flex items-center gap-2 rounded-[18px] py-[var(--space-2)] transition-[max-width,padding,background,backdrop-filter,box-shadow] duration-[900ms] sm:gap-[var(--space-4)]",
    scrolled
      ? "atelier-veil max-w-[1080px] px-[clamp(12px,2.2vw,28px)]"
      : "max-w-[1440px] bg-transparent px-[clamp(20px,5vw,72px)]",
  );
}

/**
 * The main nav. It floats over the hero with no background at all, and only
 * earns its veil of paper once the page has moved beneath it.
 */
export function SiteHeader({ onCollection }: { onCollection?: () => void }) {
  const { t } = useT();
  const scrolled = useScrolled();

  return (
    <header className={islandDock(scrolled)}>
      <div className={cn(island(scrolled), "[--domino-step:60ms]")}>
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
