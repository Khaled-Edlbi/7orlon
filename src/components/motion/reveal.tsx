"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type RevealProps = Omit<React.ComponentProps<"div">, "ref"> & {
  /** Hand the behaviour to the child element instead of wrapping it in a div. */
  asChild?: boolean;
  /**
   * How much has to be on screen before it plays, from 0 to 1. Leave it out
   * and the section plays as soon as it is properly arriving; `0.5` waits
   * until half of it is in view.
   */
  amount?: number;
};

/** Ratios the observer reports at — fine enough to catch any `amount`. */
const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Dominoes that wait for you.
 *
 * A `<Reveal>` holds its direct children invisible until it scrolls into view,
 * then lets them arrive one after another — the same `.domino` cascade the
 * top of each page plays on load, fired by the reader reaching it instead.
 * It fires once: scrolling back up does not replay it.
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
 *   <Reveal asChild amount={0.5}>
 *     <section className="…">…</section>
 *   </Reveal>
 */
export function Reveal({ asChild, amount, className, ...props }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        let arrived: boolean;
        if (amount === undefined) {
          arrived = entry.isIntersecting;
        } else {
          // "Half of it in view" cannot happen to a section more than twice
          // the height of the screen, so filling that share of the *screen*
          // counts too.
          const screen = entry.rootBounds?.height ?? window.innerHeight;
          arrived =
            entry.intersectionRatio >= amount ||
            entry.intersectionRect.height >= screen * amount;
        }

        if (arrived) {
          setInView(true);
          observer.disconnect();
        }
      },
      amount === undefined
        ? // The bottom tenth of the screen does not count: a section should
          // be properly arriving, not just peeking over the edge.
          { rootMargin: "0px 0px -10% 0px" }
        : { threshold: STEPS },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [amount]);

  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      className={cn(inView ? "domino" : "domino-wait", className)}
      {...props}
    />
  );
}
