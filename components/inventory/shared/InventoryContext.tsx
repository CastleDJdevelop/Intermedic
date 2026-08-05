"use client";

import { createContext, useContext, useState } from "react";
import type { Warehouse } from "@/lib/types";

type WarehouseFilter = Warehouse | "Todas";

interface InventoryContextValue {
  warehouseFilter: WarehouseFilter;
  setWarehouseFilter: (w: WarehouseFilter) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

/**
 * Bodega activa seleccionada en el sidebar — la consumen las pantallas de
 * Inventario (Dashboard, Productos, Movimientos, Bodegas) para filtrar la
 * MISMA data de data/db.json, no una copia distinta por bodega.
 */
export function InventoryContextProvider({ children }: { children: React.ReactNode }) {
  const [warehouseFilter, setWarehouseFilter] = useState<WarehouseFilter>("Todas");
  return (
    <InventoryContext.Provider value={{ warehouseFilter, setWarehouseFilter }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useWarehouseFilter() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useWarehouseFilter debe usarse dentro de InventoryContextProvider");
  return ctx;
}
