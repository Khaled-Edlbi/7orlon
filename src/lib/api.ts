import { HttpError } from "@/lib/query-client";

export { HttpError };

/**
 * The one place the client talks to our route handlers.
 *
 * Callers get parsed JSON or an `HttpError`; nobody downstream has to remember
 * to check `res.ok`. Feature `api.ts` files wrap this and run the response
 * through the feature's zod schema, so a drifting API fails loudly and early.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      // Only a string body is JSON. A FormData upload has to set its own
      // multipart boundary, so its Content-Type is left to the browser.
      ...(typeof init?.body === "string"
        ? { "Content-Type": "application/json" }
        : null),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    const message =
      (typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : null) ?? `${res.status} ${res.statusText}`;
    throw new HttpError(res.status, message, body);
  }

  // 204 No Content — a delete that worked has nothing to say.
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
