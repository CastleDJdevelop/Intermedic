import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { getDB, createQuote } from "@/lib/db";

export async function GET() {
  const db = await getDB();
  return NextResponse.json(db.quotes);
}

/**
 * Cotización creada desde el CRM (a diferencia de POST /api/leads, que crea
 * la cotización anónima del flujo Sitio → CRM). Requiere companyId real y
 * al menos un producto real — nunca texto suelto.
 */
export async function POST(req: Request) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  if (!body.companyId || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "companyId e items[] son requeridos" }, { status: 400 });
  }
  try {
    const quote = await createQuote({
      companyId: body.companyId,
      contactId: body.contactId,
      items: body.items,
      rep: body.rep ?? null,
      leadId: body.leadId,
      dealId: body.dealId,
    });
    return NextResponse.json(quote, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
