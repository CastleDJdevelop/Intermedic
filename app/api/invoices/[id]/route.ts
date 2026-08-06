import { NextResponse } from "next/server";
import { updateInvoiceStatus } from "@/lib/db";
import { requireSession } from "@/lib/authz";
import type { InvoiceStatus } from "@/lib/types";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.status) {
    return NextResponse.json({ error: "status es requerido" }, { status: 400 });
  }

  try {
    const invoice = await updateInvoiceStatus(id, body.status as InvoiceStatus);
    return NextResponse.json(invoice);
  } catch (e: any) {
    const status = e.message === "Factura no encontrada" ? 404 : 409;
    return NextResponse.json({ error: e.message }, { status });
  }
}
