"use client";

import { BrushTag } from "@/components/brush";
import { useT } from "@/hooks/use-t";

/** Available or sold, on a stroke tinted to match. */
export function StockTag({ inStock }: { inStock: boolean }) {
  const { t } = useT();
  return (
    <BrushTag color={inStock ? "#C1FBA4" : "#FFD6E0"}>
      <i
        className="block size-[7px] rounded-full"
        style={{ background: inStock ? "#3f8f6a" : "#d82071" }}
      />
      {inStock ? t.inStock : t.soldOut}
    </BrushTag>
  );
}
