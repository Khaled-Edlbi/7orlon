import { NextResponse, type NextRequest } from "next/server";

import { adminGuard } from "@/features/admin/server";
import { updateArtistProfile } from "@/features/artist/server";
import { artistInputSchema } from "@/features/artist/types";
import { parseBody } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  const body = await parseBody(request, artistInputSchema);
  if (body instanceof NextResponse) return body;

  return NextResponse.json(await updateArtistProfile(body));
}
