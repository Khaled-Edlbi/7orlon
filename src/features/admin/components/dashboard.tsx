"use client";

import Link from "next/link";

import { Brush, BrushButton } from "@/components/brush";
import { AnimatedNumber } from "@/components/motion";
import {
  DeskHeading,
  SectionHeading,
} from "@/features/admin/components/ui";
import { PLATE, PLATE_ORDER, STRONG } from "@/features/paintings/plates";
import { useEnquiries, usePaintings } from "@/features/paintings/queries";
import { useT } from "@/hooks/use-t";
import { digits, price } from "@/lib/format";

/** The desk's front page: how the wall stands, and who has written. */
export function Dashboard() {
  const { a, locale } = useT();
  const { data: collection } = usePaintings();
  const { data: inbox } = useEnquiries();

  const paintings = collection.paintings;
  const available = paintings.filter((p) => p.inStock);
  const sold = paintings.length - available.length;
  const unphotographed = paintings.filter((p) => !p.image).length;

  // Summed as BigInt: prices are minor units on the wire and never a float.
  const value = available
    .reduce((sum, p) => sum + BigInt(p.priceMinor), BigInt(0))
    .toString();
  const currency = paintings[0]?.currency ?? "USD";

  const perPlate = PLATE_ORDER.map((plate) => ({
    plate,
    count: paintings.filter((p) => p.plate === plate).length,
  }));
  const most = Math.max(1, ...perPlate.map((p) => p.count));

  const recent = inbox.enquiries.slice(0, 4);

  return (
    <>
      <DeskHeading
        kicker={a.dashKicker}
        color={STRONG.mint}
        title={
          <>
            {a.dashTitleA}{" "}
            <em className="font-scribble font-normal not-italic">
              {a.dashTitleB}
            </em>
          </>
        }
        actions={
          <BrushButton
            asChild
            shape="dab"
            color="var(--primary)"
            className="text-primary-foreground"
          >
            <Link href="/admin/paintings/new">{a.pAdd}</Link>
          </BrushButton>
        }
      />

      {/* After the heading: the figures (240ms on, one by one), then the two
          panels (720, 880ms), each list following its own panel's heading. */}
      <div className="domino relative isolate flex flex-wrap gap-x-[clamp(24px,4vw,56px)] gap-y-[var(--space-4)] pt-1.5 [--domino-order:0] [--domino-base:240ms] [--domino-step:80ms]">
        <Brush
          shape="line3"
          color={STRONG.jade}
          className="absolute -top-2 -z-10 h-[22px] w-[min(70%,340px)] opacity-85"
          style={{ insetInlineStart: -16 }}
        />
        <Figure value={paintings.length} label={a.dashWorks} />
        <Figure value={available.length} label={a.dashAvailable} />
        <Figure value={sold} label={a.dashSold} />
        <Figure value={inbox.enquiries.length} label={a.dashEnquiries} />
        <div>
          <div className="text-[30px] leading-[1.6] font-semibold">
            {price(value, currency, locale)}
          </div>
          <div className="text-ink-mute mt-1 text-[13px]">{a.dashValue}</div>
        </div>
      </div>

      <div className="domino mt-[clamp(40px,7vh,80px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(32px,5vw,72px)] [--domino-order:0] [--domino-base:720ms] [--domino-step:160ms]">
        <section className="flex flex-col gap-[var(--space-4)]">
          <SectionHeading color={STRONG.butter} shape="streaks">
            {a.dashPlates}
          </SectionHeading>

          {/* A bar chart, in the only material this design has: paint. */}
          <ul className="domino m-0 flex list-none flex-col gap-[var(--space-2)] p-0 [--domino-base:810ms] [--domino-step:55ms]">
            {perPlate.map(({ plate, count }) => (
              <li
                key={plate}
                className="grid grid-cols-[auto_minmax(0,1fr)_2ch] items-center gap-[var(--space-3)]"
              >
                <Brush shape="vert" color={PLATE[plate]} className="h-9 w-4" />
                <span className="block h-6">
                  <Brush
                    shape="line3"
                    color={STRONG[plate]}
                    className="h-full transition-[width] duration-700 ease-atelier"
                    style={{ width: `${count === 0 ? 0 : Math.max(8, (count / most) * 100)}%` }}
                  />
                </span>
                <span className="text-end text-base font-semibold">
                  <span className="sr-only">{plate}: </span>
                  {digits(count, locale)}
                </span>
              </li>
            ))}
          </ul>

          {unphotographed > 0 && (
            <p className="text-ink-mute m-0 text-[13px]">
              {a.dashMissingPhotos}: {digits(unphotographed, locale)}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-wrap items-baseline gap-[var(--space-3)]">
            <SectionHeading color={STRONG.blush}>{a.dashRecent}</SectionHeading>
            {inbox.enquiries.length > 0 && (
              <Link
                href="/admin/enquiries"
                className="text-ink-mute ms-auto text-[13px]"
              >
                {a.dashSeeAll}
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="text-ink-mute m-0 text-base">{a.dashNoEnquiries}</p>
          ) : (
            <ul className="domino m-0 flex list-none flex-col gap-[var(--space-3)] p-0 [--domino-base:970ms] [--domino-step:55ms]">
              {recent.map((enquiry) => (
                <li key={enquiry.id} className="flex flex-col gap-0.5">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-lg font-semibold">{enquiry.name}</span>
                    <span className="text-ink-mute text-xs" dir="ltr">
                      {digits(enquiry.createdAt.slice(0, 10), locale)}
                    </span>
                  </span>
                  <span className="text-ink-mute truncate text-[13px]">
                    {enquiry.painting?.title[locale] ?? a.eGoneWork}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Figure({ value, label }: { value: number; label: string }) {
  const { locale } = useT();

  return (
    <div>
      <div className="text-[30px] leading-[1.6] font-semibold">
        <AnimatedNumber
          value={value}
          // The figures land about half a second in, after the heading.
          delay={0.5}
          format={(n) => digits(Math.round(n), locale)}
        />
      </div>
      <div className="text-ink-mute mt-1 text-[13px]">{label}</div>
    </div>
  );
}
