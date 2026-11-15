import { NextResponse, type NextRequest } from "next/server";

import {
  createEnquiry,
  DuplicateEnquiryError,
} from "@/features/paintings/server";
import { createEnquirySchema } from "@/features/paintings/types";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/paintings/[slug]/enquiries">,
) {
  const { slug } = await ctx.params;

  const parsed = createEnquirySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const enquiry = await createEnquiry(slug, parsed.data);
    if (!enquiry) {
      return NextResponse.json(
        { error: "Painting not found." },
        { status: 404 },
      );
    }
    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateEnquiryError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
