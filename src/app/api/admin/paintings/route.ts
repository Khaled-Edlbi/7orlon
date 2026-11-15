import { NextResponse, type NextRequest } from "next/server";

import { adminGuard } from "@/features/admin/server";
import { createPainting, SlugTakenError } from "@/features/paintings/server";
import { paintingInputSchema } from "@/features/paintings/types";
import { parseBody } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  const body = await parseBody(request, paintingInputSchema);
  if (body instanceof NextResponse) return body;

  try {
    return NextResponse.json(await createPainting(body), { status: 201 });
  } catch (error) {
    if (error instanceof SlugTakenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
