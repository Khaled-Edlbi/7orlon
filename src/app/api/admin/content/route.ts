import { NextResponse, type NextRequest } from "next/server";

import { adminGuard } from "@/features/admin/server";
import { updateSiteContent } from "@/features/content/server";
import { siteContentInputSchema } from "@/features/content/types";
import { parseBody } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  const body = await parseBody(request, siteContentInputSchema);
  if (body instanceof NextResponse) return body;

  return NextResponse.json(await updateSiteContent(body));
}
