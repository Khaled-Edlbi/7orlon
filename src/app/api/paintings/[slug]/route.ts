import { NextResponse, type NextRequest } from "next/server";

import { adminGuard } from "@/features/admin/server";
import {
  getPaintingBySlug,
  setPaintingStock,
} from "@/features/paintings/server";
import { updatePaintingSchema } from "@/features/paintings/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/paintings/[slug]">,
) {
  const { slug } = await ctx.params;
  const painting = await getPaintingBySlug(slug);
  if (!painting) {
    return NextResponse.json({ error: "Painting not found." }, { status: 404 });
  }
  return NextResponse.json(painting);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/paintings/[slug]">,
) {
  // Marking a work sold is the studio's call, not a visitor's.
  const denied = await adminGuard();
  if (denied) return denied;

  const { slug } = await ctx.params;

  const parsed = updatePaintingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const painting = await setPaintingStock(slug, parsed.data.inStock);
  if (!painting) {
    return NextResponse.json({ error: "Painting not found." }, { status: 404 });
  }
  return NextResponse.json(painting);
}
