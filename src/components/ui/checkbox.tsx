"use client";

import * as React from "react";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A checkbox that reads as a dab of paint rather than a UI control: the box is
 * a brush stroke in the frame colour, and checking it fills the stroke with a
 * plate.
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "relative isolate grid size-6 shrink-0 cursor-pointer place-items-center border-0 bg-transparent",
        "transition-transform duration-300 ease-atelier hover:rotate-[-4deg]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="brush pointer-events-none absolute inset-0 -z-10 transition-colors duration-300"
        style={{
          ["--brush" as string]: "url(/brush/small.png)",
          background: "var(--frame)",
        }}
      />
      <span
        aria-hidden="true"
        className="brush pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 data-[on=true]:opacity-100"
        data-on={props.checked === true || undefined}
        style={{
          ["--brush" as string]: "url(/brush/small.png)",
          background: "var(--color-plate-jade)",
        }}
      />
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="text-foreground grid place-items-center"
      >
        <Check className="size-3.5" strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
