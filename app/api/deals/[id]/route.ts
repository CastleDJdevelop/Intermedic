import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { updateDealStage } from "@/lib/db";
import type { DealStage } from "@/lib/types";

const VALID_STAGES: DealStage[] = ["Prospección", "Calificación", "Propuesta enviada", "Negociación", "Ganado", "Perdido"];

/**
 * Mover un negocio entre etapas del Kanban (excepto a "Ganado", que sigue
 * siendo exclusivo de POST /api/deals/[id]/win porque ese endpoint también
 * descuenta inventario y aprueba la cotización asociada).
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.stage || !VALID_STAGES.includes(body.stage)) {
    return NextResponse.json({ error: "stage inválido" }, { status: 400 });
  }
  if (body.stage === "Ganado") {
    return NextResponse.json({ error: 'Use POST /api/deals/' + id + '/win para mover un negocio a "Ganado"' }, { status: 400 });
  }
  try {
    const deal = await updateDealStage(id, body.stage);
    return NextResponse.json(deal);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
