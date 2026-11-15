"use client";

import * as React from "react";

import Image from "next/image";

import { Brush } from "@/components/brush";
import {
  BilingualField,
  DeskHeading,
  MoveButtons,
  SaveBar,
  TextButton,
  UploadButton,
} from "@/features/admin/components/ui";
import { STRONG, STRONG_LIST } from "@/features/paintings/plates";
import {
  useHeroSlides,
  useSaveHeroSlides,
} from "@/features/paintings/queries";
import type { HeroSlide, PaintingImage } from "@/features/paintings/types";
import { useT } from "@/hooks/use-t";

type SlideDraft = {
  /** Stable while editing; a slide the server has not seen has no `id` yet. */
  key: string;
  id?: string;
  image: PaintingImage;
  alt: { en: string; ar: string };
};

function draftOf(slides: HeroSlide[]): SlideDraft[] {
  return slides.map((slide) => ({
    key: slide.id,
    id: slide.id,
    image: slide.image,
    alt: { en: slide.alt.en, ar: slide.alt.ar },
  }));
}

/** The pictures that rotate behind the landing headline, in order. */
export function HeroAdmin() {
  const { a } = useT();
  const { data } = useHeroSlides();
  const save = useSaveHeroSlides();

  const [slides, setSlides] = React.useState(() => draftOf(data.slides));
  const [saved, setSaved] = React.useState(false);

  const change = (next: SlideDraft[]) => {
    setSaved(false);
    setSlides(next);
  };

  const move = (index: number, delta: -1 | 1) => {
    const next = [...slides];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    change(next);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save.mutate(
      { slides: slides.map(({ id, image, alt }) => ({ id, image, alt })) },
      {
        onSuccess: (list) => {
          // New slides now have ids; take the server's word for the list.
          setSlides(draftOf(list.slides));
          setSaved(true);
        },
      },
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="domino">
      <DeskHeading
        kicker={a.hKicker}
        title={a.hTitle}
        sub={a.hSub}
        color={STRONG.butter}
        shape="line4"
        actions={
          <UploadButton
            color="var(--color-plate-butter)"
            onUploaded={(image) =>
              change([
                ...slides,
                { key: image.url, image, alt: { en: "", ar: "" } },
              ])
            }
          >
            {a.hAdd}
          </UploadButton>
        }
      />

      {slides.length === 0 ? (
        <p className="text-ink-mute m-0 mb-[var(--space-8)] text-lg">{a.hEmpty}</p>
      ) : (
        <ol className="domino m-0 mb-[var(--space-8)] flex list-none flex-col gap-[var(--space-6)] p-0 [--domino-base:120ms]">
          {slides.map((slide, index) => (
            <li
              key={slide.key}
              className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-start gap-x-[var(--space-4)] gap-y-[var(--space-3)]"
            >
              <MoveButtons
                first={index === 0}
                last={index === slides.length - 1}
                onUp={() => move(index, -1)}
                onDown={() => move(index, 1)}
              />

              <span className="relative isolate mx-2 block size-[96px] flex-none">
                <Brush
                  shape="splotch"
                  color={STRONG_LIST[index % STRONG_LIST.length]}
                  className="absolute -inset-3 -z-10 opacity-80"
                />
                <span className="bg-frame absolute inset-0 overflow-hidden rounded-[6px]">
                  <Image
                    src={slide.image.url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </span>
              </span>

              <div className="col-span-3 flex min-w-0 flex-col gap-[var(--space-3)] sm:col-span-1">
                <BilingualField
                  id={`hero-${slide.key}`}
                  label={a.hAlt}
                  value={slide.alt}
                  onChange={(alt) =>
                    change(
                      slides.map((s) => (s.key === slide.key ? { ...s, alt } : s)),
                    )
                  }
                />
                <TextButton
                  className="self-start"
                  onClick={() =>
                    change(slides.filter((s) => s.key !== slide.key))
                  }
                >
                  {a.remove}
                </TextButton>
              </div>
            </li>
          ))}
        </ol>
      )}

      <SaveBar
        pending={save.isPending}
        saved={saved}
        error={save.isError ? a.errorGeneric : null}
      />
    </form>
  );
}
