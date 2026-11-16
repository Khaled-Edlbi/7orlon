"use client";

import * as React from "react";

import Link from "next/link";

import { Brush, BrushButton } from "@/components/brush";
import { Reveal } from "@/components/motion";
import { BackHeader } from "@/components/site/back-header";
import { SiteFooter } from "@/components/site/site-footer";
import { EnquiryForm } from "@/features/paintings/components/enquiry-form";
import { ImageSwitcher } from "@/features/paintings/components/image-switcher";
import { StockTag } from "@/features/paintings/components/stock-tag";
import { ZoomOverlay } from "@/features/paintings/components/zoom-overlay";
import { PLATE, STRONG } from "@/features/paintings/plates";
import { usePainting, usePaintings } from "@/features/paintings/queries";
import { useT } from "@/hooks/use-t";
import { counter, price } from "@/lib/format";

export function PaintingDetail({ slug }: { slug: string }) {
  const { t, locale, rtl } = useT();
  const { data: painting } = usePainting(slug);
  const { data: list } = usePaintings();

  const [zoomed, setZoomed] = React.useState(false);

  // Which of the work's photographs is up. Clamped rather than trusted: the
  // studio can remove a picture while this page is open.
  const images = painting.images;
  const [chosen, setShot] = React.useState(0);
  const shot = Math.min(chosen, Math.max(0, images.length - 1));
  const shown = images[shot];

  // ← and → swap photographs, the way they walk the collection on the front
  // page — but not while someone is typing an enquiry, and not under the
  // full-screen view, which has its own keys.
  React.useEffect(() => {
    if (images.length < 2 || zoomed) return;

    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof Element &&
        e.target.closest("input, textarea, select, [contenteditable]")
      ) {
        return;
      }

      const forward = rtl ? "ArrowLeft" : "ArrowRight";
      const back = rtl ? "ArrowRight" : "ArrowLeft";
      if (e.key !== forward && e.key !== back) return;

      const delta = e.key === forward ? 1 : -1;
      setShot((shot + delta + images.length) % images.length);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, rtl, shot, zoomed]);

  const all = list.paintings;
  const index = Math.max(
    0,
    all.findIndex((p) => p.slug === slug),
  );
  const total = all.length;
  const previous = all[(index - 1 + total) % total];
  const next = all[(index + 1) % total];

  const copy = painting.copy[locale];

  return (
    <>
      <BackHeader
        href="/#collection"
        label={t.back}
        trailing={
          <span className="text-ink-mute text-[13px]">
            {counter(index + 1, locale)} {t.of} {counter(total, locale)}
          </span>
        }
      />

      {/* --- the work, alone ------------------------------------------- */}
      <div className="domino relative isolate flex h-[calc(100vh-70px)] min-h-[420px] [--domino-step:110ms] w-full items-center justify-center px-[clamp(20px,5vw,72px)] py-[clamp(24px,5vh,64px)]">
        <Brush
          shape="block2"
          color={PLATE[painting.plate]}
          className="absolute inset-[14%_22%_10%_20%] -z-10"
        />

        {shown ? (
          // Every photograph is stacked in the same place and only the chosen
          // one is opaque, so swapping is a cross-fade and the next picture is
          // already loaded by the time it is asked for. Order 0: the work is
          // the first thing to land, with the plate behind it.
          <div className="relative h-full w-full [--domino-order:0]">
            {images.map((image, k) => (
              <div
                key={image.url}
                role="img"
                aria-label={copy.title}
                aria-hidden={k !== shot}
                className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-700 ease-atelier"
                style={{
                  backgroundImage: `url("${image.url}")`,
                  filter: "drop-shadow(0 30px 60px rgb(32 30 29 / 0.22))",
                  opacity: k === shot ? 1 : 0,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-ink-mute m-0 text-sm">{t.noImage}</p>
        )}

        <ImageSwitcher
          count={images.length}
          index={shot}
          onChange={setShot}
          inset="clamp(12px, 3vw, 48px)"
          // Inside the stage's bottom padding, so the dots sit under the
          // picture rather than on it.
          bottom="clamp(8px, 1.6vh, 20px)"
        />

        {shown && (
          <button
            type="button"
            aria-label={t.fullscreen}
            onClick={() => setZoomed(true)}
            className="text-primary-foreground absolute bottom-[clamp(20px,4vh,40px)] isolate z-20 inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent px-[18px] py-[11px] font-sans text-sm whitespace-nowrap transition-transform duration-300 ease-atelier hover:rotate-[-1deg] hover:scale-[1.04]"
            style={{ insetInlineEnd: "clamp(20px, 5vw, 72px)" }}
          >
            <Brush
              shape="dab"
              color="var(--primary)"
              className="absolute inset-0 -z-10"
            />
            ⤢ {t.fullscreen}
          </button>
        )}
      </div>

      {/* --- what it is ------------------------------------------------
          One section, one series, fired when half of it is on screen. The
          copy leads, a line at a time (0–360ms); then the specifications
          column (540ms), its rows, and last the previous/next links. Each
          parent lands before its children. Pace-1 times, as everywhere.

          Two parts keep a trigger of their own so they are never played to
          nobody: the enquiry form, which sits a screen further down, and the
          specifications, which are below the form once the columns stack.
          Side by side the specifications are already on screen when the
          section fires, so they simply take their place in the series. */}
      <Reveal className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-[clamp(32px,6vw,96px)] px-[clamp(20px,5vw,72px)] pt-[clamp(40px,7vh,80px)] pb-[clamp(60px,10vh,120px)]">
        <div className="domino flex max-w-[620px] flex-col gap-[var(--space-4)] [--domino-step:90ms]">
          <p className="text-ink-mute m-0 text-[13px] tracking-[0.14em] uppercase">
            {copy.meta}
          </p>

          <h1 className="relative isolate m-0 inline-block text-[clamp(40px,4.6vw,72px)] leading-[1.02] font-semibold tracking-[-0.02em] text-balance">
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
          </h1>

          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <span className="text-[32px] font-semibold tracking-[-0.01em]">
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
                className="text-primary-foreground"
              >
                <a href="#enquire">{t.buy}</a>
              </BrushButton>
            ) : (
              <BrushButton
                shape="dab"
                color="var(--primary)"
                tilt={-1.5}
                disabled
                className="text-primary-foreground"
              >
                {t.sold}
              </BrushButton>
            )}
            <BrushButton
              asChild
              shape="line2"
              color="#90F1EF"
              tilt={1.5}
              className="text-foreground"
            >
              <a href="#enquire">{t.enquire}</a>
            </BrushButton>
          </div>

          <p className="text-ink-soft mt-[var(--space-2)] mb-0 text-lg leading-[1.65] text-pretty">
            {copy.description}
          </p>

          <Reveal className="mt-[var(--space-6)]">
            <EnquiryForm slug={painting.slug} title={copy.title} />
          </Reveal>
        </div>

        {/* The 540ms wait is for the copy beside it, so it only applies once
            the columns are side by side (the grid splits at about 900px). */}
        <Reveal className="flex flex-col gap-[var(--space-4)] pt-[clamp(0px,4vh,40px)] [--domino-order:0] [--domino-step:90ms] min-[900px]:[--domino-base:540ms]">
          <h3 className="relative isolate m-0 inline-block text-[22px] font-semibold tracking-[-0.01em]">
            <Brush
              shape="line4"
              color="#F5D95A"
              className="absolute -z-10 rotate-[-1.5deg]"
              style={{
                insetInlineStart: "-6%",
                bottom: -6,
                width: "112%",
                height: "0.5em",
              }}
            />
            {t.specs}
          </h3>

          {/* One beat after the heading: the column's base plus its 90ms step. */}
          <dl className="domino mt-[var(--space-2)] grid grid-cols-[auto_minmax(0,1fr)] gap-x-[var(--space-6)] gap-y-[var(--space-2)] text-[15px] [--domino-order:0] [--domino-base:90ms] [--domino-step:35ms] min-[900px]:[--domino-base:630ms]">
            <Spec label={t.medium} value={copy.medium} />
            <Spec label={t.size} value={copy.size} />
            <Spec label={t.year} value={copy.year} />
            <Spec label={t.edition} value={t.editionV} />
            <Spec label={t.signature} value={t.signatureV} />
            <Spec label={t.frame} value={t.frameV} />
            <Spec label={t.shipping} value={t.shippingV} />
            <Spec label={t.certificate} value={t.certificateV} />
          </dl>

          {/* Order 6: after the last specification row has started. */}
          <div className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-3)] [--domino-order:6]">
            <Link
              href={`/works/${previous.slug}`}
              className="inline-flex items-baseline gap-2 text-[15px]"
            >
              <span aria-hidden="true">{rtl ? "→" : "←"}</span>
              <span className="text-ink-mute">{t.previous}</span>
              {previous.copy[locale].title}
            </Link>
            <Link
              href={`/works/${next.slug}`}
              className="ms-auto inline-flex items-baseline gap-2 text-[15px]"
            >
              {next.copy[locale].title}
              <span className="text-ink-mute">{t.next}</span>
              <span aria-hidden="true">{rtl ? "←" : "→"}</span>
            </Link>
          </div>
        </Reveal>
      </Reveal>

      <SiteFooter />

      {zoomed && shown && (
        <ZoomOverlay
          src={shown.url}
          title={copy.title}
          onClose={() => setZoomed(false)}
        />
      )}
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-ink-mute">{label}</dt>
      <dd className="m-0">{value}</dd>
    </>
  );
}
