import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { createInvoice } from "@/lib/db";
import { requireSession } from "@/lib/authz";

export async function GET() {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const db = await getDB();
  return NextResponse.json(db.invoices);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  if (!body.companyId || !body.companyName || !body.contactName || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "companyId, companyName, contactName e items son requeridos" },
      { status: 400 }
    );
  }

  try {
    const invoice = await createInvoice({
      dealId: body.dealId,
      reservationId: body.reservationId,
      companyId: body.companyId,
      contactId: body.contactId,
      companyName: body.companyName,
      contactName: body.contactName,
      items: body.items,
      rep: auth.name,
      notes: body.notes,
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 409 });
  }
}
