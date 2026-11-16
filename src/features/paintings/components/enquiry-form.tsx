"use client";

import * as React from "react";

import { BrushButton, BrushTag } from "@/components/brush";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui/field";
import {
  useCreateEnquiry,
  useDeleteEnquiry,
} from "@/features/paintings/queries";
import { createEnquirySchema } from "@/features/paintings/types";
import { useT } from "@/hooks/use-t";
import { HttpError } from "@/lib/api";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

/**
 * The one thing a visitor can write to the studio.
 *
 * The same zod schema validates here and in the route handler, so the two can
 * never disagree about what a valid enquiry is. A sent enquiry stays undoable
 * for as long as the form is on screen — the studio would rather have the row
 * deleted than receive a message someone changed their mind about.
 */
export function EnquiryForm({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const { t } = useT();
  const create = useCreateEnquiry(slug);
  const remove = useDeleteEnquiry();

  const [errors, setErrors] = React.useState<Errors>({});
  const [consent, setConsent] = React.useState(false);
  const [sentId, setSentId] = React.useState<string | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const parsed = createEnquirySchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      message: form.get("message"),
    });

    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "email" || key === "message") {
          next[key] ??= issue.message;
        }
      }
      setErrors(next);
      return;
    }

    setErrors({});
    create.mutate(parsed.data, {
      onSuccess: (enquiry) => setSentId(enquiry.id),
    });
  };

  if (sentId) {
    return (
      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        <BrushTag color="#C1FBA4">{t.enquirySent}</BrushTag>
        <button
          type="button"
          className="text-ink-mute cursor-pointer border-0 bg-transparent p-0 text-[13px] underline-offset-4 hover:underline"
          disabled={remove.isPending}
          onClick={() =>
            remove.mutate(sentId, { onSuccess: () => setSentId(null) })
          }
        >
          {t.enquiryUndo}
        </button>
      </div>
    );
  }

  const duplicate =
    create.error instanceof HttpError && create.error.status === 409;

  return (
    <form
      id="enquire"
      onSubmit={onSubmit}
      noValidate
      className="domino flex max-w-[520px] scroll-mt-24 flex-col gap-[var(--space-4)] [--domino-step:90ms]"
    >
      <h3 className="m-0 text-[22px] font-semibold tracking-[-0.01em]">
        {t.enquiryTitle}
      </h3>

      <Field>
        <FieldLabel htmlFor="enquiry-name">{t.enquiryName}</FieldLabel>
        <Input id="enquiry-name" name="name" autoComplete="name" />
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="enquiry-email">{t.enquiryEmail}</FieldLabel>
        <Input
          id="enquiry-email"
          name="email"
          type="email"
          autoComplete="email"
        />
        {errors.email && <FieldError>{errors.email}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="enquiry-message">{t.enquiryMessage}</FieldLabel>
        <Textarea
          id="enquiry-message"
          name="message"
          rows={4}
          placeholder={t.enquiryMessagePlaceholder}
          defaultValue={`${title} — `}
        />
        {errors.message && <FieldError>{errors.message}</FieldError>}
      </Field>

      <label className="text-ink-soft flex cursor-pointer items-center gap-3 text-sm">
        <Checkbox
          checked={consent}
          onCheckedChange={(value) => setConsent(value === true)}
        />
        {t.enquiryConsent}
      </label>

      {duplicate && <FieldError>{t.enquiryDuplicate}</FieldError>}
      {create.isError && !duplicate && (
        <FieldError>{create.error.message}</FieldError>
      )}

      <div>
        <BrushButton
          type="submit"
          shape="dab"
          color="var(--primary)"
          className="text-primary-foreground"
          disabled={create.isPending}
        >
          {create.isPending ? t.enquirySending : t.enquirySend}
        </BrushButton>
      </div>
    </form>
  );
}
