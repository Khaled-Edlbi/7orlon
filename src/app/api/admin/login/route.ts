import { NextResponse, type NextRequest } from "next/server";

import {
  adminConfigured,
  clearFailedLogins,
  loginLocked,
  passwordMatches,
  recordFailedLogin,
  startSession,
} from "@/features/admin/server";
import { loginSchema } from "@/features/admin/types";
import { parseBody } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "The admin desk is not configured." },
      { status: 503 },
    );
  }

  const client =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (loginLocked(client)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  const body = await parseBody(request, loginSchema);
  if (body instanceof NextResponse) return body;

  if (!passwordMatches(body.password)) {
    recordFailedLogin(client);
    return NextResponse.json(
      { error: "That password is not right." },
      { status: 401 },
    );
  }

  clearFailedLogins(client);
  await startSession();
  return NextResponse.json({ authenticated: true });
}
