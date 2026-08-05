/**
 * Tipos compartidos entre Sitio Web, CRM e Inventario.
 * Esta es la fuente única de verdad del modelo de datos: los tres módulos
 * importan de aquí en lugar de definir su propia copia de "Producto",
 * "Empresa", etc. — así se garantiza que estén realmente conectados.
 *
 * Cuando se migre a Prisma, este archivo se convierte casi 1:1 en schema.prisma.
 */

export type Warehouse = "Bodega Central" | "Sucursal Zona 10" | "Sucursal Quetzaltenango" | "Sucursal Escuintla";

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  supplier: string;
  unit: string;
  /** Precio de venta al público, el que ve el sitio web */
  price: number | null;
  /** Costo promedio ponderado, solo visible para Administrador en Inventario */
  costProm: number;
  ultimoCosto: number;
  stockMin: number;
  stockMax: number;
  serialized: boolean;
  /** Existencias por bodega — la MISMA cifra que el sitio web usa para mostrar disponibilidad */
  warehouses: Partial<Record<Warehouse, number>>;
  badge?: "Nuevo" | "Promoción" | "Destacado" | null;
  usage?: "Nuevo" | "Reacondicionado";
  description?: string;
  /** Par de colores para el gradiente de la ficha visual del sitio (no hay fotografía real todavía) */
  images?: string[];
  /** Especificaciones técnicas mostradas en la ficha de producto del sitio */
  specs?: [string, string][];
  /** Estimado de entrega mostrado en el sitio, ej. "5–7 días hábiles" */
  delivery?: string;
  /** Si es false, el producto existe en Inventario pero no se muestra en el sitio público */
  published?: boolean;
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  city: string;
  rep: string; // vendedor asignado (CRM)
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  companyId: string;
  email: string;
  phone: string;
  /** Fecha del último contacto registrado (ISO), para mostrar actividad reciente en el CRM */
  lastContact?: string;
  status?: "Activo" | "Inactivo";
}

export type LeadStatus = "Nuevo" | "Contactado" | "Calificado" | "Descartado";
export type LeadSource = "Sitio web" | "WhatsApp" | "Referido" | "Llamada entrante" | "Feria / evento";

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  rep: string | null;
  createdAt: string;
  /** Si vino de una solicitud de cotización del sitio web, referencia al producto */
  productId?: string;
  note?: string;
  /** true una vez que se convirtió en Company + Contact + Deal — evita convertir el mismo lead dos veces */
  converted?: boolean;
}

export type DealStage = "Prospección" | "Calificación" | "Propuesta enviada" | "Negociación" | "Ganado" | "Perdido";

export interface Deal {
  id: string;
  title: string;
  companyId: string;
  contactId?: string;
  value: number;
  stage: DealStage;
  rep: string;
  closeDate: string;
  quoteId?: string;
  /** Si el negocio nació de convertir un Lead, referencia al Lead original para trazabilidad */
  leadId?: string;
}

export type QuoteStatus = "Borrador" | "Enviada" | "Aprobada" | "Rechazada" | "Vencida";

export interface QuoteItem {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  companyName: string;
  contactName: string;
  items: QuoteItem[];
  total: number;
  status: QuoteStatus;
  rep: string | null;
  createdAt: string;
  leadId?: string;
}

export type MovementType = "Entrada" | "Salida" | "Transferencia" | "Ajuste";

export interface Movement {
  id: string;
  date: string;
  type: MovementType;
  productId: string;
  qty: number; // negativo en Salida / Ajuste negativo
  from: Warehouse | null;
  to: Warehouse | null;
  cost: number | null;
  ref: string;
  user: string;
}

export type TaskType = "Llamada" | "Correo" | "Reunión" | "Seguimiento";
export type TaskPriority = "Alta" | "Media" | "Baja";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  /** Empresa relacionada, si ya existe como Company real (no se duplica el nombre como texto) */
  companyId?: string;
  due: string;
  priority: TaskPriority;
  rep: string;
  done: boolean;
}

export type UserRole = "Administrador" | "Vendedor";

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

/** Forma completa de data/db.json */
export interface DB {
  products: Product[];
  companies: Company[];
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  quotes: Quote[];
  movements: Movement[];
  users: AppUser[];
  tasks: Task[];
}
