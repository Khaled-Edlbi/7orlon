import * as React from "react";

import { Slot, Slottable } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

/**
 * Every stroke in `public/brush/`. These are photographs of real marks; the
 * design uses them as masks, never as images, so a stroke can be any colour and
 * any size without ever looking like a stretched picture.
 */
export const BRUSH_SHAPES = [
  "blob",
  "block",
  "block2",
  "circle",
  "dab",
  "dark",
  "line",
  "line2",
  "line3",
  "line4",
  "small",
  "splotch",
  "streaks",
  "tall",
  "vert",
  "vert2",
  "wide",
] as const;

export type BrushShape = (typeof BRUSH_SHAPES)[number];

export function brushVar(shape: BrushShape): React.CSSProperties {
  return { ["--brush" as string]: `url(/brush/${shape}.png)` };
}

type BrushProps = React.ComponentProps<"span"> & {
  shape: BrushShape;
  /** Any CSS colour. Plates and their strong partners live in `plates.ts`. */
  color: string;
};

/**
 * A painted shape. Decorative by definition — it is always `aria-hidden`, and
 * it never receives pointer events.
 */
export function Brush({
  shape,
  color,
  className,
  style,
  ...props
}: BrushProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("brush pointer-events-none block", className)}
      style={{ ...brushVar(shape), background: color, ...style }}
      {...props}
    />
  );
}

type BrushButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
  shape?: BrushShape;
  /** The stroke behind the label. */
  color?: string;
  /** Degrees the button tilts on hover. The prototype never tilts it straight. */
  tilt?: number;
  size?: "sm" | "md" | "lg";
};

const SIZE: Record<NonNullable<BrushButtonProps["size"]>, string> = {
  sm: "px-[18px] py-[10px] text-sm",
  md: "px-[34px] py-4 text-[15px]",
  lg: "px-10 py-[18px] text-[15px]",
};

/**
 * The house button: a label sitting on a brush stroke, with no border, no fill
 * of its own, and a small drunken tilt on hover.
 */
export function BrushButton({
  asChild,
  shape = "dab",
  color = "var(--primary)",
  tilt = -1.5,
  size = "md",
  className,
  style,
  children,
  ...props
}: BrushButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "relative isolate inline-flex cursor-pointer items-center justify-center gap-2 border-0 bg-transparent font-sans whitespace-nowrap",
        "transition-transform duration-300 ease-atelier",
        "hover:[transform:rotate(var(--tilt))_scale(1.03)]",
        "disabled:hover:[transform:none]",
        SIZE[size],
        className,
      )}
      style={{ ["--tilt" as string]: `${tilt}deg`, ...style }}
      {...props}
    >
      {/* Slottable keeps the stroke inside the rendered child when `asChild`
          hands this off to a <Link>; without it Slot would see two children. */}
      <Brush
        shape={shape}
        color={color}
        className="absolute inset-0 -z-10 transition-colors duration-500"
      />
      <Slottable>{children}</Slottable>
    </Comp>
  );
}

type BrushTagProps = React.ComponentProps<"span"> & {
  shape?: BrushShape;
  color?: string;
};

/** A small painted label — stock status, the hero badge. */
export function BrushTag({
  shape = "line3",
  color = "var(--color-plate-leaf)",
  className,
  children,
  ...props
}: BrushTagProps) {
  return (
    <span
      className={cn(
        "relative isolate inline-flex items-center gap-[7px] px-5 py-2 text-[13px]",
        className,
      )}
      {...props}
    >
      <Brush
        shape={shape}
        color={color}
        className="absolute inset-0 -z-10 transition-colors duration-500"
      />
      {children}
    </span>
  );
}

type BrushUnderlineProps = {
  shape?: BrushShape;
  color: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * The stroke swiped under (and slightly behind) a heading. Sits at z-index -1
 * inside an `isolate` parent, so the type stays crisp on top of the paint.
 */
export function BrushUnderline({
  shape = "wide",
  color,
  className,
  style,
}: BrushUnderlineProps) {
  return (
    <Brush
      shape={shape}
      color={color}
      className={cn("absolute -z-10", className)}
      style={style}
    />
  );
}

/** The five-stripe mark in the header and the footer. */
export function BrushSwatches({
  className,
  size = "tall",
}: {
  className?: string;
  size?: "tall" | "flat";
}) {
  const colors = ["#90F1EF", "#FFD6E0", "#FFEF9F", "#C1FBA4", "#7BF1A8"];
  return (
    <span
      aria-hidden="true"
      className={cn("flex", size === "tall" ? "gap-[3px]" : "gap-1", className)}
    >
      {colors.map((c) => (
        <i
          key={c}
          className={cn(
            "block rounded-full",
            size === "tall" ? "h-[22px] w-2" : "h-1.5 w-3.5",
          )}
          style={{ background: c, borderRadius: size === "tall" ? 4 : 3 }}
        />
      ))}
    </span>
  );
}
