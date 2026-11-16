"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type RevealProps = Omit<React.ComponentProps<"div">, "ref"> & {
  /** Hand the behaviour to the child element instead of wrapping it in a div. */
  asChild?: boolean;
  /**
   * How much has to be on screen before it plays, from 0 to 1. Half, unless
   * told otherwise — the rule for every section on the site.
   */
  amount?: number;
};

/** The site's rule: a section plays once half of it is in view. */
const HALF = 0.5;

/** Ratios the observer reports at — fine enough to catch any `amount`. */
const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Dominoes that wait for you.
 *
 * A `<Reveal>` holds its direct children invisible until half of it is on
 * screen, then lets them arrive one after another — the same `.domino` cascade
 * the top of each page plays on load, fired by the reader reaching it instead.
 * It fires once: scrolling back up does not replay it.
 *
 * Put it on the section, not on the pieces inside it: one trigger, one
 * series. A Reveal *inside* another is for a part that may be a screen away
 * from the rest (a form at the foot of a column) — it waits for its own half.
 *
 * Any `.domino` container *inside* a waiting Reveal waits with it and starts
 * at the same moment (see `.domino-wait .domino` in globals.css), so a section
 * with a lot in it can be a series: give the inner containers a
 * `--domino-base` and their pieces fall after the outer ones.
 *
 * Use it for anything below the fold. Content that is on screen when the page
 * opens should wear `.domino` directly, which needs no script and so is
 * visible before hydration.
 *
 *   <Reveal asChild>
 *     <section className="…">…</section>
 *   </Reveal>
 */
export function Reveal({
  asChild,
  amount = HALF,
  className,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  // "opening": already on screen when the page opened, so it is part of the
  // page's opening series and waits for the header (`.domino-opening` in
  // globals.css). "following": the same, with the page at its top — so the
  // page's first section is playing above it, and it waits for that too.
  // "arrived": the reader scrolled to it, and it plays at once.
  const [state, setState] = React.useState<
    "waiting" | "opening" | "following" | "arrived"
  >("waiting");

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // The observer always reports once straight after `observe()`. Arriving
    // on that first report means the section never had to be scrolled to.
    let first = true;

    // "Half of it in view" cannot happen to a section more than twice the
    // height of the screen, so filling that share of the *screen* counts too.
    // The observer only reports at the ratios it is given, and on a very long
    // section that moment falls between two of the standard steps — so it
    // gets a step of its own.
    const height = element.getBoundingClientRect().height;
    const screenShare =
      height > 0 ? Math.min(1, (window.innerHeight * amount) / height) : amount;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const opening = first;
        first = false;

        const screen = entry.rootBounds?.height ?? window.innerHeight;
        const arrived =
          entry.isIntersecting &&
          (entry.intersectionRatio >= amount ||
            // A pixel of slack: the report can land a fraction short.
            entry.intersectionRect.height >= screen * amount - 1);

        if (arrived) {
          setState(
            !opening ? "arrived" : window.scrollY < 24 ? "following" : "opening",
          );
          observer.disconnect();
        }
      },
      { threshold: [...STEPS, screenShare] },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [amount]);

  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      className={cn(
        state === "waiting" ? "domino-wait" : "domino",
        state === "opening" && "domino-opening",
        state === "following" && "domino-following",
        // Scrolled to: no waiting for a header, even inside a container that
        // is itself still marked as opening (the desk's first page).
        state === "arrived" && "[--domino-lead:0ms]",
        className,
      )}
      {...props}
    />
  );
}
