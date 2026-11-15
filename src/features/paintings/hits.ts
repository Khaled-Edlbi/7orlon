import type { BrushShape } from "@/components/brush";
import { STRONG, STRONG_LIST, type PlateName } from "@/features/paintings/plates";

export type Rect = { x: number; y: number; w: number; h: number };

export type Hit = {
  /**
   * Which of the four strokes this is (0–3), and nothing else.
   *
   * It is the React key on purpose. The cast is always the same four marks;
   * changing painting moves them, it does not replace them. Key them by the
   * work instead and React unmounts all four and mounts four new ones at their
   * final geometry — with no previous value, the CSS transition has nothing to
   * animate from and the strokes jump.
   */
  slot: number;
  shape: BrushShape;
  color: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
  opacity: number;
};

const HORIZONTAL: BrushShape[] = [
  "wide",
  "dab",
  "line2",
  "line4",
  "streaks",
  "line",
];
const VERTICAL: BrushShape[] = ["vert", "vert2", "tall", "block"];
const CORNER: BrushShape[] = ["circle", "small", "blob", "splotch"];

/**
 * Where a painting is hung, four strokes are thrown around it.
 *
 * They must land in the same place on every render and on both sides of
 * hydration, so nothing here is random: the sequence is seeded from the work's
 * position in the collection (mulberry32), and which edges get hit is decided
 * by the picture's own proportions — landscapes take strokes above and below,
 * portraits down the sides, squares at the corners.
 */
export function hitsFor(
  index: number,
  rect: Rect,
  plate: PlateName,
): Hit[] {
  let seed = ((index + 1) * 2654435761) >>> 0;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = <T,>(list: T[]) => list[Math.floor(rnd() * list.length)];

  // Never repeat the work's own plate colour beside it.
  const own = STRONG[plate];
  const colors = STRONG_LIST.filter((c) => c !== own).sort(() => rnd() - 0.5);

  const ratio = rect.w / rect.h;
  const sides =
    ratio > 1.15
      ? (["top", "bottom", "top", "bottom"] as const)
      : ratio < 0.87
        ? (["left", "right", "left", "right"] as const)
        : (["tl", "br", "tr", "bl"] as const);

  return sides.map((side, j) => {
    const t = 0.12 + rnd() * 0.76;
    const color = colors[j % colors.length];
    const rotate = (rnd() - 0.5) * 24;
    const opacity = 0.7 + rnd() * 0.25;

    let shape: BrushShape;
    let w: number;
    let h: number;
    let x: number;
    let y: number;

    if (side === "top" || side === "bottom") {
      shape = pick(HORIZONTAL);
      w = rect.w * (0.22 + rnd() * 0.18);
      h = w * (0.32 + rnd() * 0.2);
      x = rect.x + rect.w * t - w / 2;
      y = side === "top" ? rect.y - h * 0.62 : rect.y + rect.h - h * 0.38;
    } else if (side === "left" || side === "right") {
      shape = pick(VERTICAL);
      h = rect.h * (0.22 + rnd() * 0.18);
      w = h * (0.42 + rnd() * 0.2);
      y = rect.y + rect.h * t - h / 2;
      x = side === "left" ? rect.x - w * 0.62 : rect.x + rect.w - w * 0.38;
    } else {
      shape = pick(CORNER);
      w = Math.min(rect.w, rect.h) * (0.24 + rnd() * 0.14);
      h = w * (0.85 + rnd() * 0.3);
      x = side.includes("l") ? rect.x - w * 0.5 : rect.x + rect.w - w * 0.5;
      y = side.includes("t") ? rect.y - h * 0.5 : rect.y + rect.h - h * 0.5;
    }

    return {
      slot: j,
      shape,
      color,
      left: x,
      top: y,
      width: w,
      height: h,
      rotate,
      opacity,
    };
  });
}

/** Pulls "90 × 120" out of a caption like "Oil on linen · 90 × 120 cm · 2025". */
export function ratioFromMeta(meta: string): number | null {
  const m = /(\d+)\s*×\s*(\d+)/.exec(meta);
  if (!m) return null;
  const [, w, h] = m;
  return Number(w) / Number(h);
}

/** Where a contain-fitted picture actually sits inside the padded stage. */
export function fitRect(
  stage: { w: number; h: number },
  ratio: number,
): Rect {
  const pad = Math.min(32, Math.max(16, stage.w * 0.04));
  const innerW = stage.w - pad * 2;
  const innerH = stage.h - pad * 2;

  const w = ratio > innerW / innerH ? innerW : innerH * ratio;
  const h = ratio > innerW / innerH ? innerW / ratio : innerH;

  return { x: pad + (innerW - w) / 2, y: pad + (innerH - h) / 2, w, h };
}
