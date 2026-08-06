import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { updateContact } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const contact = await updateContact(id, {
      name: body.name,
      role: body.role,
      companyId: body.companyId,
      email: body.email,
      phone: body.phone,
      lastContact: body.lastContact,
      status: body.status,
    });
    return NextResponse.json(contact);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
