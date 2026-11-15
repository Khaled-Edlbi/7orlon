import { NextResponse, type NextRequest } from "next/server";

import { deleteEnquiry } from "@/features/paintings/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/enquiries/[id]">,
) {
  const { id } = await ctx.params;
  const deleted = await deleteEnquiry(id);
  if (!deleted) {
    return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
