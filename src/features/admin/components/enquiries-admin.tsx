"use client";

import Link from "next/link";

import { Brush, BrushButton } from "@/components/brush";
import { ConfirmDelete, DeskHeading } from "@/features/admin/components/ui";
import { STRONG, STRONG_LIST } from "@/features/paintings/plates";
import {
  useDeleteEnquiry,
  useEnquiries,
} from "@/features/paintings/queries";
import type { AdminEnquiry } from "@/features/paintings/types";
import { useT } from "@/hooks/use-t";
import { counter, digits } from "@/lib/format";

/** Everyone who has written to the studio about a work, newest first. */
export function EnquiriesAdmin() {
  const { a, locale } = useT();
  const { data } = useEnquiries();

  return (
    <>
      <DeskHeading
        kicker={a.eKicker}
        title={a.eTitle}
        sub={
          data.enquiries.length > 0
            ? counter(data.enquiries.length, locale)
            : undefined
        }
        color={STRONG.blush}
        shape="wide"
      />

      {data.enquiries.length === 0 ? (
        <p className="text-ink-mute m-0 text-lg">{a.eEmpty}</p>
      ) : (
        <ul className="domino m-0 flex list-none flex-col gap-[var(--space-8)] p-0 [--domino-base:120ms]">
          {data.enquiries.map((enquiry, index) => (
            <EnquiryRow key={enquiry.id} enquiry={enquiry} index={index} />
          ))}
        </ul>
      )}
    </>
  );
}

function EnquiryRow({
  enquiry,
  index,
}: {
  enquiry: AdminEnquiry;
  index: number;
}) {
  const { a, locale } = useT();
  const remove = useDeleteEnquiry();

  const title = enquiry.painting?.title[locale];
  const subject = enquiry.painting?.title.en ?? "7orlon";

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[var(--space-4)]">
      <Brush
        shape="vert"
        color={STRONG_LIST[index % STRONG_LIST.length]}
        className="mt-1 h-12 w-4"
      />

      <div className="flex min-w-0 max-w-[70ch] flex-col gap-[var(--space-2)]">
        <div className="flex flex-wrap items-baseline gap-x-[var(--space-3)] gap-y-1">
          <span className="text-[22px] font-semibold tracking-[-0.01em]">
            {enquiry.name}
          </span>
          <a
            href={`mailto:${enquiry.email}`}
            dir="ltr"
            className="text-ink-mute text-sm"
          >
            {enquiry.email}
          </a>
          <span className="text-ink-mute ms-auto text-xs" dir="ltr">
            {digits(enquiry.createdAt.slice(0, 10), locale)}
          </span>
        </div>

        <p className="text-ink-mute m-0 text-[13px]">
          {a.eAbout}:{" "}
          {enquiry.painting && title ? (
            <Link
              href={`/works/${enquiry.painting.slug}`}
              className="text-foreground underline underline-offset-4"
            >
              {title}
            </Link>
          ) : (
            a.eGoneWork
          )}
        </p>

        <p
          dir="auto"
          className="text-ink-soft m-0 text-[17px] leading-[1.65] whitespace-pre-wrap"
        >
          {enquiry.message}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-[var(--space-4)]">
          <BrushButton
            asChild
            size="sm"
            shape="wide"
            color="var(--color-plate-leaf)"
            tilt={-1}
            className="text-foreground"
          >
            <a
              href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${subject}`)}`}
            >
              {a.eReply}
            </a>
          </BrushButton>
          <ConfirmDelete
            pending={remove.isPending}
            onConfirm={() => remove.mutate(enquiry.id)}
          />
        </div>
      </div>
    </li>
  );
}
