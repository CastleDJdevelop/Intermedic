import fs from "fs";
import path from "path";
import type {
  DB, Product, Company, Contact, Lead, Quote, QuoteItem, Deal, DealStage,
  Movement, Warehouse, Task, TaskType, TaskPriority,
} from "./types";
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
  /** Por defecto "Sitio web" (comportamiento original, intacto). El CRM puede registrar un lead manual con otro origen. */
  source?: Lead["source"];
  rep?: string | null;
}): { lead: Lead; quote: Quote | null } {
  const db = getDB();

  const lead: Lead = {
    id: newId("lead"),
    companyName: input.companyName,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    source: input.source ?? "Sitio web",
    status: "Nuevo",
    rep: input.rep ?? null,
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

  const quote = deal.quoteId ? db.quotes.find((q) => q.id === deal.quoteId) : undefined;

  // Validación de stock — ANTES de tocar deal/quote/products/movements.
  // Si cualquier línea no alcanza, no se modifica nada (ver saveDB() al final:
  // solo se llama una vez, después de que todas las líneas ya se validaron).
  if (quote) {
    const shortages: string[] = [];
    for (const item of quote.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) continue; // producto inexistente: se ignora, igual que antes
      const available = product.warehouses[warehouse] ?? 0;
      if (available < item.qty) {
        shortages.push(
          `${product.name} (SKU ${product.sku}): solicitado ${item.qty}, disponible ${available} en "${warehouse}"`
        );
      }
    }
    if (shortages.length > 0) {
      // Una sola línea (sin \n) para que el mensaje se muestre correctamente
      // en la UI existente del CRM sin tener que modificarla.
      throw new Error(`Stock insuficiente en "${warehouse}" para completar la venta: ${shortages.join(" · ")}`);
    }
  }

  // A partir de aquí toda la Quote (si existe) ya está validada — es seguro mutar.
  deal.stage = "Ganado";
  const createdMovements: Movement[] = [];

  if (quote) {
    quote.status = "Aprobada";
    for (const item of quote.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) continue;
      // Ya se validó arriba que hay suficiente — no se usa Math.max(0, ...)
      // para no enmascarar un faltante real.
      product.warehouses[warehouse] = (product.warehouses[warehouse] ?? 0) - item.qty;

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

const WAREHOUSE_NAMES: Warehouse[] = ["Bodega Central", "Sucursal Zona 10", "Sucursal Quetzaltenango", "Sucursal Escuintla"];
const MOVEMENT_TYPES: Movement["type"][] = ["Entrada", "Salida", "Transferencia", "Ajuste"];

/**
 * Registra un movimiento y actualiza `product.warehouses` en el mismo paso.
 * Toda la validación de negocio vive aquí (no en la ruta API ni en la UI),
 * siguiendo el mismo patrón que markDealWon(): se valida TODO antes de mutar
 * nada, y saveDB() se llama una sola vez al final — así un movimiento nunca
 * queda a medias ni descuenta stock que en realidad no existía (ya no se usa
 * Math.max(0, ...) para enmascarar un faltante).
 */
export function applyMovement(m: Omit<Movement, "id">): Movement {
  const db = getDB();
  const product = db.products.find((p) => p.id === m.productId);
  if (!product) throw new Error("Producto no encontrado");
  if (!MOVEMENT_TYPES.includes(m.type)) throw new Error("Tipo de movimiento inválido");

  const qty = Math.abs(m.qty);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("La cantidad debe ser un número mayor a 0");

  const isEntradaLike = m.type === "Entrada" || (m.type === "Ajuste" && m.qty > 0);
  const isSalidaLike = m.type === "Salida" || (m.type === "Ajuste" && m.qty < 0);

  if (isEntradaLike) {
    if (!m.to) throw new Error(`${m.type} requiere una bodega destino`);
    if (!WAREHOUSE_NAMES.includes(m.to)) throw new Error(`Bodega destino inválida: "${m.to}"`);
  } else if (isSalidaLike) {
    if (!m.from) throw new Error(`${m.type} requiere una bodega de origen`);
    if (!WAREHOUSE_NAMES.includes(m.from)) throw new Error(`Bodega origen inválida: "${m.from}"`);
    const available = product.warehouses[m.from] ?? 0;
    if (available < qty) throw new Error(`Stock insuficiente en "${m.from}": disponible ${available}, solicitado ${qty}`);
  } else if (m.type === "Transferencia") {
    if (!m.from) throw new Error("La transferencia requiere una bodega de origen");
    if (!m.to) throw new Error("La transferencia requiere una bodega de destino");
    if (!WAREHOUSE_NAMES.includes(m.from)) throw new Error(`Bodega origen inválida: "${m.from}"`);
    if (!WAREHOUSE_NAMES.includes(m.to)) throw new Error(`Bodega destino inválida: "${m.to}"`);
    if (m.from === m.to) throw new Error("El origen y el destino de una transferencia deben ser distintos");
    const available = product.warehouses[m.from] ?? 0;
    if (available < qty) throw new Error(`Stock insuficiente en "${m.from}": disponible ${available}, solicitado ${qty}`);
  }

  // A partir de aquí el movimiento ya está completamente validado.
  if (isEntradaLike) {
    const oldTotal = totalStock(product);
    const cost = m.cost ?? product.costProm;
    product.costProm = oldTotal + qty === 0 ? cost : (oldTotal * product.costProm + qty * cost) / (oldTotal + qty);
    if (m.cost) product.ultimoCosto = cost;
    product.warehouses[m.to!] = (product.warehouses[m.to!] ?? 0) + qty;
  } else if (isSalidaLike) {
    product.warehouses[m.from!] = (product.warehouses[m.from!] ?? 0) - qty;
  } else if (m.type === "Transferencia") {
    product.warehouses[m.from!] = (product.warehouses[m.from!] ?? 0) - qty;
    product.warehouses[m.to!] = (product.warehouses[m.to!] ?? 0) + qty;
  }

  const movement: Movement = { ...m, id: newId("mov") };
  db.movements.push(movement);
  saveDB(db);
  return movement;
}

/**
 * Edita únicamente los campos comerciales del producto que Inventario debe
 * poder corregir a mano (precio, costo, mínimos/máximos) — no toca
 * `warehouses` (eso solo lo cambia applyMovement) ni crea un movimiento.
 */
export function updateProduct(id: string, patch: {
  price?: number | null;
  costProm?: number;
  stockMin?: number;
  stockMax?: number;
  published?: boolean;
}): Product {
  const db = getDB();
  const product = db.products.find((p) => p.id === id);
  if (!product) throw new Error("Producto no encontrado");

  if (patch.published !== undefined) {
    if (typeof patch.published !== "boolean") {
      throw new Error("published debe ser un valor booleano");
    }
    product.published = patch.published;
  }
  if (patch.price !== undefined) {
    if (patch.price !== null && (typeof patch.price !== "number" || !Number.isFinite(patch.price) || patch.price < 0)) {
      throw new Error("El precio debe ser un número mayor o igual a 0");
    }
    product.price = patch.price;
  }
  if (patch.costProm !== undefined) {
    if (typeof patch.costProm !== "number" || !Number.isFinite(patch.costProm) || patch.costProm < 0) {
      throw new Error("El costo promedio debe ser un número mayor o igual a 0");
    }
    product.costProm = patch.costProm;
  }
  if (patch.stockMin !== undefined) {
    if (typeof patch.stockMin !== "number" || !Number.isFinite(patch.stockMin) || patch.stockMin < 0) {
      throw new Error("El stock mínimo debe ser un número mayor o igual a 0");
    }
    product.stockMin = patch.stockMin;
  }
  if (patch.stockMax !== undefined) {
    if (typeof patch.stockMax !== "number" || !Number.isFinite(patch.stockMax) || patch.stockMax < 0) {
      throw new Error("El stock máximo debe ser un número mayor o igual a 0");
    }
    product.stockMax = patch.stockMax;
  }
  if (product.stockMax < product.stockMin) {
    throw new Error("El stock máximo no puede ser menor que el stock mínimo");
  }

  saveDB(db);
  return product;
}

/* =========================================================================
   COMPANIES
   ========================================================================= */
export function createCompany(input: { name: string; sector: string; city: string; rep: string }): Company {
  const db = getDB();
  const company: Company = { id: newId("comp"), name: input.name, sector: input.sector, city: input.city, rep: input.rep };
  db.companies.push(company);
  saveDB(db);
  return company;
}

export function updateCompany(id: string, patch: Partial<Omit<Company, "id">>): Company {
  const db = getDB();
  const company = db.companies.find((c) => c.id === id);
  if (!company) throw new Error("Empresa no encontrada");
  Object.assign(company, patch);
  saveDB(db);
  return company;
}

/* =========================================================================
   CONTACTS
   ========================================================================= */
export function createContact(input: { name: string; role: string; companyId: string; email: string; phone: string }): Contact {
  const db = getDB();
  const company = db.companies.find((c) => c.id === input.companyId);
  if (!company) throw new Error("Empresa no encontrada");
  const contact: Contact = {
    id: newId("ct"),
    name: input.name,
    role: input.role,
    companyId: input.companyId,
    email: input.email,
    phone: input.phone,
    lastContact: new Date().toISOString().slice(0, 10),
    status: "Activo",
  };
  db.contacts.push(contact);
  saveDB(db);
  return contact;
}

export function updateContact(id: string, patch: Partial<Omit<Contact, "id">>): Contact {
  const db = getDB();
  const contact = db.contacts.find((c) => c.id === id);
  if (!contact) throw new Error("Contacto no encontrado");
  Object.assign(contact, patch);
  saveDB(db);
  return contact;
}

/* =========================================================================
   QUOTES — crear cotización desde el CRM
   A diferencia de createLeadFromQuoteRequest (Sitio, anónimo), esta función
   recibe companyId/contactId reales y resuelve el precio de cada línea desde
   el producto real si no se especifica un unitPrice explícito.
   ========================================================================= */
export function createQuote(input: {
  companyId: string;
  contactId?: string;
  items: { productId: string; qty: number; unitPrice?: number }[];
  rep?: string | null;
  leadId?: string;
  /** Si viene de un Deal del Pipeline, vincula deal.quoteId → quote.id en la misma transacción (requisito de CRM → Inventario). */
  dealId?: string;
}): Quote {
  const db = getDB();
  const company = db.companies.find((c) => c.id === input.companyId);
  if (!company) throw new Error("Empresa no encontrada");
  const contact = input.contactId ? db.contacts.find((c) => c.id === input.contactId) : undefined;

  if (input.items.length === 0) throw new Error("La cotización necesita al menos un producto");

  const items: QuoteItem[] = input.items.map((it) => {
    const product = db.products.find((p) => p.id === it.productId);
    if (!product) throw new Error(`Producto no encontrado: ${it.productId}`);
    const unitPrice = it.unitPrice ?? product.price ?? product.costProm * 1.3;
    return { productId: it.productId, qty: it.qty, unitPrice };
  });
  const total = Math.round(items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0));

  const quote: Quote = {
    id: newId("quote"),
    companyName: company.name,
    contactName: contact?.name ?? "—",
    companyId: company.id,
    contactId: contact?.id,
    items,
    total,
    status: "Borrador",
    rep: input.rep ?? null,
    createdAt: new Date().toISOString().slice(0, 10),
    leadId: input.leadId,
  };
  db.quotes.push(quote);

  if (input.dealId) {
    const deal = db.deals.find((d) => d.id === input.dealId);
    if (!deal) throw new Error("Negocio no encontrado para vincular la cotización");
    deal.quoteId = quote.id;
  }

  saveDB(db);
  return quote;
}

/* =========================================================================
   DEALS — mover de etapa en el Kanban
   markDealWon() sigue siendo la única función que mueve un negocio a
   "Ganado" (y descuenta inventario). Esta función es para las otras 5
   etapas del Kanban y nunca ejecuta ese flujo de negocio.
   ========================================================================= */
export function updateDealStage(dealId: string, stage: DealStage): Deal {
  if (stage === "Ganado") {
    throw new Error('Para mover un negocio a "Ganado" use markDealWon(), que también descuenta inventario');
  }
  const db = getDB();
  const deal = db.deals.find((d) => d.id === dealId);
  if (!deal) throw new Error("Negocio no encontrado");
  deal.stage = stage;
  saveDB(db);
  return deal;
}

/* =========================================================================
   LEADS — convertir en Company + Contact + Deal
   Usa relaciones reales (companyId/contactId/leadId) en vez de texto suelto.
   Es idempotente: un lead con converted=true no se puede volver a convertir.
   ========================================================================= */
export function convertLead(leadId: string): { lead: Lead; company: Company; contact: Contact | null; deal: Deal } {
  const db = getDB();
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) throw new Error("Lead no encontrado");
  if (lead.converted) throw new Error("Este lead ya fue convertido");

  let company = db.companies.find((c) => c.name === lead.companyName);
  if (!company) {
    company = { id: newId("comp"), name: lead.companyName, sector: "Prospecto", city: "", rep: lead.rep ?? "" };
    db.companies.push(company);
  }

  let contact: Contact | null = null;
  if (lead.contactName) {
    contact = db.contacts.find((c) => c.name === lead.contactName && c.companyId === company!.id) ?? null;
    if (!contact) {
      contact = {
        id: newId("ct"),
        name: lead.contactName,
        role: "Contacto principal",
        companyId: company.id,
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        lastContact: lead.createdAt,
        status: "Activo",
      };
      db.contacts.push(contact);
    }
  }

  const deal: Deal = {
    id: newId("deal"),
    title: `Nuevo negocio — ${lead.companyName}`,
    companyId: company.id,
    contactId: contact?.id,
    value: 0,
    stage: "Prospección",
    rep: lead.rep ?? "",
    closeDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    leadId: lead.id,
  };
  db.deals.push(deal);

  lead.converted = true;
  if (lead.status === "Nuevo" || lead.status === "Contactado") lead.status = "Calificado";

  saveDB(db);
  return { lead, company, contact, deal };
}

/* =========================================================================
   TASKS
   ========================================================================= */
export function createTask(input: { title: string; type: TaskType; companyId?: string; due: string; priority: TaskPriority; rep: string }): Task {
  const db = getDB();
  const task: Task = {
    id: newId("task"),
    title: input.title,
    type: input.type,
    companyId: input.companyId,
    due: input.due,
    priority: input.priority,
    rep: input.rep,
    done: false,
  };
  db.tasks.push(task);
  saveDB(db);
  return task;
}

export function updateTask(id: string, patch: Partial<Omit<Task, "id">>): Task {
  const db = getDB();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) throw new Error("Tarea no encontrada");
  Object.assign(task, patch);
  saveDB(db);
  return task;
}

/* =========================================================================
   LEADS — actualizar (por ahora solo el vendedor asignado)
   ========================================================================= */
export function updateLead(id: string, patch: Partial<Pick<Lead, "rep">>): Lead {
  const db = getDB();
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) throw new Error("Lead no encontrado");
  Object.assign(lead, patch);
  saveDB(db);
  return lead;
}

export function toggleTaskDone(id: string): Task {
  const db = getDB();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) throw new Error("Tarea no encontrada");
  task.done = !task.done;
  saveDB(db);
  return task;
}
