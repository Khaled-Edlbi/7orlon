"use client";

import * as React from "react";

import Image from "next/image";

import {
  Brush,
  BrushButton,
  BrushTag,
  type BrushShape,
} from "@/components/brush";
import {
  Field,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { useUploadImage } from "@/features/admin/queries";
import type { UploadedImage } from "@/features/admin/types";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

/**
 * The desk's own furniture. Same rules as the gallery it sits behind: no boxes,
 * no borders — a heading is type over a stroke, a button is a label on paint,
 * and a list is rows with air between them.
 */

/** The small upper-case line that opens a section, led by a dash of paint. */
export function Kicker({
  color,
  children,
  className,
}: {
  color: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "m-0 flex items-center gap-2.5 text-[13px] tracking-[0.14em] uppercase rtl:tracking-normal",
        className,
      )}
    >
      <Brush shape="wide" color={color} className="h-3 w-[38px]" />
      {children}
    </p>
  );
}

/**
 * A page's title block: kicker, a heading with paint swiped under it, actions.
 *
 * It is the first thing on every desk page and its three lines land at 0, 90
 * and 180ms — so whatever follows it on the page starts from a
 * `--domino-base` of 240ms.
 */
export function DeskHeading({
  kicker,
  title,
  sub,
  color,
  shape = "wide",
  actions,
}: {
  kicker: string;
  title: React.ReactNode;
  sub?: string;
  /** The stroke under the heading; the kicker's dash takes it too. */
  color: string;
  shape?: BrushShape;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-[var(--space-8)] flex flex-wrap items-end gap-x-[var(--space-6)] gap-y-[var(--space-4)]">
      <div className="domino me-auto flex flex-col gap-[var(--space-3)] [--domino-step:90ms]">
        <Kicker color={color}>{kicker}</Kicker>
        <h1 className="relative isolate m-0 inline-block self-start text-[clamp(34px,4.2vw,60px)] leading-[1.1] font-semibold tracking-[-0.02em]">
          <Brush
            shape={shape}
            color={color}
            className="absolute -z-10 rotate-[-1.5deg]"
            style={{
              insetInlineStart: "-4%",
              bottom: -6,
              width: "92%",
              height: "0.42em",
            }}
          />
          {title}
        </h1>
        {sub && (
          <p className="text-ink-soft m-0 max-w-[60ch] text-[17px] leading-[1.6] text-pretty">
            {sub}
          </p>
        )}
      </div>
      {actions}
    </header>
  );
}

/** A heading inside a page, one size down from the title. */
export function SectionHeading({
  color,
  shape = "line4",
  children,
  className,
}: {
  color: string;
  shape?: BrushShape;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "relative isolate m-0 inline-block self-start text-[clamp(22px,2.2vw,30px)] font-semibold tracking-[-0.01em]",
        className,
      )}
    >
      <Brush
        shape={shape}
        color={color}
        className="absolute -z-10 rotate-[1deg]"
        style={{
          insetInlineStart: "-4%",
          bottom: -5,
          width: "84%",
          height: "0.42em",
        }}
      />
      {children}
    </h2>
  );
}

/** A quiet action: text only, underlined when you reach for it. */
export function TextButton({
  className,
  tone = "mute",
  ...props
}: React.ComponentProps<"button"> & { tone?: "mute" | "danger" }) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer border-0 bg-transparent p-0 font-sans text-[13px] underline-offset-4 transition-colors duration-300 hover:underline",
        tone === "danger"
          ? "text-destructive"
          : "text-ink-mute hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Delete, in two steps: the first press only asks. */
export function ConfirmDelete({
  onConfirm,
  pending,
  label,
}: {
  onConfirm: () => void;
  pending?: boolean;
  label?: string;
}) {
  const { a } = useT();
  const [armed, setArmed] = React.useState(false);

  if (!armed) {
    return (
      <TextButton onClick={() => setArmed(true)}>{label ?? a.delete}</TextButton>
    );
  }

  return (
    <span className="inline-flex items-center gap-3">
      <TextButton tone="danger" disabled={pending} onClick={onConfirm}>
        {a.confirmDelete}
      </TextButton>
      <TextButton onClick={() => setArmed(false)}>{a.cancel}</TextButton>
    </span>
  );
}

/** ↑ and ↓ on a dab of paint, for putting a list in order. */
export function MoveButtons({
  onUp,
  onDown,
  first,
  last,
  disabled,
}: {
  onUp: () => void;
  onDown: () => void;
  first: boolean;
  last: boolean;
  disabled?: boolean;
}) {
  const { a } = useT();
  const button =
    "text-foreground relative isolate grid size-7 flex-none cursor-pointer place-items-center border-0 bg-transparent p-0 font-sans text-[13px] leading-none transition-transform duration-300 ease-atelier hover:scale-110 hover:rotate-[-6deg] disabled:hover:transform-none";

  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        aria-label={a.moveUp}
        disabled={first || disabled}
        onClick={onUp}
        className={button}
      >
        <Brush shape="circle" color="var(--frame)" className="absolute inset-0 -z-10" />
        ↑
      </button>
      <button
        type="button"
        aria-label={a.moveDown}
        disabled={last || disabled}
        onClick={onDown}
        className={button}
      >
        <Brush shape="circle" color="var(--frame)" className="absolute inset-0 -z-10" />
        ↓
      </button>
    </span>
  );
}

/** The submit row: the button, then what happened. */
export function SaveBar({
  pending,
  saved,
  error,
  label,
  children,
  className,
}: {
  pending: boolean;
  saved: boolean;
  error?: string | null;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { a } = useT();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)]",
        className,
      )}
    >
      <BrushButton
        type="submit"
        shape="dab"
        color="var(--primary)"
        className="text-primary-foreground"
        disabled={pending}
      >
        {pending ? a.saving : (label ?? a.save)}
      </BrushButton>
      {children}
      <span aria-live="polite" className="flex items-center">
        {saved && !pending && !error && (
          <BrushTag color="var(--color-plate-leaf)">{a.saved}</BrushTag>
        )}
        {error && <FieldError>{error}</FieldError>}
      </span>
    </div>
  );
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/**
 * A button that opens the file picker, sends the photograph to the repository
 * and hands back where it landed.
 */
export function UploadButton({
  onUploaded,
  children,
  color = "var(--color-plate-butter)",
  shape = "wide",
  multiple,
}: {
  /** Called once per photograph, in the order they were chosen. */
  onUploaded: (image: UploadedImage) => void;
  children: React.ReactNode;
  color?: string;
  shape?: BrushShape;
  /** Let the picker take several files at once. */
  multiple?: boolean;
}) {
  const { a } = useT();
  const upload = useUploadImage();
  const input = React.useRef<HTMLInputElement>(null);

  // One at a time, in order, so the pictures land in the order they were
  // picked. The first failure stops the rest and is shown under the button.
  const send = async (files: File[]) => {
    for (const file of files) {
      try {
        onUploaded(await upload.mutateAsync(file));
      } catch {
        return;
      }
    }
  };

  return (
    <span className="flex flex-col items-start gap-2">
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          // Cleared so choosing the same file again still fires a change.
          event.target.value = "";
          void send(files);
        }}
      />
      <BrushButton
        type="button"
        size="sm"
        shape={shape}
        color={color}
        tilt={-1}
        className="text-foreground"
        disabled={upload.isPending}
        onClick={() => input.current?.click()}
      >
        {upload.isPending ? a.imageUploading : children}
      </BrushButton>
      {upload.isError && <FieldError>{upload.error.message}</FieldError>}
    </span>
  );
}

/** One picture: shown in a frame, with the buttons to replace or remove it. */
export function ImageField({
  value,
  onChange,
  aspect = "4 / 5",
  fit = "cover",
  wash,
  removable = true,
  className,
}: {
  value: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
  /** CSS aspect-ratio of the frame. */
  aspect?: string;
  fit?: "cover" | "contain";
  /** The colour of the paint behind the frame. */
  wash?: string;
  removable?: boolean;
  className?: string;
}) {
  const { a } = useT();

  return (
    <div className={cn("flex flex-col gap-[var(--space-3)]", className)}>
      <div className="relative isolate w-full" style={{ aspectRatio: aspect }}>
        {wash && (
          <Brush
            shape="block"
            color={wash}
            className="absolute inset-[-7%_-9%_-7%_-9%] -z-10 opacity-80 transition-colors duration-500"
          />
        )}
        <div className="atelier-frame absolute inset-0 grid place-items-center">
          {value ? (
            <Image
              src={value.url}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              className={fit === "cover" ? "object-cover" : "object-contain"}
            />
          ) : (
            <span className="text-ink-mute px-4 text-center text-sm">
              {a.imageEmpty}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        <UploadButton onUploaded={onChange}>
          {value ? a.imageReplace : a.imageUpload}
        </UploadButton>
        {value && removable && (
          <TextButton onClick={() => onChange(null)}>{a.remove}</TextButton>
        )}
      </div>
      <p className="text-ink-mute m-0 text-xs leading-[1.6]">{a.imageHint}</p>
    </div>
  );
}

/**
 * The same line in both languages, side by side. Each input is pinned to its
 * own direction, whichever way the desk itself is reading.
 */
export function BilingualField({
  id,
  label,
  value,
  onChange,
  long,
  placeholder,
  invalid,
}: {
  id: string;
  label: string;
  value: { en: string; ar: string };
  onChange: (value: { en: string; ar: string }) => void;
  long?: boolean;
  placeholder?: { en: string; ar: string };
  invalid?: boolean;
}) {
  const line = (locale: "en" | "ar", mark: string) => {
    const shared = {
      id: `${id}-${locale}`,
      dir: locale === "ar" ? "rtl" : "ltr",
      lang: locale,
      value: value[locale],
      placeholder: placeholder?.[locale],
      "aria-invalid": invalid || undefined,
      className: "aria-invalid:border-destructive",
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => onChange({ ...value, [locale]: event.target.value }),
    } as const;

    return (
      <Field>
        <FieldLabel htmlFor={shared.id}>
          {label} <LanguageMark>{mark}</LanguageMark>
        </FieldLabel>
        {long ? <Textarea rows={4} {...shared} /> : <Input {...shared} />}
      </Field>
    );
  };

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-x-[var(--space-6)] gap-y-[var(--space-3)]">
      {line("en", "EN")}
      {line("ar", "عربي")}
    </div>
  );
}

function LanguageMark({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-ink-faint ms-1 tracking-normal normal-case">
      · {children}
    </span>
  );
}

/** What a desk page looks like while its data is on the way. */
export function DeskSkeleton() {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-14 w-72 max-w-full" />
      <div className="mt-[var(--space-6)] flex flex-col gap-[var(--space-3)]">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
