import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { applyMovement } from "@/lib/db";

export async function GET() {
  const db = getDB();
  return NextResponse.json(db.movements);
}

/**
 * Registra un movimiento y actualiza el stock del producto en el mismo paso.
 * En el frontend de Inventario, esto es lo único que necesita llamar el
 * formulario de "Nueva entrada / salida / transferencia / ajuste".
 *
 * TODO (auth real): validar aquí que si type !== "Salida", el usuario
 * autenticado tenga role === "Administrador" (ver docs/ROADMAP.md, sección Auth).
 */
export async function POST(req: Request) {
  const body = await req.json();
  if (!body.productId || !body.type || typeof body.qty !== "number") {
    return NextResponse.json({ error: "productId, type y qty son requeridos" }, { status: 400 });
  }
  const movement = applyMovement({
    date: body.date ?? new Date().toISOString().slice(0, 10),
    type: body.type,
    productId: body.productId,
    qty: body.qty,
    from: body.from ?? null,
    to: body.to ?? null,
    cost: body.cost ?? null,
    ref: body.ref ?? "",
    user: body.user ?? "—",
  });
  return NextResponse.json(movement, { status: 201 });
}
