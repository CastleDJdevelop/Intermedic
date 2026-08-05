import { NextResponse } from "next/server";
import { updateTask } from "@/lib/db";

/**
 * Patch genérico: el cliente envía solo los campos que cambian, incluyendo
 * { done: true|false } para marcar/desmarcar como completada.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const task = updateTask(id, body);
    return NextResponse.json(task);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
