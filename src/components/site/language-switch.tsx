"use client";

import { Brush } from "@/components/brush";
import { useT } from "@/hooks/use-t";
import { useLocale } from "@/stores/gallery-store";

/** EN / عربي, each sitting on its own stroke. The lit one is jade. */
export function LanguageSwitch() {
  const { setLocale } = useLocale();
  const { rtl } = useT();

  return (
    <div role="group" aria-label="Language" className="flex flex-none gap-1.5">
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={!rtl}
        className="text-foreground relative isolate cursor-pointer border-0 bg-transparent px-2.5 py-[7px] font-sans text-[13px] sm:px-4"
      >
        <Brush
          shape="wide"
          color={rtl ? "transparent" : "var(--color-plate-jade)"}
          className="absolute inset-0 -z-10 transition-colors duration-500"
        />
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("ar")}
        aria-pressed={rtl}
        className="text-foreground relative isolate cursor-pointer border-0 bg-transparent px-2.5 py-1.5 font-sans text-sm sm:px-4"
      >
        <Brush
          shape="dab"
          color={rtl ? "var(--color-plate-jade)" : "transparent"}
          className="absolute inset-0 -z-10 transition-colors duration-500"
        />
        عربي
      </button>
    </div>
  );
}
