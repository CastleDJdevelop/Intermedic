import { NextResponse } from "next/server";
import { updateProduct } from "@/lib/db";
import { requireRole } from "@/lib/authz";

/**
 * Edita únicamente precio, costo promedio, mínimos/máximos de stock y
 * `published` — los mismos campos que ya existían en Product. No toca
 * `warehouses` (eso solo lo cambia POST /api/movements) ni crea
 * lotes/series/proveedores. `published` es la única fuente de verdad de
 * publicación; el Sitio sigue leyéndola igual (`p.published !== false`).
 * Solo Administrador puede editar precio/costo/stock de un producto.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["Administrador"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const product = await updateProduct(id, {
      price: body.price,
      costProm: body.costProm,
      stockMin: body.stockMin,
      stockMax: body.stockMax,
      published: body.published,
    });
    return NextResponse.json(product);
  } catch (e: any) {
    const status = e.message === "Producto no encontrado" ? 404 : 409;
    return NextResponse.json({ error: e.message }, { status });
  }
}
