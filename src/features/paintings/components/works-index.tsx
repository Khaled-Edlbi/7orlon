"use client";

import * as React from "react";

import { Brush } from "@/components/brush";
import { Reveal } from "@/components/motion";
import { PLATE, STRONG_LIST } from "@/features/paintings/plates";
import { usePaintings } from "@/features/paintings/queries";
import { useT } from "@/hooks/use-t";
import { counter, digits, price } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useIndexPage, useShowcase } from "@/stores/gallery-store";

/**
 * How many works fit on one page of the index. The collection is currently
 * twelve, so the pager stays out of the way; grow the catalogue and it appears.
 */
const PER_PAGE = 12;

export function WorksIndex({ onSelect }: { onSelect: () => void }) {
  const { t, locale } = useT();
  const { data } = usePaintings();
  const { setCurrent } = useShowcase();
  const { indexPage, setIndexPage } = useIndexPage();

  const paintings = data.paintings;
  const pageCount = Math.max(1, Math.ceil(paintings.length / PER_PAGE));
  const page = Math.min(indexPage, pageCount - 1);
  const from = page * PER_PAGE;
  const to = Math.min(paintings.length, from + PER_PAGE);
  const items = paintings.slice(from, to);

  const goToPage = (n: number) => {
    setIndexPage(n);
    document.getElementById("index")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    // One section, one series: the heading, then the rows (160ms on, 45ms
    // apart), then the pager once the last row has started.
    <Reveal asChild>
    <section
      id="index"
      className="relative mx-auto max-w-[1440px] px-[clamp(20px,5vw,72px)] pt-[clamp(40px,6vh,80px)] pb-[clamp(48px,8vh,96px)]"
    >
      <div className="mb-[var(--space-6)] flex flex-wrap items-baseline gap-[var(--space-3)]">
        <h2 className="relative isolate m-0 text-[clamp(30px,3.4vw,48px)] font-semibold tracking-[-0.02em]">
          <Brush
            shape="streaks"
            color="#F5D95A"
            className="absolute -z-10 rotate-[-2deg]"
            style={{
              insetInlineStart: "-6%",
              bottom: -14,
              width: "118%",
              height: "0.7em",
            }}
          />
          {t.indexTitle}
        </h2>
        <span className="text-ink-mute text-sm">
          {counter(paintings.length, locale)} {t.works}
        </span>
      </div>

      <div className="domino grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-x-[clamp(24px,4vw,64px)] gap-y-0.5 [--domino-order:0] [--domino-base:160ms] [--domino-step:45ms]">
        {items.map((p, k) => (
          <div key={p.id}>
            <button
              type="button"
              onClick={() => {
                setCurrent(from + k);
                onSelect();
              }}
              className="text-foreground grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 border-0 bg-transparent px-3 py-3.5 text-start font-sans transition-transform duration-300 ease-atelier hover:translate-x-1 rtl:hover:-translate-x-1"
            >
              <Brush
                shape="vert"
                color={PLATE[p.plate]}
                className="h-10 w-4"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="-my-1 truncate py-1 text-lg leading-[1.5] font-semibold">
                  {p.copy[locale].title}
                </span>
                <span className="text-ink-mute -my-1 truncate py-1 text-xs leading-[1.6]">
                  {p.copy[locale].meta}
                </span>
              </span>
              <span className="flex flex-col items-end gap-[3px]">
                <span className="text-base font-semibold">
                  {price(p.priceMinor, p.currency, locale)}
                </span>
                <span className="text-ink-faint inline-flex items-center gap-[5px] text-[11px]">
                  <i
                    className="block size-1.5 rounded-full"
                    style={{ background: p.inStock ? "#3f8f6a" : "#d82071" }}
                  />
                  {p.inStock ? t.inStock : t.soldOut}
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <Pager
          page={page}
          pageCount={pageCount}
          from={from}
          to={to}
          total={paintings.length}
          onGo={goToPage}
        />
      )}

    </section>
    </Reveal>
  );
}

function Pager({
  page,
  pageCount,
  from,
  to,
  total,
  onGo,
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  onGo: (n: number) => void;
}) {
  const { t, locale, rtl } = useT();

  return (
    <nav
      aria-label="Pages"
      className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-3)] [--domino-order:10]"
    >
      <button
        type="button"
        aria-label={t.previous}
        disabled={page === 0}
        onClick={() => onGo(Math.max(0, page - 1))}
        className="text-foreground relative isolate h-10 w-10 flex-none cursor-pointer border-0 bg-transparent font-sans text-lg leading-none transition-transform duration-300 ease-atelier hover:rotate-[-6deg] hover:scale-[1.08]"
      >
        <Brush shape="circle" color="#FFD6E0" className="absolute -inset-1 -z-10" />
        {rtl ? "→" : "←"}
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: pageCount }, (_, n) => {
          const on = n === page;
          return (
            <button
              key={n}
              type="button"
              aria-label={`Page ${n + 1}`}
              aria-current={on ? "page" : undefined}
              onClick={() => onGo(n)}
              className={cn(
                "text-foreground relative size-9 cursor-pointer border-0 p-0 font-sans text-[15px] transition-[background,transform] duration-300",
                on ? "brush font-semibold" : "bg-transparent",
              )}
              style={
                on
                  ? {
                      ["--brush" as string]: "url(/brush/dab.png)",
                      background: STRONG_LIST[n % STRONG_LIST.length],
                    }
                  : undefined
              }
            >
              {digits(n + 1, locale)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label={t.next}
        disabled={page === pageCount - 1}
        onClick={() => onGo(Math.min(pageCount - 1, page + 1))}
        className="text-primary-foreground relative isolate h-10 w-10 flex-none cursor-pointer border-0 bg-transparent font-sans text-lg leading-none transition-transform duration-300 ease-atelier hover:rotate-[6deg] hover:scale-[1.08]"
      >
        <Brush shape="small" color="var(--primary)" className="absolute -inset-1 -z-10" />
        {rtl ? "←" : "→"}
      </button>

      <span className="text-ink-mute ms-auto text-[13px]">
        {counter(from + 1, locale)}–{counter(to, locale)} {t.of}{" "}
        {counter(total, locale)}
      </span>
    </nav>
  );
}
