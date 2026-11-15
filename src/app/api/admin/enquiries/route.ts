import { NextResponse } from "next/server";

import { adminGuard } from "@/features/admin/server";
import { listEnquiries } from "@/features/paintings/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  return NextResponse.json(await listEnquiries());
}
