import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { convertLead } from "@/lib/db";

/**
 * Convierte un Lead en Company + Contact + Deal (etapa "Prospección").
 * Idempotente: si el lead ya fue convertido, devuelve 409 sin duplicar nada.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const result = await convertLead(id);
    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    const status = e.message === "Lead no encontrado" ? 404 : 409;
    return NextResponse.json({ error: e.message }, { status });
  }
}
