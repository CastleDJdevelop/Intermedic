import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  createSessionToken, verifySessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS,
  type SessionPayload,
} from "./session";

export type { SessionPayload };
export { SESSION_COOKIE_NAME };

/* ---------- Contraseñas (scrypt, nativo de Node — solo se usa en Route Handlers) ---------- */

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(plain, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* ---------- Sesión — helpers para Server Components y Route Handlers ---------- */

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function setSessionCookie(payload: Omit<SessionPayload, "exp">) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, await createSessionToken(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
