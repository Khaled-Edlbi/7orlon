import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The Atelier card.
 *
 * The house rule is that nothing is boxed — hierarchy comes from type and from
 * whitespace. So this is deliberately not a card in the usual sense: no border,
 * no shadow, no fill. Reach for it for a genuinely discrete item (a listing
 * row, a spec block); reach for whitespace for everything else.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "text-card-foreground flex flex-col gap-[var(--space-3)]",
        className,
      )}
      {...props}
    />
  );
}

function CardKicker({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-kicker"
      className={cn(
        "text-ink-mute m-0 text-[13px] tracking-[0.14em] uppercase",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "m-0 text-[22px] font-semibold tracking-[-0.01em]",
        className,
      )}
      {...props}
    />
  );
}

function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-body"
      className={cn("text-ink-soft text-[17px] leading-[1.65]", className)}
      {...props}
    />
  );
}

function CardMeta({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-meta"
      className={cn("text-ink-mute m-0 text-xs leading-[1.6]", className)}
      {...props}
    />
  );
}

export { Card, CardKicker, CardTitle, CardBody, CardMeta };
