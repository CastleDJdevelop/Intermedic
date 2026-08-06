import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { updateCompany } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const company = await updateCompany(id, {
      name: body.name,
      sector: body.sector,
      city: body.city,
      rep: body.rep,
    });
    return NextResponse.json(company);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
