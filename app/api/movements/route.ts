import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { applyMovement } from "@/lib/db";
import { requireRole } from "@/lib/authz";

/** Consultar movimientos/Kardex es exclusivo de Administrador (operación física de inventario). */
export async function GET() {
  const auth = await requireRole(["Administrador"]);
  if (auth instanceof NextResponse) return auth;

  const db = await getDB();
  return NextResponse.json(db.movements);
}

/**
 * Registra un movimiento y actualiza el stock del producto en el mismo paso.
 * En el frontend de Inventario, esto es lo único que necesita llamar el
 * formulario de "Nueva entrada / salida / transferencia / ajuste".
 *
 * Toda la validación de negocio (tipo válido, cantidad > 0, bodega válida,
 * stock suficiente, origen ≠ destino en Transferencia) vive en
 * await applyMovement() — aquí solo se traduce su error a un status HTTP, igual
 * que en /api/deals/[id]/win.
 *
 * Regla de rol: Administrador puede crear cualquier tipo de movimiento.
 * Vendedor solo puede crear movimientos de tipo "Salida" (venta directa),
 * nunca Entrada/Transferencia/Ajuste — esos son operación física exclusiva
 * de Inventario/Administrador.
 */
export async function POST(req: Request) {
  const auth = await requireRole(["Administrador", "Vendedor"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  if (!body.productId || !body.type || typeof body.qty !== "number") {
    return NextResponse.json({ error: "productId, type y qty son requeridos" }, { status: 400 });
  }
  if (auth.role !== "Administrador" && body.type !== "Salida") {
    return NextResponse.json(
      { error: 'Solo Administrador puede registrar movimientos que no sean "Salida"' },
      { status: 403 }
    );
  }
  try {
    const movement = await applyMovement({
      date: body.date ?? new Date().toISOString().slice(0, 10),
      type: body.type,
      productId: body.productId,
      qty: body.qty,
      from: body.from ?? null,
      to: body.to ?? null,
      cost: body.cost ?? null,
      ref: body.ref ?? "",
      user: body.user ?? auth.name,
    });
    return NextResponse.json(movement, { status: 201 });
  } catch (e: any) {
    const status = e.message === "Producto no encontrado" ? 404 : 409;
    return NextResponse.json({ error: e.message }, { status });
  }
}
