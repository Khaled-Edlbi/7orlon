import { NextResponse, type NextRequest } from "next/server";

import { adminGuard } from "@/features/admin/server";
import { replaceHeroSlides } from "@/features/paintings/server";
import { heroSlidesInputSchema } from "@/features/paintings/types";
import { parseBody } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  const body = await parseBody(request, heroSlidesInputSchema);
  if (body instanceof NextResponse) return body;

  return NextResponse.json(await replaceHeroSlides(body));
}
