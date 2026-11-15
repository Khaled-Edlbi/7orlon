import { NextResponse, type NextRequest } from "next/server";

import { getRatesProvider, ProviderError } from "@/server/providers/rates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const base = (request.nextUrl.searchParams.get("base") ?? "USD").toUpperCase();

  if (!/^[A-Z]{3}$/.test(base)) {
    return NextResponse.json(
      { error: "`base` must be a three-letter currency code." },
      { status: 400 },
    );
  }

  const provider = getRatesProvider();
  try {
    return NextResponse.json(await provider.getRates(base));
  } catch (error) {
    // The database is fine; someone else's API is not. 422, not 500.
    if (error instanceof ProviderError) {
      return NextResponse.json(
        { error: error.message, provider: error.provider },
        { status: 422 },
      );
    }
    throw error;
  }
}
