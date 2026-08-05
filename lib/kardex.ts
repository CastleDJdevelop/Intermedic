import type { Movement } from "./types";

export interface KardexRow extends Movement {
  qtyIn: number;
  qtyOut: number;
  balance: number;
  costUnit: number;
  valueBalance: number;
}

/**
 * Kardex por costo promedio ponderado — el mismo método que ya usa
 * applyMovement() para mantener Product.costProm. No hay capas/lotes en el
 * modelo de datos, así que no se ofrece FIFO (evitaría inventar un dato que
 * no existe en data/db.json).
 *
 * Función pura (sin fs) para poder usarse en componentes cliente, igual que
 * lib/stock.ts.
 */
export function computeKardex(movements: Movement[]): KardexRow[] {
  const sorted = [...movements].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let balance = 0;
  let avgCost = 0;
  const rows: KardexRow[] = [];

  for (const m of sorted) {
    let qtyIn = 0;
    let qtyOut = 0;
    let costUnit = 0;

    if (m.type === "Entrada" || (m.type === "Ajuste" && m.qty > 0)) {
      qtyIn = Math.abs(m.qty);
      const cost = m.cost ?? avgCost;
      avgCost = balance + qtyIn === 0 ? cost : (balance * avgCost + qtyIn * cost) / (balance + qtyIn);
      costUnit = cost;
      balance += qtyIn;
    } else if (m.type === "Salida" || (m.type === "Ajuste" && m.qty < 0)) {
      qtyOut = Math.abs(m.qty);
      costUnit = avgCost;
      balance -= qtyOut;
    } else if (m.type === "Transferencia") {
      // Mueve stock entre bodegas del mismo producto: no cambia el saldo total.
      costUnit = avgCost;
    }

    rows.push({ ...m, qtyIn, qtyOut, balance, costUnit, valueBalance: balance * avgCost });
  }

  return rows;
}
