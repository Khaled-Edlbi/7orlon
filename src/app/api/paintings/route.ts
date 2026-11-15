import { NextResponse } from "next/server";

import { listPaintings } from "@/features/paintings/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listPaintings());
}
