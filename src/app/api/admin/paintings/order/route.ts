import { NextResponse, type NextRequest } from "next/server";

import { adminGuard } from "@/features/admin/server";
import { reorderPaintings } from "@/features/paintings/server";
import { reorderPaintingsSchema } from "@/features/paintings/types";
import { parseBody } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  const body = await parseBody(request, reorderPaintingsSchema);
  if (body instanceof NextResponse) return body;

  const list = await reorderPaintings(body.ids);
  if (!list) {
    return NextResponse.json(
      { error: "The collection changed. Reload and try again." },
      { status: 409 },
    );
  }
  return NextResponse.json(list);
}
