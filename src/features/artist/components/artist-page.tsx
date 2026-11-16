"use client";

import * as React from "react";

import Image from "next/image";

import { Brush, BrushButton } from "@/components/brush";
import { Reveal } from "@/components/motion";
import { BackHeader } from "@/components/site/back-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useArtistProfile } from "@/features/artist/queries";
import { useT } from "@/hooks/use-t";
import { digits } from "@/lib/format";

export function ArtistPage() {
  const { t, locale } = useT();
  const { data: profile } = useArtistProfile();

  return (
    <>
      <BackHeader
        trailing={
          <span className="font-scribble text-[21px] font-semibold">
            {t.brand}
          </span>
        }
      />

      {/* --- portrait and introduction --------------------------------- */}
      <section className="domino mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(32px,6vw,96px)] px-[clamp(20px,5vw,72px)] pt-[clamp(28px,6vh,80px)] pb-[clamp(40px,8vh,96px)]">
        <div className="relative isolate mx-auto aspect-[4/5] max-h-[70vh] w-full max-w-[460px]">
          <Brush
            shape="splotch"
            color="#F5D95A"
            className="absolute inset-[-8%_40%_60%_-18%] -z-10 opacity-85"
          />
          <Brush
            shape="block"
            color="#3ED6D3"
            className="absolute inset-[55%_-20%_-12%_45%] -z-10 opacity-80"
          />
          <div className="atelier-frame absolute inset-0">
            {profile.portrait && (
              <Image
                src={profile.portrait.url}
                alt={`${t.aName} ${t.aNameB}`}
                fill
                sizes="(max-width: 900px) 100vw, 460px"
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>

        {/* The portrait leads; the copy follows on the hero's timing — the
            column lands on its base (order 0), then its lines one by one. */}
        <div className="domino relative z-10 flex max-w-[600px] flex-col gap-[var(--space-4)] [--domino-order:0] [--domino-base:320ms] [--domino-step:90ms]">
          <p className="m-0 flex items-center gap-2.5 text-[13px] tracking-[0.14em] uppercase">
            <Brush shape="wide" color="#F7A3B8" className="h-3 w-[38px]" />
            {t.aKicker}
          </p>

          <h1 className="m-0 text-[clamp(44px,6vw,92px)] leading-[0.98] font-semibold tracking-[-0.025em] text-balance">
            {t.aName}{" "}
            <em className="font-scribble relative isolate inline-block leading-none font-normal not-italic">
              <Brush
                shape="line2"
                color="#8FE06B"
                className="absolute -z-10 h-[46%] rotate-[-1.5deg]"
                style={{
                  insetInlineStart: "-4%",
                  insetInlineEnd: "-8%",
                  bottom: "-4%",
                }}
              />
              {t.aNameB}
            </em>
          </h1>

          <p className="text-ink-soft m-0 text-[clamp(17px,1.3vw,20px)] leading-[1.6] text-pretty">
            {t.aIntro}
          </p>

          <div className="flex flex-wrap gap-[var(--space-2)]">
            <BrushButton
              asChild
              shape="dab"
              color="var(--primary)"
              tilt={-1.5}
              className="text-primary-foreground px-8 py-[15px]"
            >
              <a href={profile.instagramUrl} target="_blank" rel="noopener">
                Instagram
              </a>
            </BrushButton>
            <BrushButton
              asChild
              shape="line4"
              color="#FFD6E0"
              tilt={1.5}
              className="text-foreground px-8 py-[15px]"
            >
              <a href={profile.pinterestUrl} target="_blank" rel="noopener">
                Pinterest
              </a>
            </BrushButton>
            <BrushButton
              asChild
              shape="line2"
              color="#90F1EF"
              tilt={-1}
              className="text-foreground px-8 py-[15px]"
            >
              <a href={profile.behanceUrl} target="_blank" rel="noopener">
                Behance
              </a>
            </BrushButton>
            <BrushButton
              asChild
              shape="wide"
              color="#FFEF9F"
              tilt={1}
              className="text-foreground px-8 py-[15px]"
            >
              <a href={`mailto:${profile.email}`}>{t.aEmail}</a>
            </BrushButton>
          </div>
        </div>
      </section>

      {/* --- statement and process ------------------------------------- */}
      <Reveal asChild>
      <section className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(24px,4vw,64px)] px-[clamp(20px,5vw,72px)] pb-[clamp(40px,8vh,96px)] [--domino-step:140ms]">
        <div className="domino [--domino-step:110ms]">
          <h2 className="relative isolate m-0 mb-[var(--space-3)] inline-block text-[clamp(28px,3vw,42px)] font-semibold tracking-[-0.02em]">
            <Brush
              shape="wide"
              color="#3ED6D3"
              className="absolute -z-10 rotate-[-1deg]"
              style={{
                insetInlineStart: "-4%",
                bottom: -8,
                width: "80%",
                height: "0.42em",
              }}
            />
            {t.aStatementH}
          </h2>
          <p className="text-ink-soft m-0 text-[17px] leading-[1.65] text-pretty">
            {t.aStatement1}
          </p>
        </div>

        {/* After the statement's two lines: lands on its base, then its own. */}
        <div className="domino [--domino-order:0] [--domino-base:220ms] [--domino-step:110ms]">
          <h2 className="relative isolate m-0 mb-[var(--space-3)] inline-block text-[clamp(28px,3vw,42px)] font-semibold tracking-[-0.02em]">
            <Brush
              shape="line4"
              color="#F7A3B8"
              className="absolute -z-10 rotate-[1deg]"
              style={{
                insetInlineStart: "-4%",
                bottom: -8,
                width: "80%",
                height: "0.42em",
              }}
            />
            {t.aProcessH}
          </h2>
          <p className="text-ink-soft m-0 text-[17px] leading-[1.65] text-pretty">
            {t.aProcess}
          </p>
        </div>
      </section>
      </Reveal>

      {/* --- the studio ------------------------------------------------ */}
      <Reveal asChild>
      <section className="mx-auto max-w-[1440px] px-[clamp(20px,5vw,72px)] pb-[clamp(40px,8vh,96px)]">
        <p className="m-0 mb-[var(--space-4)] flex items-center gap-2.5 text-[13px] tracking-[0.14em] uppercase">
          <Brush shape="wide" color="#F5D95A" className="h-3 w-[38px]" />
          {t.aStudio}
        </p>

        <div className="domino grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[var(--space-4)] [--domino-order:0] [--domino-base:140ms] [--domino-step:140ms]">
          {profile.studioPhotos.map((photo, k) => (
            <figure
              key={photo.id}
              className="relative isolate m-0 aspect-[4/3]"
              style={k === 1 ? { marginTop: "clamp(0px, 4vw, 40px)" } : undefined}
            >
              <Brush
                shape={STUDIO_MARKS[k % STUDIO_MARKS.length].shape}
                color={STUDIO_MARKS[k % STUDIO_MARKS.length].color}
                className={`absolute -z-10 opacity-80 ${STUDIO_MARKS[k % STUDIO_MARKS.length].inset}`}
              />
              <div className="atelier-frame absolute inset-0">
                <Image
                  src={photo.image.url}
                  alt={photo.caption[locale]}
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </figure>
          ))}
        </div>
      </section>
      </Reveal>

      {/* --- milestones ------------------------------------------------ */}
      <Reveal asChild>
      <section className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-[clamp(24px,4vw,64px)] px-[clamp(20px,5vw,72px)] pb-[clamp(60px,10vh,120px)]">
        <h2 className="relative isolate m-0 inline-block justify-self-start text-[clamp(28px,3vw,42px)] font-semibold tracking-[-0.02em]">
          <Brush
            shape="streaks"
            color="#F5D95A"
            className="absolute -z-10 rotate-[-2deg]"
            style={{
              insetInlineStart: "-6%",
              bottom: -12,
              width: "118%",
              height: "0.7em",
            }}
          />
          {t.aMilestonesH}
        </h2>

        <div>
          {/* Part of the section's series: the years follow the heading. */}
          <dl className="domino m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-[var(--space-6)] gap-y-[var(--space-3)] text-base [--domino-base:140ms] [--domino-step:45ms]">
            {profile.milestones.map((m) => (
              <React.Fragment key={m.id}>
                <dt className="text-ink-mute font-semibold">
                  {digits(m.year, locale)}
                </dt>
                <dd className="m-0 leading-[1.5]">{m.text[locale]}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      </section>
      </Reveal>

      <SiteFooter />
    </>
  );
}

/** The marks thrown behind each studio photograph, in order. */
const STUDIO_MARKS = [
  { shape: "line" as const, color: "#F7A3B8", inset: "inset-[70%_-6%_-10%_30%]" },
  { shape: "dab" as const, color: "#8FE06B", inset: "inset-[-10%_40%_72%_-6%]" },
  { shape: "vert" as const, color: "#3ED6D3", inset: "inset-[20%_-8%_20%_80%]" },
];
