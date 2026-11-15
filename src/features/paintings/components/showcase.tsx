"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import { Brush, BrushButton } from "@/components/brush";
import { Reveal } from "@/components/motion";
import { ImageSwitcher } from "@/features/paintings/components/image-switcher";
import { StockTag } from "@/features/paintings/components/stock-tag";
import { fitRect, hitsFor, ratioFromMeta } from "@/features/paintings/hits";
import { PLATE, STRONG } from "@/features/paintings/plates";
import { usePaintings } from "@/features/paintings/queries";
import type { Painting } from "@/features/paintings/types";
import { useElementSize } from "@/hooks/use-element-size";
import { useT } from "@/hooks/use-t";
import { counter, price } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useShowcase } from "@/stores/gallery-store";

/** Default proportions for a work whose photograph has not arrived yet. */
const FALLBACK_RATIO = 0.8;

export function Showcase({ sectionRef }: { sectionRef?: React.Ref<HTMLElement> }) {
  const { t, locale, rtl, sign } = useT();
  const { data } = usePaintings();
  const paintings = data.paintings;
  const total = paintings.length;

  const { current, direction, setCurrent, step } = useShowcase();
  const index = total > 0 ? Math.min(current, total - 1) : 0;
  const active = paintings[index];

  const [stageRef, stage] = useElementSize<HTMLDivElement>();

  // ← and → walk the collection; in Arabic they walk it the other way, because
  // that is the direction the page reads.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(rtl ? -1 : 1, total);
      if (e.key === "ArrowLeft") step(rtl ? 1 : -1, total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rtl, step, total]);

  // The label's lines wait their turn in the opening series (after the heading
  // and the picture). Once that has played, stepping to another work should
  // answer at once, so the wait drops away.
  const [settled, setSettled] = React.useState(false);

  // Which photograph each work is showing. Kept per work, so walking away from
  // a painting and back finds it as it was left.
  const [shots, setShots] = React.useState<Record<string, number>>({});
  const shotOf = (p: Painting) =>
    Math.min(shots[p.id] ?? 0, Math.max(0, p.images.length - 1));

  // The wall is cut to the photograph that is actually up, so the plate and
  // the marks around it re-fit when a work's pictures differ in shape.
  const activeImage = active ? active.images[shotOf(active)] : undefined;
  const ratio = active
    ? activeImage
      ? activeImage.width / activeImage.height
      : (ratioFromMeta(active.copy.en.meta) ?? FALLBACK_RATIO)
    : FALLBACK_RATIO;

  const rect = stage ? fitRect(stage, ratio) : null;
  const hits = rect && active ? hitsFor(index, rect, active.plate) : [];

  if (!active) return null;

  return (
    // One section, one series. Nothing shows until half of it is on screen;
    // then the heading, then the picture, then the label a line at a time,
    // and last the controls. The delays below are that order, in
    // milliseconds: heading 0 · picture 260 · label 520–880 · controls 1000+.
    <Reveal asChild amount={0.5}>
      <section
        id="collection"
        ref={sectionRef}
        className="relative mx-auto max-w-[1440px] px-[clamp(20px,5vw,72px)] pt-[clamp(48px,8vh,96px)] pb-[clamp(48px,8vh,96px)]"
      >
        <h2 className="relative isolate m-0 inline-block text-[clamp(30px,3.4vw,48px)] leading-[1.1] font-semibold tracking-[-0.02em]">
          <Brush
            shape="streaks"
            color={STRONG.blush}
            className="absolute -z-10 rotate-[-2deg]"
            style={{
              insetInlineStart: "-5%",
              bottom: -10,
              width: "114%",
              height: "0.62em",
            }}
          />
          {t.showKicker}
        </h2>

        <div className="domino grid min-h-[80vh] grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-[clamp(32px,6vw,96px)] pt-[clamp(24px,4vh,48px)] [--domino-base:260ms] [--domino-step:160ms]">
        {/* --- the wall ------------------------------------------------- */}
        <div
          ref={stageRef}
          className="relative mx-auto h-[clamp(320px,min(72vh,calc(100vw_-_40px)),720px)] w-full max-w-[640px]"
        >
          {rect && (
            <Brush
              shape="block2"
              color={PLATE[active.plate]}
              className="absolute transition-[left,top,width,height,background] duration-[900ms] ease-atelier"
              style={{
                left: rect.x - rect.w * 0.1,
                top: rect.y - rect.h * 0.08,
                width: rect.w * 1.2,
                height: rect.h * 1.18,
              }}
            />
          )}

          {hits.map((hit) => (
            <Brush
              key={hit.slot}
              shape={hit.shape}
              color={hit.color}
              className="absolute transition-[left,top,width,height,transform,background,opacity] duration-[900ms] ease-atelier"
              style={{
                left: hit.left,
                top: hit.top,
                width: hit.width,
                height: hit.height,
                transform: `rotate(${hit.rotate}deg)`,
                opacity: hit.opacity,
              }}
            />
          ))}

          <div className="absolute inset-0">
            {paintings.map((p, k) => {
              const on = k === index;
              const ahead = k > index ? 1 : k < index ? -1 : 0;
              const off = on ? 0 : (ahead || direction) * 60 * sign;
              const image = p.images[shotOf(p)];
              return (
                <div
                  key={p.id}
                  className="absolute inset-[clamp(16px,4%,32px)] transition-[opacity,transform] duration-[900ms] ease-atelier"
                  style={{
                    opacity: on ? 1 : 0,
                    transform: `translateX(${off}px) scale(${on ? 1 : 1.04})`,
                    pointerEvents: on ? "auto" : "none",
                  }}
                  aria-hidden={!on}
                >
                  {image ? (
                    <Image
                      // Keyed by the file, so a swap mounts a new picture
                      // and it fades in rather than snapping.
                      key={image.url}
                      src={image.url}
                      alt={p.copy[locale].title}
                      fill
                      sizes="(max-width: 1040px) 92vw, 640px"
                      className="animate-in fade-in object-contain duration-700"
                      priority={k === 0}
                    />
                  ) : (
                    <div className="text-ink-mute grid h-full place-items-center text-center text-sm">
                      {t.noImage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <ImageSwitcher
            count={active.images.length}
            index={shotOf(active)}
            onChange={(shot) =>
              setShots((current) => ({ ...current, [active.id]: shot }))
            }
            inset="-6px"
            bottom="-14px"
          />
        </div>

        {/* --- the label ------------------------------------------------ */}
        <div className="relative flex flex-col gap-[var(--space-4)]">
          <div className="relative grid">
            {paintings.map((p, k) => (
              <PaintingCopy
                key={p.id}
                painting={p}
                active={k === index}
                locale={locale}
                lead={settled ? 80 : 520}
              />
            ))}
          </div>

          <div
            className="domino flex items-center gap-[var(--space-4)] [--domino-base:1000ms] [--domino-step:80ms]"
            // The last control landing is the end of the opening series.
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget.lastElementChild) {
                setSettled(true);
              }
            }}
          >
            <button
              type="button"
              aria-label={t.previous}
              onClick={() => step(-1, total)}
              className="text-foreground relative isolate h-11 w-11 flex-none cursor-pointer border-0 bg-transparent font-sans text-xl leading-none transition-transform duration-300 ease-atelier hover:rotate-[-6deg] hover:scale-[1.08]"
            >
              <Brush
                shape="circle"
                color="#F7A3B8"
                className="absolute -inset-1 -z-10"
              />
              {rtl ? "→" : "←"}
            </button>

            <div className="flex min-w-0 flex-1 flex-col gap-2 px-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-[26px] leading-none font-semibold tracking-[-0.01em]">
                    {counter(index + 1, locale)}
                  </span>
                  <span className="text-ink-mute text-[13px]">
                    / {counter(total, locale)}
                  </span>
                </span>
                <span className="text-ink-mute text-xs whitespace-nowrap">
                  {t.hint}
                </span>
              </div>

              <Strip
                total={total}
                index={index}
                plate={active.plate}
                rtl={rtl}
                onSeek={setCurrent}
                label={t.showKicker}
              />
            </div>

            <button
              type="button"
              aria-label={t.next}
              onClick={() => step(1, total)}
              className="text-primary-foreground relative isolate h-11 w-11 flex-none cursor-pointer border-0 bg-transparent font-sans text-xl leading-none transition-transform duration-300 ease-atelier hover:rotate-[6deg] hover:scale-[1.08]"
            >
              <Brush
                shape="small"
                color="var(--primary)"
                className="absolute -inset-1 -z-10"
              />
              {rtl ? "←" : "→"}
            </button>
          </div>
        </div>
        </div>
      </section>
    </Reveal>
  );
}

function PaintingCopy({
  painting,
  active,
  locale,
  lead,
}: {
  painting: Painting;
  active: boolean;
  locale: "en" | "ar";
  /** Milliseconds before this work's first line starts to arrive. */
  lead: number;
}) {
  const { t } = useT();
  const copy = painting.copy[locale];

  return (
    <div
      // Only the work that is up wears the cascade, so its lines arrive in
      // series — on the first reveal, and again each time the wall changes.
      className={cn(
        "transition-[opacity,transform] duration-700 ease-atelier",
        active && "domino [--domino-step:90ms]",
      )}
      style={{
        ["--domino-base" as string]: `${lead}ms`,
        gridArea: "1 / 1",
        opacity: active ? 1 : 0,
        transform: `translateY(${active ? 0 : 22}px)`,
        transitionDelay: active ? "0.15s" : "0s",
        pointerEvents: active ? "auto" : "none",
      }}
      aria-hidden={!active}
    >
      <p className="text-ink-mute m-0 mb-[var(--space-3)] text-[13px] tracking-[0.14em] uppercase">
        {copy.meta}
      </p>

      <h2 className="relative isolate m-0 mb-[var(--space-3)] inline-block text-[clamp(36px,4.2vw,64px)] leading-[1.02] font-semibold tracking-[-0.02em] text-balance">
        <Brush
          shape="wide"
          color={STRONG[painting.plate]}
          className="absolute -z-10 rotate-[-1deg]"
          style={{
            insetInlineStart: "-3%",
            bottom: -10,
            width: "72%",
            height: "0.42em",
          }}
        />
        {copy.title}
      </h2>

      <p className="text-ink-soft m-0 mb-[var(--space-4)] max-w-[44ch] text-[17px] leading-[1.6] text-pretty">
        {copy.description}
      </p>

      <div className="mb-[var(--space-4)] flex flex-wrap items-center gap-[var(--space-3)]">
        <span className="text-[30px] font-semibold tracking-[-0.01em]">
          {price(painting.priceMinor, painting.currency, locale)}
        </span>
        <StockTag inStock={painting.inStock} />
      </div>

      <div className="flex flex-wrap gap-[var(--space-2)]">
        {painting.inStock ? (
          <BrushButton
            asChild
            shape="dab"
            color="var(--primary)"
            tilt={-1.5}
            className="text-primary-foreground px-9"
          >
            <Link href={`/works/${painting.slug}#enquire`}>{t.buy}</Link>
          </BrushButton>
        ) : (
          <BrushButton
            shape="dab"
            color="var(--primary)"
            tilt={-1.5}
            disabled
            className="text-primary-foreground px-9"
          >
            {t.sold}
          </BrushButton>
        )}

        <BrushButton
          asChild
          shape="line4"
          color="#FFEF9F"
          tilt={-1}
          className="text-foreground"
        >
          <Link href={`/works/${painting.slug}`}>{t.details}</Link>
        </BrushButton>
      </div>
    </div>
  );
}


function Strip({
  total,
  index,
  plate,
  rtl,
  onSeek,
  label,
}: {
  total: number;
  index: number;
  plate: keyof typeof STRONG;
  rtl: boolean;
  onSeek: (index: number) => void;
  label: string;
}) {
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let f = (e.clientX - rect.left) / rect.width;
    if (rtl) f = 1 - f;
    onSeek(Math.min(total - 1, Math.max(0, Math.floor(f * total))));
  };

  return (
    <div
      role="slider"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={index + 1}
      tabIndex={0}
      onClick={seek}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(Math.min(total - 1, index + 1));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, index - 1));
      }}
      className="relative flex h-3.5 cursor-pointer items-center"
    >
      <Brush
        shape="line3"
        color="var(--rule)"
        className="absolute inset-x-0 h-2.5"
      />
      <Brush
        shape="dab"
        color={STRONG[plate]}
        className="absolute top-1/2 -mt-2 h-4 transition-[inset-inline-start,background] duration-700 ease-atelier"
        style={{
          width: `${100 / total}%`,
          insetInlineStart: `${(index * 100) / total}%`,
        }}
      />
    </div>
  );
}
