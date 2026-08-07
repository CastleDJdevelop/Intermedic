import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";
import { requireRole } from "@/lib/authz";

export async function GET() {
  const db = await getDB();
  return NextResponse.json(db.products);
}

/** Solo Administrador puede crear productos (edita catálogo/costos/stock). */
export async function POST(req: Request) {
  const auth = await requireRole(["Administrador"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const db = await getDB();

  // Validación de campos requeridos
  if (!body.sku || typeof body.sku !== "string") {
    return NextResponse.json({ error: "SKU es requerido y debe ser texto" }, { status: 400 });
  }
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
  }
  if (!body.category || typeof body.category !== "string") {
    return NextResponse.json({ error: "Categoría es requerida" }, { status: 400 });
  }

  // Validar que los números sean números
  if (body.costProm && typeof body.costProm !== "number") {
    return NextResponse.json({ error: "Costo promedio debe ser un número" }, { status: 400 });
  }
  if (body.ultimoCosto && typeof body.ultimoCosto !== "number") {
    return NextResponse.json({ error: "Último costo debe ser un número" }, { status: 400 });
  }
  if (body.stockMin && typeof body.stockMin !== "number") {
    return NextResponse.json({ error: "Stock mínimo debe ser un número" }, { status: 400 });
  }
  if (body.stockMax && typeof body.stockMax !== "number") {
    return NextResponse.json({ error: "Stock máximo debe ser un número" }, { status: 400 });
  }
  if (body.price !== null && body.price !== undefined && typeof body.price !== "number") {
    return NextResponse.json({ error: "Precio debe ser un número o vacío" }, { status: 400 });
  }

  // Validar SKU único
  if (db.products.some((p) => p.sku === body.sku)) {
    return NextResponse.json({ error: `SKU "${body.sku}" ya existe` }, { status: 400 });
  }

  // Crear producto con warehouses vacío (0 en todas las bodegas)
  const id = `p_${Date.now()}`;
  const newProduct = {
    id,
    sku: body.sku,
    barcode: body.barcode || "",
    name: body.name,
    category: body.category,
    brand: body.brand || "",
    supplier: body.supplier || "",
    unit: body.unit || "unidad",
    price: body.price ?? null,
    costProm: body.costProm ?? 0,
    ultimoCosto: body.ultimoCosto ?? 0,
    stockMin: body.stockMin ?? 0,
    stockMax: body.stockMax ?? 0,
    serialized: body.serialized ?? false,
    warehouses: {} as Partial<Record<import("@/lib/types").Warehouse, number>>,
    badge: body.badge ?? null,
    usage: body.usage ?? undefined,
    description: body.description ?? undefined,
    delivery: body.delivery ?? undefined,
    published: body.published ?? false,
  };

  db.products.push(newProduct);
  await saveDB(db);
  return NextResponse.json(newProduct, { status: 201 });
}
