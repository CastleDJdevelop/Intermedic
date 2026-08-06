import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";

export async function GET() {
  const db = await getDB();
  return NextResponse.json(db.products);
}

/** Solo Administrador puede crear productos (edita catálogo/costos/stock). */
export async function POST(req: Request) {
  const auth = await requireRole(["Administrador"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const db = await getDB();
  const id = `p_${Date.now()}`;
  db.products.push({ id, ...body });
  await saveDB(db);
  return NextResponse.json({ id }, { status: 201 });
}
