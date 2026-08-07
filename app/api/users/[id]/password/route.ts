import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { requireRole } from "@/lib/authz";

/** Cambiar contraseña de usuario. Solo Administrador. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireRole(["Administrador"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const db = await getDB();

  // Validar contraseña
  if (!body.newPassword || typeof body.newPassword !== "string") {
    return NextResponse.json({ error: "Nueva contraseña requerida" }, { status: 400 });
  }
  if (body.newPassword.length < 8) {
    return NextResponse.json(
      { error: "Contraseña debe tener mínimo 8 caracteres" },
      { status: 400 }
    );
  }

  // Encontrar usuario
  const user = db.users.find((u) => u.id === id);
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // Actualizar contraseña
  user.passwordHash = hashPassword(body.newPassword);
  await saveDB(db);

  // Respuesta de éxito — NUNCA incluye passwordHash
  const { passwordHash, ...safeUser } = user;
  return NextResponse.json({ success: true, user: safeUser });
}
