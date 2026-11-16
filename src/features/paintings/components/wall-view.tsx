"use client";

import * as React from "react";

import dynamic from "next/dynamic";

import { Brush, BrushButton } from "@/components/brush";
import { STRONG } from "@/features/paintings/plates";
import type { Painting } from "@/features/paintings/types";
import {
  detectWallSupport,
  wallSize,
  type WallSupport,
} from "@/features/paintings/wall";
import { useT } from "@/hooks/use-t";

/**
 * three, React Three Fiber and the XR library are several hundred kilobytes
 * that most visitors never need. They arrive only when someone on a phone that
 * can use them opens this view.
 */
const WallSession = dynamic(
  () => import("@/features/paintings/components/wall-session"),
  { ssr: false, loading: () => <StartPlaceholder /> },
);

/** A work can go in a visitor's room once it has a photograph and a size. */
export function canHang(
  painting: Painting,
): painting is Painting & {
  image: NonNullable<Painting["image"]>;
  sizeCm: NonNullable<Painting["sizeCm"]>;
} {
  return painting.image !== null && painting.sizeCm !== null;
}

/**
 * "View in your room" — the page before the camera.
 *
 * It says what is about to happen and starts it. What it starts depends on the
 * phone: a WebXR session drawn by us on Android, Apple's AR Quick Look on an
 * iPhone or iPad, and on anything else an honest note that this needs a phone.
 */
export function WallView({
  painting,
  onClose,
}: {
  painting: Painting;
  onClose: () => void;
}) {
  const { t, locale } = useT();
  const copy = painting.copy[locale];

  const [support, setSupport] = React.useState<WallSupport | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    void detectWallSupport().then((found) => {
      if (!cancelled) setSupport(found);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // The page behind must not scroll while this is up.
  React.useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!canHang(painting)) return null;

  const size = wallSize(painting.sizeCm, painting.image);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.wallView}
      className="fixed inset-0 z-[60] overflow-y-auto backdrop-blur-[14px]"
      style={{
        background: "color-mix(in srgb, var(--background) 94%, transparent)",
      }}
    >
      <button
        type="button"
        aria-label={t.wallClose}
        onClick={onClose}
        className="text-primary-foreground absolute top-[18px] isolate z-10 size-10 flex-none cursor-pointer border-0 bg-transparent font-sans text-[22px] leading-none transition-transform duration-300 ease-atelier hover:scale-[1.08] hover:rotate-[8deg]"
        style={{ insetInlineEnd: "clamp(16px, 4vw, 48px)" }}
      >
        <Brush
          shape="small"
          color="var(--primary)"
          className="absolute -inset-1 -z-10"
        />
        ×
      </button>

      {/* The heading leads; the steps follow it a line at a time; the button
          lands last, once there is something to say yes to. */}
      <div className="domino mx-auto flex min-h-full max-w-[560px] flex-col justify-center gap-[var(--space-4)] px-[clamp(20px,5vw,72px)] py-[clamp(72px,12vh,120px)] [--domino-step:90ms]">
        <p className="text-ink-mute m-0 text-[13px] tracking-[0.14em] uppercase">
          {copy.title}
          {copy.size && <> · {copy.size}</>}
        </p>

        <h2 className="relative isolate m-0 inline-block self-start text-[clamp(34px,6vw,56px)] leading-[1.04] font-semibold tracking-[-0.02em] text-balance">
          <Brush
            shape="wide"
            color={STRONG[painting.plate]}
            className="absolute -z-10 rotate-[-1deg]"
            style={{
              insetInlineStart: "-3%",
              bottom: -8,
              width: "78%",
              height: "0.42em",
            }}
          />
          {t.wallView}
        </h2>

        <p className="text-ink-soft m-0 text-lg leading-[1.65] text-pretty">
          {t.wallIntro}
        </p>

        {support === "none" ? (
          <p className="m-0 text-base leading-[1.65] text-pretty">
            {t.wallUnsupported}
          </p>
        ) : (
          <>
            <ol className="domino m-0 flex list-none flex-col gap-[var(--space-2)] p-0 text-base leading-[1.6] [--domino-base:270ms] [--domino-order:0] [--domino-step:70ms]">
              {[t.wallStep1, t.wallStep2, t.wallStep3].map((step, k) => (
                <li key={step} className="flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="relative isolate inline-grid size-7 flex-none place-items-center text-[13px] font-semibold"
                  >
                    <Brush
                      shape="circle"
                      color={STRONG[painting.plate]}
                      className="absolute inset-0 -z-10"
                    />
                    {k + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-[var(--space-2)] flex flex-col items-start gap-[var(--space-3)] [--domino-order:6]">
              {support === "webxr" && (
                <WallSession
                  imageUrl={painting.image.url}
                  width={size.width}
                  height={size.height}
                  accent={STRONG[painting.plate]}
                  onEnd={onClose}
                />
              )}
              {support === "quicklook" && (
                <QuickLookStart
                  imageUrl={painting.image.url}
                  width={size.width}
                  height={size.height}
                />
              )}
              {support === null && <StartPlaceholder />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Holds the button's place while the phone is asked what it can do. */
function StartPlaceholder() {
  const { t } = useT();
  return (
    <BrushButton
      type="button"
      shape="dab"
      color="var(--primary)"
      tilt={-1.5}
      disabled
      className="text-primary-foreground opacity-60"
    >
      {t.wallPreparing}
    </BrushButton>
  );
}

/**
 * iPhone and iPad. The work is exported to a USDZ file here, in the browser,
 * the first time the button is pressed, and Quick Look takes it from there —
 * it finds the surface, places the work and keeps it its real size by itself.
 */
function QuickLookStart({
  imageUrl,
  width,
  height,
}: {
  imageUrl: string;
  width: number;
  height: number;
}) {
  const { t } = useT();
  const [building, setBuilding] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  // Built once and kept: Quick Look reads the file after the tap, and a second
  // tap should open at once.
  const built = React.useRef<string | null>(null);
  React.useEffect(
    () => () => {
      if (built.current) URL.revokeObjectURL(built.current);
    },
    [],
  );

  const start = async () => {
    setFailed(false);
    setBuilding(true);
    try {
      const { buildWallUsdz, openQuickLook } = await import(
        "@/features/paintings/wall-usdz"
      );
      built.current ??= URL.createObjectURL(
        await buildWallUsdz({ url: imageUrl, width, height }),
      );
      openQuickLook(built.current);
    } catch {
      setFailed(true);
    } finally {
      setBuilding(false);
    }
  };

  return (
    <>
      <BrushButton
        type="button"
        shape="dab"
        color="var(--primary)"
        tilt={-1.5}
        disabled={building}
        onClick={() => void start()}
        className="text-primary-foreground disabled:opacity-60"
      >
        {building ? t.wallPreparing : t.wallStart}
      </BrushButton>

      {failed && (
        <p role="alert" className="text-destructive m-0 text-sm leading-[1.6]">
          {t.wallFailed}
        </p>
      )}
    </>
  );
}
