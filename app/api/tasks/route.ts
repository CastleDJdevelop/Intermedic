import { NextResponse } from "next/server";
import { getDB, createTask } from "@/lib/db";

export async function GET() {
  const db = getDB();
  return NextResponse.json(db.tasks);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.title || !body.type || !body.due || !body.priority || !body.rep) {
    return NextResponse.json({ error: "title, type, due, priority y rep son requeridos" }, { status: 400 });
  }
  const task = createTask({
    title: body.title,
    type: body.type,
    companyId: body.companyId,
    due: body.due,
    priority: body.priority,
    rep: body.rep,
  });
  return NextResponse.json(task, { status: 201 });
}
