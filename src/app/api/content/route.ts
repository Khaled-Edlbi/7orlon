import { NextResponse } from "next/server";

import { getSiteContent } from "@/features/content/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSiteContent());
}
