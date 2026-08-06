import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { getDB, createContact } from "@/lib/db";

export async function GET() {
  const db = await getDB();
  return NextResponse.json(db.contacts);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  if (!body.name || !body.companyId) {
    return NextResponse.json({ error: "name y companyId son requeridos" }, { status: 400 });
  }
  try {
    const contact = await createContact({
      name: body.name,
      role: body.role ?? "",
      companyId: body.companyId,
      email: body.email ?? "",
      phone: body.phone ?? "",
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
