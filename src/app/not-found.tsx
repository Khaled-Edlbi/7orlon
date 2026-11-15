import Link from "next/link";

import { Brush, BrushButton } from "@/components/brush";

export default function NotFound() {
  return (
    <main className="domino mx-auto flex min-h-screen max-w-[1440px] flex-col items-start justify-center gap-[var(--space-4)] px-[clamp(20px,5vw,72px)]">
      <h1 className="relative isolate m-0 inline-block text-[clamp(40px,5vw,80px)] leading-[1.02] font-semibold tracking-[-0.02em]">
        <Brush
          shape="wide"
          color="#F7A3B8"
          className="absolute -z-10 rotate-[-1deg]"
          style={{
            insetInlineStart: "-3%",
            bottom: -10,
            width: "72%",
            height: "0.42em",
          }}
        />
        Nothing hangs here.
      </h1>
      <p className="text-ink-soft m-0 max-w-[44ch] text-[17px] leading-[1.6]">
        That work is not in this collection — it may have been sold, or the
        address may have picked up a typo on the way.
      </p>
      <BrushButton
        asChild
        shape="line2"
        color="var(--primary)"
        className="text-primary-foreground"
      >
        <Link href="/">Back to the collection</Link>
      </BrushButton>
    </main>
  );
}
