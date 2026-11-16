import type { PaintingImage, SizeCm } from "@/features/paintings/types";

/**
 * "View in your room": the work, at its real size, through a phone's camera —
 * on a wall, the floor, a table, wherever the visitor points.
 *
 * Two different machines do this. Chrome on Android has WebXR, so the scene is
 * ours (`components/wall-session.tsx`, React Three Fiber). Safari on iPhone and
 * iPad has no WebXR; there the work is exported as a USDZ file and handed to
 * Apple's AR Quick Look (`wall-usdz.ts`). Nothing in this file imports three —
 * it is what the painting page loads to decide which of the two to fetch.
 */
export type WallSupport = "webxr" | "quicklook" | "none";

/**
 * Development only: `?wall-emulator` on a work's address runs the Android
 * scene on a desktop, inside the emulator @react-three/xr ships (a synthetic
 * room with walls to hit-test against). Never true in a production build.
 */
export function wallEmulated(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("wall-emulator")
  );
}

export async function detectWallSupport(): Promise<WallSupport> {
  if (wallEmulated()) return "webxr";

  // Safari says so itself: an <a rel="ar"> opens Quick Look.
  if (document.createElement("a").relList.supports("ar")) return "quicklook";

  try {
    if (await navigator.xr?.isSessionSupported("immersive-ar")) return "webxr";
  } catch {
    // Blocked by a permissions policy, or not a secure context: no AR here.
  }
  return "none";
}

/**
 * How thick the work is drawn, in metres. Width and height are measured per
 * work; depth is not yet, so every work gets a stretched canvas's two
 * centimetres.
 */
export const WALL_DEPTH = 0.02;

/**
 * The size the picture is drawn in the room, in metres.
 *
 * The studio's measurement is the truth for scale; the photograph is the truth
 * for proportion. When the two agree this is simply the measurement. When they
 * do not (a photograph cropped loose, or shot with its frame) the picture is
 * fitted inside the measured rectangle rather than stretched to fill it — so
 * it is never shown larger than the work is.
 */
export function wallSize(
  sizeCm: SizeCm,
  image: Pick<PaintingImage, "width" | "height">,
): { width: number; height: number } {
  const measured = sizeCm.width / sizeCm.height;
  const pictured = image.width / image.height;

  const widthCm =
    pictured > measured ? sizeCm.width : sizeCm.height * pictured;
  const heightCm =
    pictured > measured ? sizeCm.width / pictured : sizeCm.height;

  return { width: widthCm / 100, height: heightCm / 100 };
}
