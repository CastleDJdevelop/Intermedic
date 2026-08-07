import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { requireRole } from "@/lib/authz";
import type { UserRole } from "@/lib/types";

export async function GET() {
  const db = await getDB();
  // Nunca se expone passwordHash al cliente, ni siquiera a un usuario autenticado.
  const safeUsers = db.users.map(({ passwordHash, ...safe }) => safe);
  return NextResponse.json(safeUsers);
}

/** Crear usuario. Solo Administrador. */
export async function POST(req: Request) {
  const auth = await requireRole(["Administrador"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const db = await getDB();

  // Validaciones
  if (!body.username || typeof body.username !== "string") {
    return NextResponse.json({ error: "Username requerido y debe ser texto" }, { status: 400 });
  }
  if (!body.password || typeof body.password !== "string") {
    return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });
  }
  if (body.password.length < 8) {
    return NextResponse.json({ error: "Contraseña debe tener mínimo 8 caracteres" }, { status: 400 });
  }
  if (!body.role || !["Administrador", "Vendedor"].includes(body.role)) {
    return NextResponse.json({ error: "Rol debe ser Administrador o Vendedor" }, { status: 400 });
  }

  // Username único
  if (db.users.some((u) => u.username === body.username)) {
    return NextResponse.json({ error: `Username "${body.username}" ya existe` }, { status: 400 });
  }

  // Crear usuario
  const newUser = {
    id: `u_${Date.now()}`,
    username: body.username,
    name: body.name || body.username,
    role: body.role as UserRole,
    passwordHash: hashPassword(body.password),
  };

  db.users.push(newUser);
  await saveDB(db);

  // Respuesta NUNCA incluye passwordHash
  const { passwordHash, ...safeUser } = newUser;
  return NextResponse.json(safeUser, { status: 201 });
}
