"use client";

import * as React from "react";

import { Brush } from "@/components/brush";
import { useT } from "@/hooks/use-t";

type Drag = { sx: number; sy: number; ox: number; oy: number; moved: boolean };

const MIN_SCALE = 1;
const MAX_SCALE = 6;

/**
 * The work, alone, as large as the screen allows.
 *
 * Scroll or click to zoom, drag to pan, Escape to leave. The picture is painted
 * as a background image rather than an `<img>` so scale and translate can ride
 * one transform without the browser re-fetching anything.
 */
export function ZoomOverlay({
  src,
  title,
  onClose,
}: {
  src: string;
  title: string;
  onClose: () => void;
}) {
  const { t } = useT();
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [drag, setDrag] = React.useState<Drag | null>(null);

  const clamp = (v: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));

  const zoomBy = React.useCallback((factor: number) => {
    setScale((s) => {
      const next = clamp(s * factor);
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomBy(1.5);
      if (e.key === "-") zoomBy(1 / 1.5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, zoomBy]);

  // The page behind must not scroll while the overlay is up.
  React.useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // React attaches wheel listeners passively at the root, so preventDefault
  // there is ignored. Bind it ourselves to stop the page scrolling underneath.
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y, moved: false });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    setOffset({ x: drag.ox + dx, y: drag.oy + dy });
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 3) {
      setDrag({ ...drag, moved: true });
    }
  };

  const onPointerUp = () => setDrag(null);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (drag?.moved) return;
    if (scale > 1) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }
    // Zoom towards wherever the cursor was.
    const r = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - (r.left + r.width / 2);
    const cy = e.clientY - (r.top + r.height / 2);
    setScale(2.5);
    setOffset({ x: -cx * 1.5, y: -cy * 1.5 });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      ref={rootRef}
      onClick={onClose}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="fixed inset-0 z-[60] backdrop-blur-[14px] select-none"
      style={{
        background: "color-mix(in srgb, var(--background) 94%, transparent)",
        cursor: scale > 1 ? (drag ? "grabbing" : "grab") : "zoom-out",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-[clamp(16px,4vw,48px)]">
        <div
          role="img"
          aria-label={title}
          onClick={toggle}
          className="h-full w-full bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${src}")`,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center",
            transition: drag ? "none" : "transform .35s cubic-bezier(.22,.7,.2,1)",
            cursor: scale > 1 ? (drag ? "grabbing" : "grab") : "zoom-in",
            filter: "drop-shadow(0 30px 60px rgb(32 30 29 / 0.22))",
          }}
        />
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-[18px] flex items-center gap-[var(--space-3)]"
        style={{ insetInline: "clamp(16px, 4vw, 48px)" }}
      >
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-ink-mute text-[13px]">
          {Math.round(scale * 100)}%
        </span>
        <span className="text-ink-mute ms-auto text-xs whitespace-nowrap">
          {t.zoomHint}
        </span>

        <ZoomButton label="Zoom out" color="#F5D95A" onClick={() => zoomBy(1 / 1.5)}>
          −
        </ZoomButton>
        <ZoomButton label="Zoom in" color="#8FE06B" onClick={() => zoomBy(1.5)}>
          +
        </ZoomButton>
        <ZoomButton
          label="Close"
          color="var(--primary)"
          shape="small"
          className="text-primary-foreground text-[22px] hover:rotate-[8deg]"
          onClick={onClose}
        >
          ×
        </ZoomButton>
      </div>
    </div>
  );
}

function ZoomButton({
  label,
  color,
  shape = "circle",
  className,
  onClick,
  children,
}: {
  label: string;
  color: string;
  shape?: "circle" | "small";
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`text-foreground relative isolate h-10 w-10 flex-none cursor-pointer border-0 bg-transparent font-sans text-xl leading-none transition-transform duration-300 ease-atelier hover:scale-[1.08] ${className ?? ""}`}
    >
      <Brush shape={shape} color={color} className="absolute -inset-1 -z-10" />
      {children}
    </button>
  );
}
