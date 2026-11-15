"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import { Brush, BrushButton } from "@/components/brush";
import { Field, FieldLabel, Input } from "@/components/ui/field";
import {
  BilingualField,
  DeskHeading,
  ImageField,
  MoveButtons,
  SaveBar,
  SectionHeading,
  TextButton,
  UploadButton,
} from "@/features/admin/components/ui";
import {
  useArtistProfile,
  useSaveArtistProfile,
} from "@/features/artist/queries";
import {
  artistInputSchema,
  type ArtistProfile,
} from "@/features/artist/types";
import { STRONG, STRONG_LIST } from "@/features/paintings/plates";
import type { PaintingImage } from "@/features/paintings/types";
import { useT } from "@/hooks/use-t";

type Bilingual = { en: string; ar: string };

type Draft = {
  portrait: PaintingImage | null;
  email: string;
  instagramUrl: string;
  pinterestUrl: string;
  behanceUrl: string;
  studioPhotos: Array<{
    key: string;
    id?: string;
    image: PaintingImage;
    caption: Bilingual;
  }>;
  /** The year stays text while it is being typed. */
  milestones: Array<{ key: string; id?: string; year: string; text: Bilingual }>;
};

function draftOf(profile: ArtistProfile): Draft {
  return {
    portrait: profile.portrait,
    email: profile.email,
    instagramUrl: profile.instagramUrl,
    pinterestUrl: profile.pinterestUrl,
    behanceUrl: profile.behanceUrl,
    studioPhotos: profile.studioPhotos.map((photo) => ({
      key: photo.id,
      id: photo.id,
      image: photo.image,
      caption: { en: photo.caption.en, ar: photo.caption.ar },
    })),
    milestones: profile.milestones.map((milestone) => ({
      key: milestone.id,
      id: milestone.id,
      year: String(milestone.year),
      text: { en: milestone.text.en, ar: milestone.text.ar },
    })),
  };
}

const LINKS = [
  { field: "instagramUrl", label: "Instagram" },
  { field: "pinterestUrl", label: "Pinterest" },
  { field: "behanceUrl", label: "Behance" },
] as const;

/** The studio behind the collection: portrait, links, photographs, milestones. */
export function ArtistAdmin() {
  const { a } = useT();
  const { data: profile } = useArtistProfile();
  const save = useSaveArtistProfile();

  const [draft, setDraft] = React.useState(() => draftOf(profile));
  const [invalid, setInvalid] = React.useState<Set<string>>(new Set());
  const [saved, setSaved] = React.useState(false);
  const newKey = React.useRef(0);

  const set = (patch: Partial<Draft>) => {
    setSaved(false);
    setDraft((current) => ({ ...current, ...patch }));
  };

  const movePhoto = (index: number, delta: -1 | 1) => {
    const next = [...draft.studioPhotos];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    set({ studioPhotos: next });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = artistInputSchema.safeParse({
      portrait: draft.portrait,
      email: draft.email.trim(),
      instagramUrl: draft.instagramUrl.trim(),
      pinterestUrl: draft.pinterestUrl.trim(),
      behanceUrl: draft.behanceUrl.trim(),
      studioPhotos: draft.studioPhotos.map(({ id, image, caption }) => ({
        id,
        image,
        caption,
      })),
      milestones: draft.milestones.map(({ id, year, text }) => ({
        id,
        year: /^\d{4}$/.test(year.trim()) ? Number(year) : Number.NaN,
        text,
      })),
    });

    if (!parsed.success) {
      // "email", "instagramUrl", "milestones.2" — enough to underline the field.
      setInvalid(
        new Set(
          parsed.error.issues.map((issue) => issue.path.slice(0, 2).join(".")),
        ),
      );
      return;
    }

    setInvalid(new Set());
    save.mutate(parsed.data, {
      onSuccess: (next) => {
        setDraft(draftOf(next));
        setSaved(true);
      },
    });
  };

  const error =
    invalid.size > 0 || save.isError ? a.errorGeneric : null;

  return (
    <form onSubmit={onSubmit} noValidate className="domino">
      <DeskHeading
        kicker={a.arKicker}
        title={a.arTitle}
        color={STRONG.leaf}
        shape="line2"
      />

      <div className="domino grid grid-cols-1 gap-[clamp(40px,6vw,88px)] [--domino-base:100ms] lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-[var(--space-4)]">
          <SectionHeading color={STRONG.butter} shape="wide">
            {a.arPortrait}
          </SectionHeading>
          <ImageField
            value={draft.portrait}
            onChange={(portrait) => set({ portrait })}
            wash="var(--color-plate-mint)"
            className="mx-auto mt-[var(--space-2)] w-full max-w-[300px]"
          />
        </div>

        <div className="domino flex min-w-0 flex-col gap-[var(--space-8)] [--domino-base:180ms]">
          {/* --- contact ------------------------------------------------ */}
          <section className="flex flex-col gap-[var(--space-4)]">
            <SectionHeading color={STRONG.mint}>{a.arContact}</SectionHeading>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-[var(--space-6)] gap-y-[var(--space-4)]">
              <Field>
                <FieldLabel htmlFor="artist-email">{a.arEmail}</FieldLabel>
                <Input
                  id="artist-email"
                  type="email"
                  dir="ltr"
                  value={draft.email}
                  aria-invalid={invalid.has("email") || undefined}
                  className="aria-invalid:border-destructive"
                  onChange={(event) => set({ email: event.target.value })}
                />
              </Field>

              {LINKS.map(({ field, label }) => (
                <Field key={field}>
                  <FieldLabel htmlFor={`artist-${field}`}>{label}</FieldLabel>
                  <Input
                    id={`artist-${field}`}
                    type="url"
                    dir="ltr"
                    placeholder="https://"
                    value={draft[field]}
                    aria-invalid={invalid.has(field) || undefined}
                    className="aria-invalid:border-destructive"
                    onChange={(event) => set({ [field]: event.target.value })}
                  />
                </Field>
              ))}
            </div>

            <p className="text-ink-mute m-0 text-[13px] leading-[1.6]">
              {a.arCopyNote}{" "}
              <Link href="/admin/content#artist" className="underline underline-offset-4">
                {a.navContent}
              </Link>
            </p>
          </section>

          {/* --- studio photographs ------------------------------------- */}
          <section className="flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-wrap items-end gap-[var(--space-4)]">
              <SectionHeading color={STRONG.blush} className="me-auto">
                {a.arStudio}
              </SectionHeading>
              <UploadButton
                color="var(--color-plate-blush)"
                onUploaded={(image) =>
                  set({
                    studioPhotos: [
                      ...draft.studioPhotos,
                      { key: image.url, image, caption: { en: "", ar: "" } },
                    ],
                  })
                }
              >
                {a.arAddPhoto}
              </UploadButton>
            </div>

            <ol className="m-0 flex list-none flex-col gap-[var(--space-6)] p-0">
              {draft.studioPhotos.map((photo, index) => (
                <li
                  key={photo.key}
                  className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-start gap-x-[var(--space-4)] gap-y-[var(--space-3)]"
                >
                  <MoveButtons
                    first={index === 0}
                    last={index === draft.studioPhotos.length - 1}
                    onUp={() => movePhoto(index, -1)}
                    onDown={() => movePhoto(index, 1)}
                  />

                  <span className="relative isolate mx-2 block h-[78px] w-[104px] flex-none">
                    <Brush
                      shape="dab"
                      color={STRONG_LIST[(index + 1) % STRONG_LIST.length]}
                      className="absolute -inset-2.5 -z-10 opacity-80"
                    />
                    <span className="bg-frame absolute inset-0 overflow-hidden rounded-[6px]">
                      <Image
                        src={photo.image.url}
                        alt=""
                        fill
                        sizes="104px"
                        className="object-cover"
                      />
                    </span>
                  </span>

                  <div className="col-span-3 flex min-w-0 flex-col gap-[var(--space-3)] sm:col-span-1">
                    <BilingualField
                      id={`studio-${photo.key}`}
                      label={a.arCaption}
                      value={photo.caption}
                      onChange={(caption) =>
                        set({
                          studioPhotos: draft.studioPhotos.map((p) =>
                            p.key === photo.key ? { ...p, caption } : p,
                          ),
                        })
                      }
                    />
                    <TextButton
                      className="self-start"
                      onClick={() =>
                        set({
                          studioPhotos: draft.studioPhotos.filter(
                            (p) => p.key !== photo.key,
                          ),
                        })
                      }
                    >
                      {a.remove}
                    </TextButton>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* --- milestones --------------------------------------------- */}
          <section className="flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-wrap items-end gap-[var(--space-4)]">
              <SectionHeading
                color={STRONG.butter}
                shape="streaks"
                className="me-auto"
              >
                {a.arMilestones}
              </SectionHeading>
              <BrushButton
                type="button"
                size="sm"
                shape="wide"
                color="var(--color-plate-butter)"
                tilt={-1}
                className="text-foreground"
                onClick={() => {
                  newKey.current += 1;
                  set({
                    milestones: [
                      {
                        key: `new-${newKey.current}`,
                        year: String(new Date().getFullYear()),
                        text: { en: "", ar: "" },
                      },
                      ...draft.milestones,
                    ],
                  });
                }}
              >
                {a.arAddMilestone}
              </BrushButton>
            </div>

            <ol className="m-0 flex list-none flex-col gap-[var(--space-4)] p-0">
              {draft.milestones.map((milestone, index) => (
                <li
                  key={milestone.key}
                  className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-[var(--space-4)] gap-y-[var(--space-2)]"
                >
                  <Field>
                    <FieldLabel htmlFor={`milestone-${milestone.key}-year`}>
                      {a.arYear}
                    </FieldLabel>
                    <Input
                      id={`milestone-${milestone.key}-year`}
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={4}
                      value={milestone.year}
                      aria-invalid={invalid.has(`milestones.${index}`) || undefined}
                      className="aria-invalid:border-destructive font-semibold"
                      onChange={(event) =>
                        set({
                          milestones: draft.milestones.map((m) =>
                            m.key === milestone.key
                              ? { ...m, year: event.target.value }
                              : m,
                          ),
                        })
                      }
                    />
                  </Field>

                  <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
                    <BilingualField
                      id={`milestone-${milestone.key}`}
                      label={a.arText}
                      value={milestone.text}
                      onChange={(text) =>
                        set({
                          milestones: draft.milestones.map((m) =>
                            m.key === milestone.key ? { ...m, text } : m,
                          ),
                        })
                      }
                    />
                    <TextButton
                      className="self-start"
                      onClick={() =>
                        set({
                          milestones: draft.milestones.filter(
                            (m) => m.key !== milestone.key,
                          ),
                        })
                      }
                    >
                      {a.remove}
                    </TextButton>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <SaveBar pending={save.isPending} saved={saved} error={error} />
        </div>
      </div>
    </form>
  );
}
