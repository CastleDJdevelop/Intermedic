import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./auth";
import type { UserRole } from "./types";

/**
 * Helper para proteger Route Handlers (app/api/**). A diferencia de
 * middleware.ts (que protege páginas con un redirect), aquí interesa
 * devolver 401/403 en JSON, que es lo que espera el frontend (fetch).
 *
 * Uso:
 *   const auth = await requireRole(["Administrador"]);
 *   if (auth instanceof NextResponse) return auth; // 401 o 403 ya armado
 *   const session = auth; // SessionPayload, ya autorizado
 */
export async function requireRole(allowed: UserRole[]): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "No autorizado para esta acción" }, { status: 403 });
  }
  return session;
}

export async function requireSession(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return session;
}
