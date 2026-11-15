import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

/**
 * The studio desk has one key and no user table: a password in the
 * environment, and a signed, http-only cookie that says "this browser knew
 * it". Nothing about the session is stored — the cookie carries its own expiry
 * and an HMAC over it, so it cannot be forged or extended without the secret.
 *
 * Every admin page and every admin route handler checks the session itself
 * (`requireAdminPage` / `adminGuard`). There is no proxy in front doing it for
 * them, on purpose: a check that lives next to the data cannot be routed
 * around.
 */
const SESSION_COOKIE = "7orlon_admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

type Keys = { password: string; secret: string };

function keys(): Keys | null {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  return password && secret ? { password, secret } : null;
}

/** False until both ADMIN_PASSWORD and ADMIN_SESSION_SECRET are set. */
export function adminConfigured(): boolean {
  return keys() !== null;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * The signature covers the password as well as the expiry, so changing the
 * password signs every existing session out.
 */
function sign(expiresAt: number, { password, secret }: Keys): string {
  return createHmac("sha256", secret)
    .update(`${expiresAt}.${digest(password).toString("hex")}`)
    .digest("base64url");
}

function verify(token: string | undefined): boolean {
  const k = keys();
  if (!k || !token) return false;

  const [expiry, signature] = token.split(".");
  const expiresAt = Number(expiry);
  if (!signature || !Number.isSafeInteger(expiresAt)) return false;
  if (expiresAt < Date.now()) return false;

  const expected = Buffer.from(sign(expiresAt, k));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Compared as digests so the check takes the same time whatever was typed. */
export function passwordMatches(candidate: string): boolean {
  const k = keys();
  if (!k) return false;
  return timingSafeEqual(digest(candidate), digest(k.password));
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verify(store.get(SESSION_COOKIE)?.value);
}

/** Route handlers only — a cookie cannot be set while a page is rendering. */
export async function startSession(): Promise<void> {
  const k = keys();
  if (!k) throw new Error("The admin desk is not configured.");

  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  const store = await cookies();
  store.set(SESSION_COOKIE, `${expiresAt}.${sign(expiresAt, k)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax: the cookie is not sent on a cross-site POST, which is what keeps
    // another site from submitting to the admin routes on the studio's behalf.
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** For admin pages: anyone without a session is sent to the door. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/**
 * For admin route handlers:
 *
 *   const denied = await adminGuard();
 *   if (denied) return denied;
 */
export async function adminGuard(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "Sign in to do that." }, { status: 401 });
}

// --- slowing down guesses ---------------------------------------------------

const ATTEMPT_LIMIT = 8;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

// In memory, per process: enough to make guessing the password impractical on
// a single server, and it forgets everything on restart.
const globalForAttempts = globalThis as unknown as {
  adminAttempts?: Map<string, { count: number; resetAt: number }>;
};
const attempts = (globalForAttempts.adminAttempts ??= new Map());

/** True while this client has used up its wrong guesses. */
export function loginLocked(client: string): boolean {
  const entry = attempts.get(client);
  if (!entry) return false;
  if (entry.resetAt < Date.now()) {
    attempts.delete(client);
    return false;
  }
  return entry.count >= ATTEMPT_LIMIT;
}

export function recordFailedLogin(client: string): void {
  const now = Date.now();
  const entry = attempts.get(client);
  if (!entry || entry.resetAt < now) {
    attempts.set(client, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearFailedLogins(client: string): void {
  attempts.delete(client);
}
