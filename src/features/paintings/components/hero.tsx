"use client";

import * as React from "react";

import Image from "next/image";

import { Brush, BrushButton } from "@/components/brush";
import { AnimatedNumber } from "@/components/motion";
import { useHeroSlides } from "@/features/paintings/queries";
import { useT } from "@/hooks/use-t";
import { digits } from "@/lib/format";

/** How long each hero painting holds the wall, in seconds. */
const HERO_INTERVAL = 5;

export function Hero({ onCollection }: { onCollection: () => void }) {
  const { t, locale, sign } = useT();
  const { data } = useHeroSlides();
  const slides = data.slides;

  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      HERO_INTERVAL * 1000,
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="domino relative mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] [--domino-step:220ms] items-center gap-[clamp(32px,6vw,96px)] px-[clamp(20px,5vw,72px)] pt-[clamp(28px,6vh,80px)] pb-[clamp(48px,10vh,120px)]">
      <div className="domino relative z-10 flex max-w-[600px] flex-col gap-[var(--space-4)] [--domino-step:80ms]">
        <p className="m-0 flex items-center gap-2.5 text-[13px] tracking-[0.14em] uppercase">
          <Brush shape="wide" color="#3ED6D3" className="h-3 w-[38px]" />
          {t.kicker}
        </p>

        <h1 className="m-0 text-[clamp(46px,7vw,104px)] leading-[0.98] font-semibold tracking-[-0.025em] text-balance">
          {t.heroA}{" "}
          <em className="font-scribble relative isolate inline-block leading-none font-normal not-italic">
            <Brush
              shape="line2"
              color="#F7A3B8"
              className="absolute -z-10 h-[46%] rotate-[-1.5deg]"
              style={{
                insetInlineStart: "-4%",
                insetInlineEnd: "-8%",
                bottom: "-4%",
              }}
            />
            {t.heroB}
          </em>
        </h1>

        <p className="text-ink-soft m-0 max-w-[46ch] text-[clamp(17px,1.4vw,21px)] leading-[1.55] text-pretty">
          {t.heroSub}
        </p>

        <div className="mt-[var(--space-2)]">
          <BrushButton
            shape="line2"
            color="var(--primary)"
            size="lg"
            tilt={-1.5}
            className="text-primary-foreground"
            onClick={onCollection}
          >
            {t.ctaPrimary}
          </BrushButton>
        </div>

        <div className="domino relative isolate mt-[var(--space-4)] flex flex-wrap gap-[clamp(20px,3vw,44px)] pt-1.5 [--domino-base:360ms] [--domino-step:90ms]">
          <Brush
            shape="line3"
            color="#3FD48A"
            className="absolute -top-2 -z-10 h-[22px] w-[min(70%,340px)] opacity-85"
            style={{ insetInlineStart: -16 }}
          />
          <Stat value={t.stat1} label={t.stat1l} locale={locale} />
          <Stat value={t.stat2} label={t.stat2l} locale={locale} />
          <Stat value={t.stat3} label={t.stat3l} locale={locale} />
        </div>
      </div>

      {/* The picture drops away from the copy once the two columns stack. */}
      <div
        className="relative mx-auto aspect-[4/5] max-h-[74vh] w-full max-w-[520px]"
        style={{ marginTop: "clamp(0px, (1000px - 100vw) * 1, 72px)" }}
      >
        <Brush
          shape="block"
          color="#3ED6D3"
          className="absolute inset-[34%_-24%_-16%_42%] opacity-80"
        />
        <Brush
          shape="splotch"
          color="#F5D95A"
          className="absolute inset-[-14%_48%_58%_-22%] opacity-85"
        />
        <Brush
          shape="blob"
          color="#F7A3B8"
          className="absolute inset-[62%_46%_-18%_-20%] opacity-85"
        />
        <Brush
          shape="streaks"
          color="#8FE06B"
          className="absolute inset-[-10%_-18%_70%_55%] rotate-[8deg] opacity-80"
        />

        <div className="atelier-frame absolute inset-0">
          {slides.map((slide, k) => {
            const on = k === active;
            const off = on ? 0 : (k > active ? 100 : -100) * sign;
            return (
              <div
                key={slide.id}
                className="absolute inset-0 transition-[transform,opacity] duration-1000 ease-atelier"
                style={{
                  transform: `translateX(${off}%)`,
                  opacity: on ? 1 : 0,
                  pointerEvents: on ? "auto" : "none",
                }}
              >
                <Image
                  src={slide.image.url}
                  alt={slide.alt[locale]}
                  fill
                  sizes="(max-width: 1000px) 100vw, 520px"
                  className="object-cover"
                  priority={k === 0}
                />
              </div>
            );
          })}
        </div>

        <div
          className="absolute -bottom-[18px] z-[2] flex gap-1.5"
          style={{ insetInlineEnd: 20 }}
        >
          {slides.map((slide, k) => (
            <button
              key={slide.id}
              type="button"
              aria-label={slide.alt[locale]}
              aria-current={k === active}
              onClick={() => setActive(k)}
              className="brush h-3 cursor-pointer border-0 p-0 transition-[width,background] duration-500 ease-atelier"
              style={{
                ["--brush" as string]: "url(/brush/wide.png)",
                width: k === active ? 26 : 12,
                background: k === active ? "var(--primary)" : "#bab6b6",
              }}
            />
          ))}
        </div>

        <div
          className="absolute -bottom-[18px] isolate flex rotate-[-2deg] items-center gap-2 px-4 py-2 text-[13px]"
          style={{ insetInlineStart: 24 }}
        >
          <Brush shape="wide" color="#C1FBA4" className="absolute inset-0 -z-10" />
          {t.heroBadge}
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
  locale,
}: {
  value: string;
  label: string;
  locale: "en" | "ar";
}) {
  // "32" counts up; "1 / 1" is a statement, not a quantity, so it just sits.
  const numeric = /^\d+$/.test(value) ? Number(value) : null;

  return (
    <div>
      <div className="text-[30px] leading-[1.6] font-semibold">
        {numeric === null ? (
          value
        ) : (
          <AnimatedNumber
            value={numeric}
            format={(n) => digits(Math.round(n), locale)}
          />
        )}
      </div>
      <div className="text-ink-mute mt-1 text-[13px]">{label}</div>
    </div>
  );
}
