import { neon } from "@neondatabase/serverless";
import type {
  DB, Product, Company, Contact, Lead, Quote, QuoteItem, Deal, DealStage,
  Movement, Warehouse, Task, TaskType, TaskPriority, Reservation, ReservationStatus,
  Invoice, InvoiceStatus, AppUser,
} from "./types";
import { totalStock, stockStatus, type StockStatus } from "./stock";
import seedData from "../data/db.json";
export { totalStock, stockStatus, type StockStatus };

/**
 * Almacenamiento en Postgres (Neon, vía la integración de Vercel Marketplace).
 *
 * Decisión de diseño: en vez de modelar cada entidad como su propia tabla
 * relacional (lo que implicaría reescribir ~500 líneas de lógica de negocio
 * y arriesgar bugs nuevos), se guarda el mismo objeto DB completo como UNA
 * fila JSONB en la tabla `app_state`. Esto arregla el problema real y
 * urgente (el filesystem de Vercel es de solo lectura, así que
 * fs.writeFileSync fallaba en producción) sin tocar el 90% de la lógica de
 * negocio de este archivo, que sigue funcionando igual porque opera sobre
 * el mismo objeto `db` en memoria antes de guardarlo.
 *
 * Migrar a tablas relacionales reales (Prisma + un esquema por entidad)
 * sigue siendo un paso recomendable más adelante (ver docs/ROADMAP.md,
 * quedó clasificado como POSTERIOR en la auditoría), pero no es necesario
 * para tener persistencia real y correcta en producción.
 *
 * Requiere la variable de entorno DATABASE_URL (la agrega automáticamente
 * la integración de Neon en Vercel; en local hay que copiarla a .env.local).
 */

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL. Agrega la integración de Neon Postgres en Vercel " +
      "(Storage → Marketplace → Neon), o copia la connection string a .env.local para desarrollo."
    );
  }
  return neon(url);
}

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id INT PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tableReady = true;
}

export async function getDB(): Promise<DB> {
  const sql = getSql();
  await ensureTable();
  const rows = await sql`SELECT data FROM app_state WHERE id = 1`;
  if (rows.length === 0) {
    // Primera ejecución: siembra la base con data/db.json (el mismo dataset
    // de demo que ya se usaba en desarrollo) y la guarda en Postgres.
    await sql`
      INSERT INTO app_state (id, data) VALUES (1, ${JSON.stringify(seedData)}::jsonb)
      ON CONFLICT (id) DO NOTHING
    `;
    return seedData as unknown as DB;
  }
  return rows[0].data as DB;
}

export async function saveDB(db: DB): Promise<void> {
  const sql = getSql();
  await ensureTable();
  await sql`
    INSERT INTO app_state (id, data, updated_at) VALUES (1, ${JSON.stringify(db)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}


/* =========================================================================
   CONEXIÓN 1 — Sitio web → CRM
   Cuando alguien solicita una cotización desde el catálogo público, se crea
   un Lead y una Cotización en borrador en el CRM automáticamente.
   ========================================================================= */
export async function createLeadFromQuoteRequest(input: {
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
}): Promise<{ lead: Lead; quote: Quote | null }> {
  const db = await getDB();

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
  await saveDB(db);
  return { lead, quote };
}

/* =========================================================================
   CONEXIÓN 2 — CRM → Inventario
   Al marcar un negocio (Deal) como "Ganado", se generan automáticamente
   movimientos de Salida por cada producto de su cotización asociada,
   descontando el stock real en Inventario.
   ========================================================================= */
export async function markDealWon(dealId: string, warehouse: Warehouse = "Bodega Central"): Promise<{
  deal: Deal;
  movements: Movement[];
}> {
  const db = await getDB();
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

  await saveDB(db);
  return { deal, movements: createdMovements };
}

/* =========================================================================
   CONEXIÓN 3 — Inventario → Sitio web / CRM
   El stock que ve el catálogo público y el que usa el CRM para prometer
   fechas de entrega es el MISMO campo `warehouses` que edita Inventario.
   No hay sincronización manual porque no hay tres copias del dato.
   ========================================================================= */
export async function getPublicCatalog(): Promise<Product[]> {
  const db = await getDB();
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
export async function applyMovement(m: Omit<Movement, "id">): Promise<Movement> {
  const db = await getDB();
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
  await saveDB(db);
  return movement;
}

/**
 * Edita únicamente los campos comerciales del producto que Inventario debe
 * poder corregir a mano (precio, costo, mínimos/máximos) — no toca
 * `warehouses` (eso solo lo cambia applyMovement) ni crea un movimiento.
 */
export async function updateProduct(id: string, patch: {
  price?: number | null;
  costProm?: number;
  stockMin?: number;
  stockMax?: number;
  published?: boolean;
}): Promise<Product> {
  const db = await getDB();
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

  await saveDB(db);
  return product;
}

/* =========================================================================
   COMPANIES
   ========================================================================= */
export async function createCompany(input: { name: string; sector: string; city: string; rep: string }): Promise<Company> {
  const db = await getDB();
  const company: Company = { id: newId("comp"), name: input.name, sector: input.sector, city: input.city, rep: input.rep };
  db.companies.push(company);
  await saveDB(db);
  return company;
}

export async function updateCompany(id: string, patch: Partial<Omit<Company, "id">>): Promise<Company> {
  const db = await getDB();
  const company = db.companies.find((c) => c.id === id);
  if (!company) throw new Error("Empresa no encontrada");
  Object.assign(company, patch);
  await saveDB(db);
  return company;
}

/* =========================================================================
   CONTACTS
   ========================================================================= */
export async function createContact(input: { name: string; role: string; companyId: string; email: string; phone: string }): Promise<Contact> {
  const db = await getDB();
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
  await saveDB(db);
  return contact;
}

export async function updateContact(id: string, patch: Partial<Omit<Contact, "id">>): Promise<Contact> {
  const db = await getDB();
  const contact = db.contacts.find((c) => c.id === id);
  if (!contact) throw new Error("Contacto no encontrado");
  Object.assign(contact, patch);
  await saveDB(db);
  return contact;
}

/* =========================================================================
   QUOTES — crear cotización desde el CRM
   A diferencia de createLeadFromQuoteRequest (Sitio, anónimo), esta función
   recibe companyId/contactId reales y resuelve el precio de cada línea desde
   el producto real si no se especifica un unitPrice explícito.
   ========================================================================= */
export async function createQuote(input: {
  companyId: string;
  contactId?: string;
  items: { productId: string; qty: number; unitPrice?: number }[];
  rep?: string | null;
  leadId?: string;
  /** Si viene de un Deal del Pipeline, vincula deal.quoteId → quote.id en la misma transacción (requisito de CRM → Inventario). */
  dealId?: string;
}): Promise<Quote> {
  const db = await getDB();
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

  await saveDB(db);
  return quote;
}

/* =========================================================================
   DEALS — mover de etapa en el Kanban
   markDealWon() sigue siendo la única función que mueve un negocio a
   "Ganado" (y descuenta inventario). Esta función es para las otras 5
   etapas del Kanban y nunca ejecuta ese flujo de negocio.
   ========================================================================= */
export async function updateDealStage(dealId: string, stage: DealStage): Promise<Deal> {
  if (stage === "Ganado") {
    throw new Error('Para mover un negocio a "Ganado" use markDealWon(), que también descuenta inventario');
  }
  const db = await getDB();
  const deal = db.deals.find((d) => d.id === dealId);
  if (!deal) throw new Error("Negocio no encontrado");
  deal.stage = stage;
  await saveDB(db);
  return deal;
}

/* =========================================================================
   LEADS — convertir en Company + Contact + Deal
   Usa relaciones reales (companyId/contactId/leadId) en vez de texto suelto.
   Es idempotente: un lead con converted=true no se puede volver a convertir.
   ========================================================================= */
export async function convertLead(leadId: string): Promise<{ lead: Lead; company: Company; contact: Contact | null; deal: Deal }> {
  const db = await getDB();
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

  await saveDB(db);
  return { lead, company, contact, deal };
}

/* =========================================================================
   TASKS
   ========================================================================= */
export async function createTask(input: { title: string; type: TaskType; companyId?: string; due: string; priority: TaskPriority; rep: string }): Promise<Task> {
  const db = await getDB();
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
  await saveDB(db);
  return task;
}

export async function updateTask(id: string, patch: Partial<Omit<Task, "id">>): Promise<Task> {
  const db = await getDB();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) throw new Error("Tarea no encontrada");
  Object.assign(task, patch);
  await saveDB(db);
  return task;
}

/* =========================================================================
   LEADS — actualizar (por ahora solo el vendedor asignado)
   ========================================================================= */
export async function updateLead(id: string, patch: Partial<Pick<Lead, "rep">>): Promise<Lead> {
  const db = await getDB();
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) throw new Error("Lead no encontrado");
  Object.assign(lead, patch);
  await saveDB(db);
  return lead;
}

export async function toggleTaskDone(id: string): Promise<Task> {
  const db = await getDB();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) throw new Error("Tarea no encontrada");
  task.done = !task.done;
  await saveDB(db);
  return task;
}

/* =========================================================================
   RESERVACIONES
   ========================================================================= */
export async function createReservation(input: {
  dealId: string;
  companyId: string;
  contactId?: string;
  items: Array<{ productId: string; qty: number; unitPrice: number }>;
  rep: string;
  notes?: string;
}): Promise<Reservation> {
  const db = await getDB();
  const deal = db.deals.find((d) => d.id === input.dealId);
  if (!deal) throw new Error("Deal no encontrado");

  // Validar stock disponible para reserva
  for (const item of input.items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
    const totalStk = totalStock(product);
    const reserved = db.reservations
      .filter((r) => r.status !== "Cancelada")
      .reduce((sum, r) => sum + (r.items.find((ri) => ri.productId === item.productId)?.qty ?? 0), 0);
    const available = totalStk - reserved;
    if (available < item.qty) {
      throw new Error(`Stock insuficiente para ${product.name}: disponible ${available}, solicitado ${item.qty}`);
    }
  }

  const now = new Date().toISOString();
  const reservation: Reservation = {
    id: newId("res"),
    dealId: input.dealId,
    companyId: input.companyId,
    contactId: input.contactId,
    items: input.items,
    status: "Reservada",
    createdAt: now,
    updatedAt: now,
    reservedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    rep: input.rep,
    notes: input.notes,
  };

  db.reservations.push(reservation);
  await saveDB(db);
  return reservation;
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
  const db = await getDB();
  const reservation = db.reservations.find((r) => r.id === id);
  if (!reservation) throw new Error("Reservación no encontrada");
  reservation.status = status;
  reservation.updatedAt = new Date().toISOString();
  await saveDB(db);
  return reservation;
}

export async function cancelReservation(id: string): Promise<Reservation> {
  return updateReservationStatus(id, "Cancelada");
}

/* =========================================================================
   INVOICES / FACTURAS
   ========================================================================= */
let lastInvoiceNumber = 0;

function getNextInvoiceNumber(): string {
  lastInvoiceNumber++;
  return `FAC-${String(lastInvoiceNumber).padStart(6, "0")}`;
}

export async function createInvoice(input: {
  dealId?: string;
  reservationId?: string;
  companyId: string;
  contactId?: string;
  companyName: string;
  contactName: string;
  items: Array<{ productId: string; description: string; qty: number; unitPrice: number }>;
  rep: string;
  notes?: string;
}): Promise<Invoice> {
  const db = await getDB();

  const subtotal = input.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.12); // IVA 12%
  const total = subtotal + tax;

  const invoice: Invoice = {
    id: newId("inv"),
    number: getNextInvoiceNumber(),
    dealId: input.dealId,
    reservationId: input.reservationId,
    companyId: input.companyId,
    contactId: input.contactId,
    companyName: input.companyName,
    contactName: input.contactName,
    items: input.items.map((item) => ({
      ...item,
      subtotal: item.qty * item.unitPrice,
    })),
    subtotal,
    tax,
    total,
    status: "Emitida",
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    rep: input.rep,
    notes: input.notes,
  };

  db.invoices.push(invoice);
  await saveDB(db);
  return invoice;
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
  const db = await getDB();
  const invoice = db.invoices.find((i) => i.id === id);
  if (!invoice) throw new Error("Factura no encontrada");
  invoice.status = status;
  await saveDB(db);
  return invoice;
}

/* =========================================================================
   USUARIOS — administración
   ========================================================================= */
export async function updateUserPassword(userId: string, newPasswordHash: string): Promise<AppUser> {
  const db = await getDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("Usuario no encontrado");
  user.passwordHash = newPasswordHash;
  await saveDB(db);
  return user;
}
