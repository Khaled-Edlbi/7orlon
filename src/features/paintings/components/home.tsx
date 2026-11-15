"use client";

import * as React from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Hero } from "@/features/paintings/components/hero";
import { Showcase } from "@/features/paintings/components/showcase";
import { WorksIndex } from "@/features/paintings/components/works-index";

/**
 * The landing page: a hero that rotates through recent work, the showcase that
 * shows one painting at a time, and the plain index of everything else.
 */
export function Home() {
  const showcaseRef = React.useRef<HTMLElement | null>(null);

  const toShowcase = React.useCallback(() => {
    showcaseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <SiteHeader onCollection={toShowcase} />
      <Hero onCollection={toShowcase} />
      <Showcase sectionRef={showcaseRef} />
      <WorksIndex onSelect={toShowcase} />
      <SiteFooter />
    </>
  );
}
