import type { UserRole } from "./types";

/**
 * Funciones puras de firma/verificación de sesión, sin importar "next/headers"
 * (que no está disponible en middleware.ts, que corre en Edge runtime).
 * lib/auth.ts las envuelve para Server Components / Route Handlers;
 * middleware.ts las usa directamente sobre la cookie cruda del request.
 */

const SESSION_DAYS = 7;
export const SESSION_COOKIE_NAME = "intermedic_session";

export interface SessionPayload {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  exp: number; // epoch ms
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "Falta o es muy corta la variable de entorno SESSION_SECRET (mínimo 16 caracteres). " +
      "Configúrala en Vercel → Settings → Environment Variables."
    );
  }
  return secret;
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payload: string): Promise<string> {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bufToHex(sig);
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const full: SessionPayload = { ...payload, exp: Date.now() + SESSION_DAYS * 86400000 };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = await sign(body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expectedSig = await sign(body);
  if (sig.length !== expectedSig.length || sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 86400;
