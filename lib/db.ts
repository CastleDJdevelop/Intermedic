import fs from "fs";
import path from "path";
import type { DB, Product, Lead, Quote, Deal, Movement, Warehouse } from "./types";
import { totalStock, stockStatus, type StockStatus } from "./stock";
export { totalStock, stockStatus, type StockStatus };

/**
 * Almacenamiento basado en un archivo JSON. Sirve perfectamente para desarrollo
 * y para que Claude Code continúe construyendo sobre una base funcional real
 * (a diferencia de los prototipos anteriores, que solo vivían en memoria del navegador).
 *
 * Para producción, reemplazar por Prisma + PostgreSQL:
 *   - Cada función de este archivo (getDB, saveDB, createLeadFromQuoteRequest, etc.)
 *     se convierte en una función que usa `prisma.<modelo>.findMany/create/update`.
 *   - Las rutas en app/api/** no necesitan cambiar su forma (mismo request/response),
 *     solo lo que hay dentro de cada handler.
 */

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export function getDB(): DB {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DB;
}

export function saveDB(db: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}


/* =========================================================================
   CONEXIÓN 1 — Sitio web → CRM
   Cuando alguien solicita una cotización desde el catálogo público, se crea
   un Lead y una Cotización en borrador en el CRM automáticamente.
   ========================================================================= */
export function createLeadFromQuoteRequest(input: {
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  productId?: string;
  qty?: number;
  note?: string;
}): { lead: Lead; quote: Quote | null } {
  const db = getDB();

  const lead: Lead = {
    id: newId("lead"),
    companyName: input.companyName,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    source: "Sitio web",
    status: "Nuevo",
    rep: null,
    createdAt: new Date().toISOString().slice(0, 10),
    productId: input.productId,
    note: input.note,
  };

  let quote: Quote | null = null;
  if (input.productId) {
    const product = db.products.find((p) => p.id === input.productId);
    if (product) {
      const qty = input.qty && input.qty > 0 ? input.qty : 1;
      const unitPrice = product.price ?? product.costProm * 1.3; // margen estimado si no hay precio público
      quote = {
        id: newId("quote"),
        companyName: input.companyName,
        contactName: input.contactName,
        items: [{ productId: product.id, qty, unitPrice }],
        total: Math.round(unitPrice * qty),
        status: "Borrador",
        rep: null,
        createdAt: lead.createdAt,
        leadId: lead.id,
      };
      db.quotes.push(quote);
    }
  }

  db.leads.push(lead);
  saveDB(db);
  return { lead, quote };
}

/* =========================================================================
   CONEXIÓN 2 — CRM → Inventario
   Al marcar un negocio (Deal) como "Ganado", se generan automáticamente
   movimientos de Salida por cada producto de su cotización asociada,
   descontando el stock real en Inventario.
   ========================================================================= */
export function markDealWon(dealId: string, warehouse: Warehouse = "Bodega Central"): {
  deal: Deal;
  movements: Movement[];
} {
  const db = getDB();
  const deal = db.deals.find((d) => d.id === dealId);
  if (!deal) throw new Error("Negocio no encontrado");

  deal.stage = "Ganado";
  const createdMovements: Movement[] = [];

  const quote = deal.quoteId ? db.quotes.find((q) => q.id === deal.quoteId) : undefined;
  if (quote) {
    quote.status = "Aprobada";
    for (const item of quote.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) continue;
      const available = product.warehouses[warehouse] ?? 0;
      product.warehouses[warehouse] = Math.max(0, available - item.qty);

      const movement: Movement = {
        id: newId("mov"),
        date: new Date().toISOString().slice(0, 10),
        type: "Salida",
        productId: product.id,
        qty: -item.qty,
        from: warehouse,
        to: null,
        cost: null,
        ref: `Venta — ${deal.title}`,
        user: deal.rep,
      };
      db.movements.push(movement);
      createdMovements.push(movement);
    }
  }

  saveDB(db);
  return { deal, movements: createdMovements };
}

/* =========================================================================
   CONEXIÓN 3 — Inventario → Sitio web / CRM
   El stock que ve el catálogo público y el que usa el CRM para prometer
   fechas de entrega es el MISMO campo `warehouses` que edita Inventario.
   No hay sincronización manual porque no hay tres copias del dato.
   ========================================================================= */
export function getPublicCatalog(): Product[] {
  const db = getDB();
  return db.products;
}

export function applyMovement(m: Omit<Movement, "id">): Movement {
  const db = getDB();
  const product = db.products.find((p) => p.id === m.productId);
  if (!product) throw new Error("Producto no encontrado");

  if (m.type === "Entrada" || (m.type === "Ajuste" && m.qty > 0)) {
    const qty = Math.abs(m.qty);
    const oldTotal = totalStock(product);
    const cost = m.cost ?? product.costProm;
    product.costProm = oldTotal + qty === 0 ? cost : (oldTotal * product.costProm + qty * cost) / (oldTotal + qty);
    if (m.cost) product.ultimoCosto = cost;
    if (m.to) product.warehouses[m.to] = (product.warehouses[m.to] ?? 0) + qty;
  } else if (m.type === "Salida" || (m.type === "Ajuste" && m.qty < 0)) {
    const qty = Math.abs(m.qty);
    if (m.from) product.warehouses[m.from] = Math.max(0, (product.warehouses[m.from] ?? 0) - qty);
  } else if (m.type === "Transferencia") {
    const qty = Math.abs(m.qty);
    if (m.from) product.warehouses[m.from] = Math.max(0, (product.warehouses[m.from] ?? 0) - qty);
    if (m.to) product.warehouses[m.to] = (product.warehouses[m.to] ?? 0) + qty;
  }

  const movement: Movement = { ...m, id: newId("mov") };
  db.movements.push(movement);
  saveDB(db);
  return movement;
}
