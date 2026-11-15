"use client";

import * as React from "react";

import { Brush, BrushButton } from "@/components/brush";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="domino mx-auto flex min-h-screen max-w-[1440px] flex-col items-start justify-center gap-[var(--space-4)] px-[clamp(20px,5vw,72px)]">
      <h1 className="relative isolate m-0 inline-block text-[clamp(36px,4.4vw,68px)] leading-[1.02] font-semibold tracking-[-0.02em]">
        <Brush
          shape="wide"
          color="#F5D95A"
          className="absolute -z-10 rotate-[-1deg]"
          style={{
            insetInlineStart: "-3%",
            bottom: -10,
            width: "72%",
            height: "0.42em",
          }}
        />
        Something came unstuck.
      </h1>
      <p className="text-ink-soft m-0 max-w-[46ch] text-[17px] leading-[1.6]">
        The gallery could not load. If this keeps happening, the database is the
        first place to look — see the setup steps in the README.
      </p>
      <BrushButton
        shape="line2"
        color="var(--primary)"
        className="text-primary-foreground"
        onClick={reset}
      >
        Try again
      </BrushButton>
    </main>
  );
}
