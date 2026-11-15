"use client";

import { Brush, BrushSwatches } from "@/components/brush";
import { Reveal } from "@/components/motion";
import { useT } from "@/hooks/use-t";

export function SiteFooter() {
  const { t } = useT();

  return (
    <Reveal asChild>
      <footer className="text-ink-mute relative mx-auto flex max-w-[1440px] flex-wrap justify-between gap-[var(--space-4)] px-[clamp(20px,5vw,72px)] py-[var(--space-8)] text-[13px]">
      <span className="relative isolate inline-block px-0.5 py-1">
        <Brush
          shape="line4"
          color="#8FE06B"
          className="absolute -z-10 rotate-[-1deg] opacity-80"
          style={{ top: -6, insetInlineEnd: -14, bottom: -8, insetInlineStart: -10 }}
        />
        {t.footer}
      </span>
      <BrushSwatches size="flat" />
      </footer>
    </Reveal>
  );
}
