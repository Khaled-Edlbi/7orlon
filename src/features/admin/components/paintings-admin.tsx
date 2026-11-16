"use client";

import Image from "next/image";
import Link from "next/link";

import { Brush, BrushButton } from "@/components/brush";
import {
  ConfirmDelete,
  DeskHeading,
  MoveButtons,
} from "@/features/admin/components/ui";
import { StockTag } from "@/features/paintings/components/stock-tag";
import { PLATE, STRONG } from "@/features/paintings/plates";
import {
  useDeletePainting,
  usePaintings,
  useReorderPaintings,
  useSetPaintingStock,
} from "@/features/paintings/queries";
import type { Painting } from "@/features/paintings/types";
import { useT } from "@/hooks/use-t";
import { counter, price } from "@/lib/format";

/**
 * The collection as the studio sees it: every work in wall order, with the
 * three things that change most often — its place, its status, its details —
 * one press away.
 */
export function PaintingsAdmin() {
  const { a, t, locale } = useT();
  const { data } = usePaintings();
  const reorder = useReorderPaintings();

  const paintings = data.paintings;

  const move = (index: number, delta: -1 | 1) => {
    const ids = paintings.map((p) => p.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids);
  };

  return (
    <>
      <DeskHeading
        kicker={a.pKicker}
        title={a.pTitle}
        sub={`${counter(paintings.length, locale)} ${t.works}`}
        color={STRONG.blush}
        shape="streaks"
        actions={
          <BrushButton
            asChild
            shape="dab"
            color="var(--primary)"
            className="text-primary-foreground"
          >
            <Link href="/admin/paintings/new">{a.pAdd}</Link>
          </BrushButton>
        }
      />

      {paintings.length === 0 ? (
        <p className="text-ink-mute m-0 text-lg">{a.pEmpty}</p>
      ) : (
        <ol className="domino m-0 flex list-none flex-col gap-0.5 p-0 [--domino-order:0] [--domino-base:240ms] [--domino-step:45ms]">
          {paintings.map((painting, index) => (
            <PaintingRow
              key={painting.id}
              painting={painting}
              first={index === 0}
              last={index === paintings.length - 1}
              onMove={(delta) => move(index, delta)}
            />
          ))}
        </ol>
      )}
    </>
  );
}

function PaintingRow({
  painting,
  first,
  last,
  onMove,
}: {
  painting: Painting;
  first: boolean;
  last: boolean;
  onMove: (delta: -1 | 1) => void;
}) {
  const { a, locale } = useT();
  const setStock = useSetPaintingStock(painting.slug);
  const remove = useDeletePainting();

  const copy = painting.copy[locale];
  const editHref = `/admin/paintings/${painting.id}`;

  return (
    <li className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)] py-[var(--space-2)] md:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto]">
      <MoveButtons
        first={first}
        last={last}
        onUp={() => onMove(-1)}
        onDown={() => onMove(1)}
      />

      <Link
        href={editHref}
        aria-hidden="true"
        tabIndex={-1}
        className="relative isolate mx-2 block h-[66px] w-[52px] flex-none"
      >
        <Brush
          shape="blob"
          color={PLATE[painting.plate]}
          className="absolute -inset-2.5 -z-10"
        />
        <span className="bg-frame absolute inset-0 overflow-hidden rounded-[4px]">
          {painting.image && (
            <Image
              src={painting.image.url}
              alt=""
              fill
              sizes="52px"
              className="object-cover"
            />
          )}
        </span>
      </Link>

      <Link
        href={editHref}
        className="flex min-w-0 flex-col gap-0.5 transition-transform duration-300 ease-atelier hover:translate-x-1 rtl:hover:-translate-x-1"
      >
        <span className="-my-1 truncate py-1 text-lg leading-[1.5] font-semibold">
          {copy.title}
        </span>
        <span className="text-ink-mute -my-1 truncate py-1 text-xs leading-[1.6]">
          {copy.meta}
        </span>
      </Link>

      <span className="col-start-3 text-base font-semibold md:col-start-auto md:text-end">
        {price(painting.priceMinor, painting.currency, locale)}
      </span>

      <button
        type="button"
        aria-pressed={painting.inStock}
        onClick={() => setStock.mutate(!painting.inStock)}
        className="col-start-3 cursor-pointer justify-self-start border-0 bg-transparent p-0 font-sans transition-transform duration-300 ease-atelier hover:rotate-[-2deg] md:col-start-auto"
      >
        <StockTag inStock={painting.inStock} />
      </button>

      <span className="col-start-3 flex items-center gap-[var(--space-3)] text-[13px] md:col-start-auto md:justify-self-end">
        <Link href={editHref}>{a.edit}</Link>
        <ConfirmDelete
          pending={remove.isPending}
          onConfirm={() => remove.mutate(painting.id)}
        />
      </span>
    </li>
  );
}
