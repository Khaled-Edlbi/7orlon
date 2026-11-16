"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Brush, BrushSwatches, type BrushShape } from "@/components/brush";
import { LanguageSwitch } from "@/components/site/language-switch";
import { usePageTransition } from "@/components/site/page-transition";
import { TextButton } from "@/features/admin/components/ui";
import { useLogout } from "@/features/admin/queries";
import { PLATE } from "@/features/paintings/plates";
import { useT } from "@/hooks/use-t";
import type { AdminDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: keyof AdminDictionary;
  /** The stroke that lights up behind the item when you are on its page. */
  shape: BrushShape;
  color: string;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "navOverview", shape: "wide", color: PLATE.mint },
  { href: "/admin/paintings", label: "navPaintings", shape: "line2", color: PLATE.blush },
  { href: "/admin/hero", label: "navHero", shape: "line4", color: PLATE.butter },
  { href: "/admin/artist", label: "navArtist", shape: "dab", color: PLATE.leaf },
  { href: "/admin/content", label: "navContent", shape: "line3", color: PLATE.jade },
  { href: "/admin/enquiries", label: "navEnquiries", shape: "wide", color: PLATE.blush },
];

/**
 * The frame every desk page sits in: the mark and the sections down the
 * inline-start edge (across the top on a narrow screen), the page beside it.
 * No panel, no divider — the column is set apart by space alone.
 *
 * Moving between sections from here is a small piece of theatre: the page you
 * are on fades out, the next one arrives a piece at a time (see `.domino` in
 * globals.css), and the column itself never moves — it is a fixed 220px, and
 * the desk reserves the scrollbar's gutter so a short page and a long one sit
 * in exactly the same place.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { t, a } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  // The fade-out itself is site-wide (`<PageTransition>` catches every link
  // click); the desk only has to react to it. Between two desk pages the
  // frame stays and this shell fades its own page.
  const { leaving, target } = usePageTransition();

  // The sidebar is the desk's header, so it arrives first: the page the desk
  // opens on waits a beat for it. Once the reader has moved to another desk
  // page the sidebar is already standing, and pages start at once.
  const [openedOn] = React.useState(pathname);
  const [moved, setMoved] = React.useState(false);
  if (!moved && pathname !== openedOn) setMoved(true);

  // The highlight moves on the click, not when the page arrives.
  const shownPath = target ?? pathname;

  const isActive = (href: string) =>
    href === "/admin" ? shownPath === href : shownPath.startsWith(href);

  return (
    <div className="desk mx-auto flex max-w-[1440px] flex-col gap-x-[clamp(24px,4vw,72px)] px-[clamp(20px,5vw,72px)] lg:flex-row">
      <aside className="domino flex flex-col gap-[var(--space-4)] pt-[var(--space-4)] lg:sticky lg:top-0 lg:h-screen lg:w-[220px] lg:flex-none lg:gap-[var(--space-8)] lg:self-start lg:pt-[var(--space-8)] lg:pb-[72px]">
        <Link href="/admin" className="flex items-center gap-[var(--space-2)]">
          <BrushSwatches />
          <span className="flex flex-col gap-1 leading-none">
            <span className="font-scribble text-[21px] font-semibold tracking-[-0.01em]">
              {t.brand}
            </span>
            <span className="text-ink-mute text-[11px] tracking-[0.14em] uppercase rtl:tracking-normal">
              {a.deskName}
            </span>
          </span>
        </Link>

        <nav
          aria-label={a.deskName}
          // The mark (0ms), then the sections one by one (90–290ms), then the
          // foot of the column — all inside the beat the page waits.
          className="domino -mx-2 flex gap-1 overflow-x-auto px-2 py-1 [--domino-order:0] [--domino-base:90ms] [--domino-step:40ms] lg:flex-col lg:overflow-visible"
        >
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative isolate flex-none px-4 py-2 text-[15px] whitespace-nowrap transition-transform duration-300 ease-atelier hover:translate-x-1 rtl:hover:-translate-x-1",
                  // On its own stroke the label stays ink, hover or not.
                  active && "text-foreground hover:text-foreground",
                )}
              >
                <Brush
                  shape={item.shape}
                  color={active ? item.color : "transparent"}
                  className="absolute inset-0 -z-10 transition-colors duration-500"
                />
                {a[item.label]}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] [--domino-order:5] lg:mt-auto lg:flex-col lg:items-start">
          <LanguageSwitch />
          <Link href="/" className="text-ink-mute text-[13px]">
            {a.viewSite} <span aria-hidden="true">↗</span>
          </Link>
          <TextButton
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => {
                  router.replace("/admin/login");
                  router.refresh();
                },
              })
            }
          >
            {a.signOut}
          </TextButton>
        </div>
      </aside>

      <main className="min-w-0 flex-1 pt-[var(--space-6)] pb-[clamp(60px,10vh,120px)] lg:pt-[var(--space-8)]">
        {/* Keyed by the route, so every page mounts fresh and its dominoes
            fall again; faded by the departure, so the old page leaves first. */}
        <div
          key={pathname}
          className={cn(
            "domino transition-opacity duration-[180ms] ease-atelier",
            // Opening: wait for the sidebar. Afterwards there is no header
            // beat to wait for, here or in any `<Reveal>` on the page.
            moved ? "[--domino-header-beat:0ms]" : "domino-opening",
            leaving ? "opacity-0" : "opacity-100",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
