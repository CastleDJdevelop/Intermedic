import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { updateLead } from "@/lib/db";

/**
 * Por ahora solo permite reasignar el vendedor (rep) de un lead — es lo que
 * necesita la pantalla de Leads del CRM. POST /api/leads (Sitio → CRM) y
 * POST /api/leads/[id]/convert no se tocaron.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const lead = await updateLead(id, { rep: body.rep ?? null });
    return NextResponse.json(lead);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
