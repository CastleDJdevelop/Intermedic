import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { createReservation } from "@/lib/db";
import { requireSession } from "@/lib/authz";

export async function GET() {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const db = await getDB();
  return NextResponse.json(db.reservations);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  if (!body.dealId || !body.companyId || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "dealId, companyId e items son requeridos" },
      { status: 400 }
    );
  }

  try {
    const reservation = await createReservation({
      dealId: body.dealId,
      companyId: body.companyId,
      contactId: body.contactId,
      items: body.items,
      rep: auth.name,
      notes: body.notes,
    });
    return NextResponse.json(reservation, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 409 });
  }
}
