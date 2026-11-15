"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Brush, BrushButton, BrushTag } from "@/components/brush";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui/field";
import {
  ConfirmDelete,
  DeskHeading,
  SaveBar,
  SectionHeading,
  TextButton,
  UploadButton,
} from "@/features/admin/components/ui";
import {
  PLATE,
  PLATE_ORDER,
  STRONG,
  type PlateName,
} from "@/features/paintings/plates";
import {
  useCreatePainting,
  useDeletePainting,
  usePaintings,
  useUpdatePainting,
} from "@/features/paintings/queries";
import {
  MAX_PAINTING_IMAGES,
  paintingInputSchema,
  type Painting,
  type PaintingImage,
  type PaintingInput,
} from "@/features/paintings/types";
import { useT } from "@/hooks/use-t";
import { HttpError } from "@/lib/api";
import { digits } from "@/lib/format";
import { cn } from "@/lib/utils";

type CopyDraft = {
  title: string;
  medium: string;
  size: string;
  year: string;
  description: string;
};

type Draft = {
  slug: string;
  /** Whole currency units as typed: "2400" or "2400.50". */
  price: string;
  plate: PlateName;
  inStock: boolean;
  /** In viewing order; the first is the cover. */
  images: PaintingImage[];
  en: CopyDraft;
  ar: CopyDraft;
};

type Problem = "slug" | "price" | "title";

const EMPTY_COPY: CopyDraft = {
  title: "",
  medium: "",
  size: "",
  year: "",
  description: "",
};

function draftOf(painting?: Painting): Draft {
  if (!painting) {
    return {
      slug: "",
      price: "",
      plate: "blush",
      inStock: true,
      images: [],
      en: EMPTY_COPY,
      ar: EMPTY_COPY,
    };
  }

  const copyOf = (locale: "en" | "ar"): CopyDraft => {
    const { title, medium, size, year, description } = painting.copy[locale];
    return { title, medium, size, year, description };
  };

  return {
    slug: painting.slug,
    price: minorToMajor(painting.priceMinor),
    plate: painting.plate,
    inStock: painting.inStock,
    images: painting.images,
    en: copyOf("en"),
    ar: copyOf("ar"),
  };
}

/** "240000" → "2400", "240050" → "2400.50". String arithmetic, never a float. */
function minorToMajor(minor: string): string {
  const padded = minor.padStart(3, "0");
  const whole = padded.slice(0, -2);
  const cents = padded.slice(-2);
  return cents === "00" ? whole : `${whole}.${cents}`;
}

/** "2400" → "240000", "2400.5" → "240050". Null when it is not a price. */
function majorToMinor(major: string): string | null {
  const match = /^(\d{1,10})(?:\.(\d{1,2}))?$/.exec(major.trim());
  if (!match) return null;
  const minor = `${match[1]}${(match[2] ?? "").padEnd(2, "0")}`;
  return minor.replace(/^0+(?=\d)/, "");
}

/** "Morning in the Courtyard" → "morning-in-the-courtyard". */
function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** The caption is stored as one line; the form edits its three halves. */
function metaOf(copy: CopyDraft): string {
  return [copy.medium, copy.size, copy.year]
    .map((part) => part.trim())
    .join(" · ")
    .replace(/(?: · )+$/, "");
}

/** The edit page: finds the work in the collection the page prefetched. */
export function PaintingEditor({ id }: { id: string }) {
  const { data } = usePaintings();
  const painting = data.paintings.find((p) => p.id === id);

  // Deleted from under us (this tab or another): nothing left to edit.
  if (!painting) return null;
  return <PaintingForm key={painting.id} painting={painting} />;
}

export function PaintingForm({ painting }: { painting?: Painting }) {
  const { a } = useT();
  const router = useRouter();

  const create = useCreatePainting();
  const update = useUpdatePainting(painting?.id ?? "");
  const remove = useDeletePainting();
  const save = painting ? update : create;

  const [draft, setDraft] = React.useState<Draft>(() => draftOf(painting));
  // A new work's address follows its English title until someone edits it.
  const [slugTouched, setSlugTouched] = React.useState(Boolean(painting));
  const [problems, setProblems] = React.useState<Set<Problem>>(new Set());
  const [saved, setSaved] = React.useState(false);

  const set = (patch: Partial<Draft>) => {
    setSaved(false);
    setDraft((current) => ({ ...current, ...patch }));
  };

  const setCopy = (locale: "en" | "ar", patch: Partial<CopyDraft>) => {
    setSaved(false);
    setDraft((current) => {
      const next = { ...current, [locale]: { ...current[locale], ...patch } };
      if (locale === "en" && patch.title !== undefined && !slugTouched) {
        next.slug = slugify(patch.title);
      }
      return next;
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const priceMinor = majorToMinor(draft.price);
    const candidate = {
      slug: draft.slug.trim(),
      plate: draft.plate,
      priceMinor: priceMinor ?? "",
      inStock: draft.inStock,
      images: draft.images,
      copy: {
        en: {
          title: draft.en.title,
          meta: metaOf(draft.en),
          description: draft.en.description,
        },
        ar: {
          title: draft.ar.title,
          meta: metaOf(draft.ar),
          description: draft.ar.description,
        },
      },
    };

    // The same schema the route handler runs, so the two cannot disagree.
    const parsed = paintingInputSchema.safeParse(candidate);
    if (!parsed.success) {
      const found = new Set<Problem>();
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "slug") found.add("slug");
        if (issue.path[0] === "priceMinor") found.add("price");
        if (issue.path.includes("title")) found.add("title");
      }
      setProblems(found);
      return;
    }

    setProblems(new Set());
    const input: PaintingInput = parsed.data;
    save.mutate(input, {
      onSuccess: () => {
        if (painting) setSaved(true);
        else router.push("/admin/paintings");
      },
    });
  };

  const slugTaken =
    save.error instanceof HttpError && save.error.status === 409;
  const saveError = save.isError && !slugTaken ? a.errorGeneric : null;

  return (
    <form onSubmit={onSubmit} noValidate className="domino">
      <DeskHeading
        kicker={a.pKicker}
        title={painting ? a.pEditTitle : a.pNewTitle}
        color={STRONG[draft.plate]}
        shape="line2"
        actions={
          <Link href="/admin/paintings" className="text-ink-mute text-[13px]">
            <span aria-hidden="true" className="rtl:hidden">← </span>
            <span aria-hidden="true" className="hidden rtl:inline">→ </span>
            {a.pBack}
          </Link>
        }
      />

      <div className="domino grid grid-cols-1 gap-[clamp(40px,6vw,88px)] [--domino-base:100ms] lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        {/* --- the picture, on its plate -------------------------------- */}
        <div className="flex flex-col gap-[var(--space-6)]">
          <ImagesField
            images={draft.images}
            plate={draft.plate}
            onChange={(update) => {
              setSaved(false);
              // A functional update: several uploads finish one after another
              // and each must add to the list the last one left.
              setDraft((current) => ({
                ...current,
                images: update(current.images),
              }));
            }}
          />

          <Field>
            <FieldLabel id="plate-label">{a.pPlate}</FieldLabel>
            <div
              role="radiogroup"
              aria-labelledby="plate-label"
              className="flex flex-wrap gap-[var(--space-2)] pt-1"
            >
              {PLATE_ORDER.map((plate) => {
                const on = plate === draft.plate;
                return (
                  <button
                    key={plate}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={plate}
                    onClick={() => set({ plate })}
                    className={cn(
                      "relative isolate size-11 flex-none cursor-pointer border-0 bg-transparent p-0 transition-transform duration-300 ease-atelier hover:rotate-[-6deg]",
                      on ? "scale-110" : "scale-90 opacity-70 hover:opacity-100",
                    )}
                  >
                    <Brush
                      shape="dab"
                      color={PLATE[plate]}
                      className="absolute inset-0 -z-10"
                    />
                    {on && (
                      <Brush
                        shape="wide"
                        color={STRONG[plate]}
                        className="absolute inset-x-1 -bottom-2 h-2"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        {/* --- everything written about it ------------------------------ */}
        <div className="domino flex min-w-0 flex-col gap-[var(--space-8)] [--domino-base:180ms]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-[var(--space-6)] gap-y-[var(--space-4)]">
            <Field>
              <FieldLabel htmlFor="painting-price">{a.pPrice}</FieldLabel>
              <Input
                id="painting-price"
                dir="ltr"
                inputMode="decimal"
                value={draft.price}
                aria-invalid={problems.has("price") || undefined}
                className="aria-invalid:border-destructive"
                onChange={(event) => set({ price: event.target.value })}
              />
              {problems.has("price") && (
                <FieldError>{a.pPriceInvalid}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="painting-slug">{a.pSlug}</FieldLabel>
              <Input
                id="painting-slug"
                dir="ltr"
                spellCheck={false}
                autoCapitalize="none"
                value={draft.slug}
                aria-invalid={problems.has("slug") || slugTaken || undefined}
                className="aria-invalid:border-destructive"
                onChange={(event) => {
                  setSlugTouched(true);
                  set({ slug: event.target.value });
                }}
              />
              {slugTaken ? (
                <FieldError>{a.pSlugTaken}</FieldError>
              ) : problems.has("slug") ? (
                <FieldError>{a.pSlugInvalid}</FieldError>
              ) : (
                <p className="text-ink-mute m-0 text-xs leading-[1.6]">
                  {a.pSlugHint}
                </p>
              )}
            </Field>
          </div>

          <label className="flex cursor-pointer items-center gap-3 self-start">
            <Checkbox
              checked={draft.inStock}
              onCheckedChange={(value) => set({ inStock: value === true })}
            />
            <span className="flex flex-col">
              <span className="text-base">{a.pAvailability}</span>
              <span className="text-ink-mute text-xs">{a.pAvailabilityHint}</span>
            </span>
          </label>

          <CopyFields
            locale="en"
            heading={a.english}
            color={STRONG.mint}
            copy={draft.en}
            onChange={(patch) => setCopy("en", patch)}
            titleInvalid={problems.has("title") && !draft.en.title.trim()}
          />
          <CopyFields
            locale="ar"
            heading={a.arabic}
            color={STRONG.leaf}
            copy={draft.ar}
            onChange={(patch) => setCopy("ar", patch)}
            titleInvalid={problems.has("title") && !draft.ar.title.trim()}
          />

          <SaveBar
            pending={save.isPending}
            saved={saved}
            error={
              problems.has("title") ? a.pTitleRequired : saveError
            }
            label={painting ? undefined : a.pCreate}
          >
            {painting && (
              <>
                <BrushButton
                  asChild
                  shape="line4"
                  color="var(--color-plate-butter)"
                  tilt={1.5}
                  className="text-foreground"
                >
                  <Link href={`/works/${painting.slug}`} target="_blank">
                    {a.pView}
                  </Link>
                </BrushButton>
                <ConfirmDelete
                  pending={remove.isPending}
                  onConfirm={() =>
                    remove.mutate(painting.id, {
                      onSuccess: () => router.push("/admin/paintings"),
                    })
                  }
                />
              </>
            )}
          </SaveBar>
        </div>
      </div>
    </form>
  );
}

/**
 * A work's photographs: the chosen one in the frame, the rest as a strip under
 * it. The first in the strip is the cover — the picture the collection, the
 * index and a shared link all show — and the arrows on the site walk the rest
 * in this order.
 */
function ImagesField({
  images,
  plate,
  onChange,
}: {
  images: PaintingImage[];
  plate: PlateName;
  onChange: (update: (current: PaintingImage[]) => PaintingImage[]) => void;
}) {
  const { a, t, locale, rtl } = useT();

  const [picked, setPicked] = React.useState(0);
  const index = Math.min(picked, Math.max(0, images.length - 1));
  const shown = images[index];
  const full = images.length >= MAX_PAINTING_IMAGES;

  const move = (delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    onChange((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setPicked(target);
  };

  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-col gap-[var(--space-3)]">
      <div className="relative isolate w-full" style={{ aspectRatio: "4 / 5" }}>
        <Brush
          shape="block"
          color={PLATE[plate]}
          className="absolute inset-[-7%_-9%_-7%_-9%] -z-10 opacity-80 transition-colors duration-500"
        />
        <div className="atelier-frame absolute inset-0 grid place-items-center">
          {shown ? (
            <Image
              key={shown.url}
              src={shown.url}
              alt=""
              fill
              sizes="320px"
              className="animate-in fade-in object-contain duration-500"
            />
          ) : (
            <span className="text-ink-mute px-4 text-center text-sm">
              {a.imageEmpty}
            </span>
          )}
        </div>
        {shown && index === 0 && (
          <BrushTag
            color="var(--color-plate-butter)"
            className="absolute top-2 px-4 py-1 text-[11px]"
            style={{ insetInlineStart: 8 }}
          >
            {a.imageCover}
          </BrushTag>
        )}
      </div>

      {images.length > 1 && (
        <ul className="m-0 flex list-none flex-wrap gap-x-2 gap-y-4 p-0 pb-2">
          {images.map((image, k) => (
            <li key={image.url}>
              <button
                type="button"
                aria-label={`${t.imageN} ${digits(k + 1, locale)}`}
                aria-pressed={k === index}
                onClick={() => setPicked(k)}
                className={cn(
                  "relative isolate block h-[60px] w-[48px] cursor-pointer border-0 bg-transparent p-0 transition-[transform,opacity] duration-300 ease-atelier",
                  k === index ? "scale-105" : "opacity-55 hover:opacity-100",
                )}
              >
                <span className="bg-frame absolute inset-0 overflow-hidden rounded-[4px]">
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                {k === index && (
                  <Brush
                    shape="wide"
                    color={STRONG[plate]}
                    className="absolute inset-x-0 -bottom-2.5 h-2"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)]">
        {!full && (
          <UploadButton
            multiple
            onUploaded={(image) =>
              onChange((current) =>
                current.length >= MAX_PAINTING_IMAGES
                  ? current
                  : [...current, image],
              )
            }
          >
            {images.length > 0 ? a.imagesAdd : a.imageUpload}
          </UploadButton>
        )}
        {shown && images.length > 1 && (
          <>
            <TextButton disabled={index === 0} onClick={() => move(-1)}>
              <span aria-hidden="true">{rtl ? "→" : "←"}</span> {a.moveEarlier}
            </TextButton>
            <TextButton
              disabled={index === images.length - 1}
              onClick={() => move(1)}
            >
              {a.moveLater} <span aria-hidden="true">{rtl ? "←" : "→"}</span>
            </TextButton>
          </>
        )}
        {shown && (
          <TextButton
            onClick={() =>
              onChange((current) => current.filter((i) => i.url !== shown.url))
            }
          >
            {a.remove}
          </TextButton>
        )}
      </div>

      <p className="text-ink-mute m-0 text-xs leading-[1.6]">
        {a.imagesHint} {a.imageHint}
      </p>
    </div>
  );
}

function CopyFields({
  locale,
  heading,
  color,
  copy,
  onChange,
  titleInvalid,
}: {
  locale: "en" | "ar";
  heading: string;
  color: string;
  copy: CopyDraft;
  onChange: (patch: Partial<CopyDraft>) => void;
  titleInvalid: boolean;
}) {
  const { a } = useT();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const id = (name: string) => `painting-${locale}-${name}`;

  return (
    <section
      dir={dir}
      lang={locale}
      className="domino flex flex-col gap-[var(--space-4)] [--domino-base:300ms] [--domino-step:60ms]"
    >
      <SectionHeading color={color}>{heading}</SectionHeading>

      <Field>
        <FieldLabel htmlFor={id("title")}>{a.pTitleField}</FieldLabel>
        <Input
          id={id("title")}
          value={copy.title}
          aria-invalid={titleInvalid || undefined}
          className="aria-invalid:border-destructive text-[20px] font-semibold"
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </Field>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-x-[var(--space-6)] gap-y-[var(--space-4)]">
        <Field>
          <FieldLabel htmlFor={id("medium")}>{a.pMedium}</FieldLabel>
          <Input
            id={id("medium")}
            value={copy.medium}
            onChange={(event) => onChange({ medium: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={id("size")}>{a.pSize}</FieldLabel>
          <Input
            id={id("size")}
            value={copy.size}
            onChange={(event) => onChange({ size: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={id("year")}>{a.pYear}</FieldLabel>
          <Input
            id={id("year")}
            value={copy.year}
            onChange={(event) => onChange({ year: event.target.value })}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor={id("description")}>{a.pDescription}</FieldLabel>
        <Textarea
          id={id("description")}
          rows={4}
          value={copy.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </Field>
    </section>
  );
}
