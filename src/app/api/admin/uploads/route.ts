import { NextResponse, type NextRequest } from "next/server";

import { adminGuard } from "@/features/admin/server";
import { MAX_UPLOAD_BYTES } from "@/features/admin/types";
import { readImageMeta } from "@/lib/image-meta";
import { imageStorage, StorageError } from "@/server/providers/storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was sent." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "That photograph is larger than 8 MB." },
      { status: 400 },
    );
  }

  // The format and size come from the bytes, not from what the sender claims.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const meta = readImageMeta(bytes);
  if (!meta) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, WebP or GIF photograph." },
      { status: 400 },
    );
  }

  // A phone photograph is often stored on its side with a rotation tag; the
  // browser sends the size it actually decoded. That hint is believed only
  // when it is the exact transpose of the size in the header.
  let { width, height } = meta;
  if (
    Number(form?.get("width")) === meta.height &&
    Number(form?.get("height")) === meta.width
  ) {
    [width, height] = [meta.height, meta.width];
  }

  try {
    const url = await imageStorage.save(bytes, meta.extension);
    return NextResponse.json({ url, width, height }, { status: 201 });
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    throw error;
  }
}
