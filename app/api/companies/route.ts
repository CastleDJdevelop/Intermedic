import { NextResponse } from "next/server";
import { getDB, createCompany } from "@/lib/db";

export async function GET() {
  const db = getDB();
  return NextResponse.json(db.companies);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "name es requerido" }, { status: 400 });
  }
  const company = createCompany({
    name: body.name,
    sector: body.sector ?? "",
    city: body.city ?? "",
    rep: body.rep ?? "",
  });
  return NextResponse.json(company, { status: 201 });
}
