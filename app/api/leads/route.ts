import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { createLeadFromQuoteRequest } from "@/lib/db";

export async function GET() {
  const db = getDB();
  return NextResponse.json(db.leads);
}

/**
 * Este endpoint es la CONEXIÓN Sitio Web → CRM.
 * El formulario "Solicitar cotización" del catálogo público llama a este POST.
 */
export async function POST(req: Request) {
  const body = await req.json();
  if (!body.companyName || !body.contactName) {
    return NextResponse.json({ error: "companyName y contactName son requeridos" }, { status: 400 });
  }
  const { lead, quote } = createLeadFromQuoteRequest(body);
  return NextResponse.json({ lead, quote }, { status: 201 });
}
