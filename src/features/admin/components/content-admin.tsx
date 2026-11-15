"use client";

import * as React from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import { BrushTag } from "@/components/brush";
import { Reveal } from "@/components/motion";
import {
  BilingualField,
  DeskHeading,
  SaveBar,
  SectionHeading,
  TextButton,
} from "@/features/admin/components/ui";
import {
  siteContentOptions,
  useSaveSiteContent,
} from "@/features/content/queries";
import { CONTENT_SECTIONS } from "@/features/content/sections";
import type { SiteContent } from "@/features/content/types";
import { STRONG, STRONG_LIST } from "@/features/paintings/plates";
import { useT } from "@/hooks/use-t";
import { T, type DictionaryKey } from "@/lib/i18n";

type Lines = Record<"en" | "ar", Record<string, string>>;

/** The full text of every line: the defaults with the rewrites laid over. */
function linesOf(content: SiteContent): Lines {
  return {
    en: { ...T.en, ...content.en },
    ar: { ...T.ar, ...content.ar },
  };
}

/**
 * Every line of interface text on the site, in both languages.
 *
 * The form holds the whole text of every line; the server keeps only the ones
 * that differ from `i18n.ts`, so emptying a field puts its default back.
 */
export function ContentAdmin() {
  const { a, locale } = useT();
  // Suspense here, unlike `useT`: the form's first render must already have
  // the rewrites, or it would start from the defaults and save those back.
  const { data: content } = useSuspenseQuery(siteContentOptions());
  const save = useSaveSiteContent();

  const [lines, setLines] = React.useState(() => linesOf(content));
  const [saved, setSaved] = React.useState(false);

  const setLine = (key: DictionaryKey, value: { en: string; ar: string }) => {
    setSaved(false);
    setLines((current) => ({
      en: { ...current.en, [key]: value.en },
      ar: { ...current.ar, [key]: value.ar },
    }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save.mutate(lines, {
      onSuccess: (next) => {
        // Blanked lines come back as their defaults.
        setLines(linesOf(next));
        setSaved(true);
      },
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="domino">
      <DeskHeading
        kicker={a.cKicker}
        title={a.cTitle}
        sub={a.cSub}
        color={STRONG.jade}
        shape="line3"
      />

      <nav className="mb-[var(--space-8)] flex flex-wrap gap-x-[var(--space-4)] gap-y-[var(--space-2)] text-[15px]">
        {CONTENT_SECTIONS.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.title[locale]}
          </a>
        ))}
      </nav>

      <div className="domino flex flex-col gap-[clamp(48px,8vh,88px)] [--domino-base:160ms]">
        {CONTENT_SECTIONS.map((section, index) => (
          // Eight long sections: each plays its fields in series when it is
          // scrolled to, rather than all of them at once on load.
          <Reveal key={section.id} asChild>
          <section
            id={section.id}
            className="flex scroll-mt-8 flex-col gap-[var(--space-6)] [--domino-step:50ms]"
          >
            <SectionHeading color={STRONG_LIST[index % STRONG_LIST.length]}>
              {section.title[locale]}
            </SectionHeading>

            {section.fields.map((field) => {
              const value = {
                en: lines.en[field.key] ?? "",
                ar: lines.ar[field.key] ?? "",
              };
              const defaults = { en: T.en[field.key], ar: T.ar[field.key] };
              // A blank line is not a rewrite: it saves as the default.
              const changed = (["en", "ar"] as const).some(
                (l) => value[l].trim() !== "" && value[l] !== defaults[l],
              );

              return (
                <div key={field.key} className="flex flex-col gap-[var(--space-2)]">
                  <BilingualField
                    id={`copy-${field.key}`}
                    label={field.label[locale]}
                    value={value}
                    placeholder={defaults}
                    long={field.long}
                    onChange={(next) => setLine(field.key, next)}
                  />
                  {changed && (
                    <span className="flex items-center gap-[var(--space-3)]">
                      <BrushTag
                        color="var(--color-plate-butter)"
                        className="px-4 py-1 text-[11px]"
                      >
                        {a.cChanged}
                      </BrushTag>
                      <TextButton onClick={() => setLine(field.key, defaults)}>
                        {a.reset}
                      </TextButton>
                    </span>
                  )}
                </div>
              );
            })}
          </section>
          </Reveal>
        ))}
      </div>

      {/* The page is long; the way to save it stays within reach. */}
      <div className="atelier-veil sticky bottom-0 z-10 -mx-[var(--space-4)] mt-[var(--space-8)] px-[var(--space-4)] py-[var(--space-3)]">
        <SaveBar
          pending={save.isPending}
          saved={saved}
          error={save.isError ? a.errorGeneric : null}
        />
      </div>
    </form>
  );
}
