import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { markDealWon } from "@/lib/db";

/**
 * Esta es la CONEXIÓN CRM → Inventario.
 * Al arrastrar un negocio a "Ganado" en el Pipeline del CRM, el frontend
 * llama a este endpoint, que genera las Salidas de inventario correspondientes
 * a los productos de la cotización asociada.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const result = await markDealWon(id, body.warehouse ?? "Bodega Central");
    return NextResponse.json(result);
  } catch (e: any) {
    // 404 solo si el negocio no existe; cualquier otro rechazo (p.ej. stock
    // insuficiente) es un conflicto de negocio, no un "no encontrado".
    const status = e.message === "Negocio no encontrado" ? 404 : 409;
    return NextResponse.json({ error: e.message }, { status });
  }
}
