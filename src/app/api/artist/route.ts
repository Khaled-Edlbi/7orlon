import { NextResponse } from "next/server";

import { getArtistProfile } from "@/features/artist/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getArtistProfile());
}
