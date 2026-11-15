import { NextResponse } from "next/server";

import { endSession } from "@/features/admin/server";

export const dynamic = "force-dynamic";

export async function POST() {
  await endSession();
  return new NextResponse(null, { status: 204 });
}
