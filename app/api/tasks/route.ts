import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { getDB, createTask } from "@/lib/db";

export async function GET() {
  const db = await getDB();
  return NextResponse.json(db.tasks);
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  if (!body.title || !body.type || !body.due || !body.priority || !body.rep) {
    return NextResponse.json({ error: "title, type, due, priority y rep son requeridos" }, { status: 400 });
  }
  const task = await createTask({
    title: body.title,
    type: body.type,
    companyId: body.companyId,
    due: body.due,
    priority: body.priority,
    rep: body.rep,
  });
  return NextResponse.json(task, { status: 201 });
}
