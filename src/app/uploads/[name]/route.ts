import { NextResponse, type NextRequest } from "next/server";

import { imageStorage } from "@/server/providers/storage";

export const dynamic = "force-dynamic";

/**
 * Uploaded photographs live in `public/uploads/`, and in development Next
 * serves them from there directly — this handler is never reached.
 *
 * A production server, though, only knows about the files that were in
 * `public/` when it started. A photograph uploaded since then would 404 until
 * the next restart, so the request falls through to here and is read off disk.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/uploads/[name]">,
) {
  const { name } = await ctx.params;
  const file = await imageStorage.read(name);
  if (!file) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(new Blob([new Uint8Array(file.bytes)]), {
    headers: {
      "Content-Type": file.contentType,
      // Names are random and never reused, so a file can be cached for good.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
