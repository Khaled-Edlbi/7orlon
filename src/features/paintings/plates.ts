/**
 * The five plates the studio prints on.
 *
 * Order matters: the index pagination and the deterministic brush "hits" behind
 * a painting both walk this list, so re-ordering it re-paints the page.
 */
export const PLATE_ORDER = ["mint", "blush", "butter", "leaf", "jade"] as const;

export type PlateName = (typeof PLATE_ORDER)[number];

/** Pale wash — the plate painted behind a work. */
export const PLATE: Record<PlateName, string> = {
  mint: "#90F1EF",
  blush: "#FFD6E0",
  butter: "#FFEF9F",
  leaf: "#C1FBA4",
  jade: "#7BF1A8",
};

/** Saturated partner — underlines, markers, hits and the strip marker. */
export const STRONG: Record<PlateName, string> = {
  mint: "#3ED6D3",
  blush: "#F7A3B8",
  butter: "#F5D95A",
  leaf: "#8FE06B",
  jade: "#3FD48A",
};

export const STRONG_LIST = PLATE_ORDER.map((p) => STRONG[p]);
