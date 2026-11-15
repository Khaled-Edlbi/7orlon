import { NextResponse, type NextRequest } from "next/server";

import { adminGuard } from "@/features/admin/server";
import {
  deletePainting,
  SlugTakenError,
  updatePainting,
} from "@/features/paintings/server";
import { paintingInputSchema } from "@/features/paintings/types";
import { parseBody } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/paintings/[id]">,
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { id } = await ctx.params;
  const body = await parseBody(request, paintingInputSchema);
  if (body instanceof NextResponse) return body;

  try {
    const painting = await updatePainting(id, body);
    if (!painting) {
      return NextResponse.json({ error: "Painting not found." }, { status: 404 });
    }
    return NextResponse.json(painting);
  } catch (error) {
    if (error instanceof SlugTakenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/paintings/[id]">,
) {
  const denied = await adminGuard();
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!(await deletePainting(id))) {
    return NextResponse.json({ error: "Painting not found." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
