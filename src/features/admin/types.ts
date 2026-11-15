import { z } from "zod";

import { localImageSchema } from "@/features/paintings/types";

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const sessionSchema = z.object({
  authenticated: z.boolean(),
});

/** What the upload route answers with: where the picture is, and its size. */
export const uploadedImageSchema = localImageSchema;

/** The largest photograph the desk will take. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type LoginInput = z.infer<typeof loginSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type UploadedImage = z.infer<typeof uploadedImageSchema>;
