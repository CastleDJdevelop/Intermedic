import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  if (!username || !password) {
    return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 });
  }

  const db = await getDB();
  const user = db.users.find((u) => u.username === username);

  // Mismo mensaje de error exista o no el usuario, para no filtrar cuáles
  // usernames son válidos (evita enumeración de cuentas).
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  await setSessionCookie({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ id: user.id, username: user.username, name: user.name, role: user.role });
}
