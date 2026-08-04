import { NextResponse } from "next/server";
import { markDealWon } from "@/lib/db";

/**
 * Esta es la CONEXIÓN CRM → Inventario.
 * Al arrastrar un negocio a "Ganado" en el Pipeline del CRM, el frontend
 * llama a este endpoint, que genera las Salidas de inventario correspondientes
 * a los productos de la cotización asociada.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const result = markDealWon(id, body.warehouse ?? "Bodega Central");
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
