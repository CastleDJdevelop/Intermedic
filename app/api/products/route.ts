import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";

export async function GET() {
  const db = getDB();
  return NextResponse.json(db.products);
}

/** Solo debería llamarse desde Inventario (rol Administrador) — el chequeo de
 *  rol real se hace en el backend cuando se conecte auth (ver docs/ROADMAP.md). */
export async function POST(req: Request) {
  const body = await req.json();
  const db = getDB();
  const id = `p_${Date.now()}`;
  db.products.push({ id, ...body });
  saveDB(db);
  return NextResponse.json({ id }, { status: 201 });
}
