import { NextResponse } from "next/server";
import { updateReservationStatus, cancelReservation } from "@/lib/db";
import { requireSession } from "@/lib/authz";
import type { ReservationStatus } from "@/lib/types";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.status) {
    return NextResponse.json({ error: "status es requerido" }, { status: 400 });
  }

  try {
    const reservation = await updateReservationStatus(id, body.status as ReservationStatus);
    return NextResponse.json(reservation);
  } catch (e: any) {
    const status = e.message === "Reservación no encontrada" ? 404 : 409;
    return NextResponse.json({ error: e.message }, { status });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const reservation = await cancelReservation(id);
    return NextResponse.json(reservation);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
