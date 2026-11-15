import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";

/**
 * Parses a JSON request body against a schema.
 *
 * Returns either the parsed data or the `400 {error, issues}` response every
 * route handler in this app answers a bad shape with — so a handler reads:
 *
 *   const body = await parseBody(request, schema);
 *   if (body instanceof NextResponse) return body;
 */
export async function parseBody<S extends z.ZodType>(
  request: NextRequest,
  schema: S,
): Promise<z.infer<S> | NextResponse> {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  return parsed.data;
}
