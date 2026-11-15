"use client";

import * as React from "react";

import Link from "next/link";

import { BrushButton } from "@/components/brush";
import { ISLAND, ISLAND_DOCK } from "@/components/site/site-header";
import { useScrolled } from "@/hooks/use-scrolled";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

/**
 * The header the artist page and a work's page wear: one way back, and
 * whatever that page wants on the far end.
 */
export function BackHeader({
  href = "/",
  label,
  trailing,
}: {
  href?: string;
  label?: string;
  trailing?: React.ReactNode;
}) {
  const { t, rtl } = useT();
  const scrolled = useScrolled();

  return (
    <header className={ISLAND_DOCK}>
      <div className={cn(ISLAND, scrolled ? "atelier-veil" : "bg-transparent")}>
        <BrushButton
          asChild
          shape="wide"
          color="var(--color-plate-blush)"
          tilt={-1}
          size="sm"
          className="text-foreground"
        >
          <Link href={href}>
            <span aria-hidden="true">{rtl ? "→" : "←"}</span>
            {label ?? t.backHome}
          </Link>
        </BrushButton>
        <div className="ms-auto">{trailing}</div>
      </div>
    </header>
  );
}
