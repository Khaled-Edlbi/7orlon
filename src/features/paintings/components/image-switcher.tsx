"use client";

import { Brush } from "@/components/brush";
import { useT } from "@/hooks/use-t";
import { digits } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The arrows and dots that swap between a work's photographs.
 *
 * Laid over the picture: an arrow on each side at mid-height, a row of dots
 * along the bottom. It positions itself inside the nearest `relative` parent
 * and renders nothing at all for a work with a single photograph, so callers
 * never have to ask how many there are.
 *
 * The arrows wrap — past the last photograph is the first — because a handful
 * of pictures of one painting is a loop, not a line.
 */
export function ImageSwitcher({
  count,
  index,
  onChange,
  inset = "0px",
  bottom = "0px",
  className,
}: {
  count: number;
  index: number;
  onChange: (index: number) => void;
  /** How far in from each side the arrows sit. Any CSS length. */
  inset?: string;
  /** How far up from the bottom edge the dots sit. Any CSS length. */
  bottom?: string;
  className?: string;
}) {
  const { t, locale, rtl } = useT();

  if (count < 2) return null;

  const go = (delta: number) => onChange((index + delta + count) % count);

  const arrow =
    "absolute top-1/2 z-10 -mt-[22px] isolate h-11 w-11 cursor-pointer border-0 bg-transparent font-sans text-xl leading-none transition-transform duration-300 ease-atelier hover:scale-[1.08]";

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-10", className)}>
      <button
        type="button"
        aria-label={t.prevImage}
        onClick={() => go(-1)}
        className={cn(
          arrow,
          "text-foreground pointer-events-auto hover:rotate-[-6deg]",
        )}
        style={{ insetInlineStart: inset }}
      >
        <Brush
          shape="circle"
          color="var(--color-plate-blush)"
          className="absolute -inset-1 -z-10"
        />
        {rtl ? "→" : "←"}
      </button>

      <button
        type="button"
        aria-label={t.nextImage}
        onClick={() => go(1)}
        className={cn(
          arrow,
          "text-primary-foreground pointer-events-auto hover:rotate-[6deg]",
        )}
        style={{ insetInlineEnd: inset }}
      >
        <Brush
          shape="small"
          color="var(--primary)"
          className="absolute -inset-1 -z-10"
        />
        {rtl ? "←" : "→"}
      </button>

      <div
        className="pointer-events-auto absolute inset-x-0 flex justify-center gap-1.5"
        style={{ bottom }}
      >
        {Array.from({ length: count }, (_, k) => (
          <button
            key={k}
            type="button"
            aria-label={`${t.imageN} ${digits(k + 1, locale)}`}
            aria-current={k === index}
            onClick={() => onChange(k)}
            className="brush h-3 cursor-pointer border-0 p-0 transition-[width,background] duration-500 ease-atelier"
            style={{
              ["--brush" as string]: "url(/brush/wide.png)",
              width: k === index ? 26 : 12,
              background: k === index ? "var(--primary)" : "var(--rule)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
