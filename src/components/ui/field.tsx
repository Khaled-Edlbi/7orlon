import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Form fields, in the same key as everything else: no boxes, just a line of
 * ink under the value and a plate-coloured focus.
 */
function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-[6px]", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-ink-mute text-[13px] tracking-[0.14em] uppercase",
        className,
      )}
      {...props}
    />
  );
}

const inputStyles =
  "w-full border-0 border-b border-input bg-transparent px-0 py-2 font-sans text-[16px] text-foreground outline-none transition-colors duration-300 placeholder:text-ink-mute/70 focus:border-accent";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input data-slot="input" className={cn(inputStyles, className)} {...props} />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(inputStyles, "resize-y leading-[1.6]", className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      className={cn("text-destructive m-0 text-[13px]", className)}
      {...props}
    />
  );
}

export { Field, FieldLabel, Input, Textarea, FieldError };
