import { NextResponse } from "next/server";

import { listHeroSlides } from "@/features/paintings/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listHeroSlides());
}
