"use client";

import * as React from "react";

export type Size = { w: number; h: number };

/**
 * The measured box of an element, kept current through resizes. The showcase
 * needs it to work out where a contain-fitted painting actually lands, so the
 * plate and the brush hits can be placed against the picture rather than
 * against the container.
 *
 * The ref it returns is a *callback* ref, held in state, and the observer is
 * keyed on the node it was last given. That matters: if React ever builds the
 * element again while this hook's component stays mounted — a wrapper around
 * it remounting, a hot reload — the hook is told about the new node and moves
 * its observer across. Measuring once at mount and watching that first node
 * forever leaves the size frozen at whatever the window was back then, and
 * everything placed from it drifts off the picture at the next resize.
 */
export function useElementSize<T extends HTMLElement>() {
  const [node, setNode] = React.useState<T | null>(null);
  const [size, setSize] = React.useState<Size | null>(null);

  React.useEffect(() => {
    if (!node) return;

    const measure = () => {
      const { clientWidth: w, clientHeight: h } = node;
      setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
    };

    // The observer reports once as soon as it starts watching, so there is no
    // separate first measurement to make.
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, size] as const;
}
