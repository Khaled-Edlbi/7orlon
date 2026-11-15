import { apiFetch } from "@/lib/api";
import {
  sessionSchema,
  uploadedImageSchema,
  type Session,
  type UploadedImage,
} from "@/features/admin/types";

export async function login(password: string): Promise<Session> {
  return sessionSchema.parse(
    await apiFetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  );
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/admin/logout", { method: "POST" });
}

/**
 * The size the browser decoded the picture at — which, unlike the size in the
 * file's header, already accounts for a phone photograph's rotation tag. Sent
 * along as a hint; the server still reads the bytes itself.
 */
async function decodedSize(
  file: File,
): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  const body = new FormData();
  body.set("file", file);

  const size = await decodedSize(file);
  if (size) {
    body.set("width", String(size.width));
    body.set("height", String(size.height));
  }

  return uploadedImageSchema.parse(
    await apiFetch("/api/admin/uploads", { method: "POST", body }),
  );
}
