import localFont from "next/font/local";

/**
 * DG Forsha carries the whole design — headings, body, buttons and the Arabic
 * alike. The Scribble cut is the same hand written faster; it is reserved for
 * the wordmark and for the one emphasised word in a headline.
 */
export const forsha = localFont({
  src: "../fonts/DG-Forsha-Regular.ttf",
  variable: "--font-forsha",
  weight: "400 700",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "serif"],
});

export const forshaScribble = localFont({
  src: "../fonts/DG-Forsha-Scribble.ttf",
  variable: "--font-forsha-scribble",
  weight: "400 700",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "serif"],
});
