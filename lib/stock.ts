import type { Product } from "./types";

/**
 * Lógica de stock pura (sin fs/path) para que los componentes cliente del
 * sitio puedan importarla sin arrastrar lib/db.ts (que sí depende de Node).
 * lib/db.ts reexporta estas mismas funciones para el código de servidor.
 */

export type StockStatus = "in" | "low" | "out";

export function totalStock(product: Product): number {
  return Object.values(product.warehouses).reduce((sum, qty) => sum + (qty ?? 0), 0);
}

export function stockStatus(product: Product): StockStatus {
  const total = totalStock(product);
  if (total <= 0) return "out";
  if (total <= product.stockMin) return "low";
  return "in";
}
