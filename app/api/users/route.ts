import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  const db = await getDB();
  // Nunca se expone passwordHash al cliente, ni siquiera a un usuario autenticado.
  const safeUsers = db.users.map(({ passwordHash, ...safe }) => safe);
  return NextResponse.json(safeUsers);
}
