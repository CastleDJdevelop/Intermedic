"use client";

import { useEffect, useState } from "react";
import { Warehouse as WarehouseIcon } from "lucide-react";
import type { Product, Warehouse } from "@/lib/types";
import { stockStatus, inventoryValue } from "@/lib/stock";
import { useWarehouseFilter } from "@/components/inventory/shared/InventoryContext";

const WAREHOUSE_NAMES: Warehouse[] = ["Bodega Central", "Sucursal Zona 10", "Sucursal Quetzaltenango", "Sucursal Escuintla"];

function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT", { maximumFractionDigits: 0 })}`;
}

export default function InventarioBodegasPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { warehouseFilter } = useWarehouseFilter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => { if (!r.ok) throw new Error("La API de productos respondió con error"); return r.json(); })
      .then((data: Product[]) => { if (!cancelled) setProducts(data); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "No se pudieron cargar las bodegas"); });
    return () => { cancelled = true; };
  }, []);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error: {error}</div>;
  if (!products) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando bodegas…</div>;

  // Misma fuente que useWarehouseFilter() (Sidebar) — no hay un segundo listado de bodegas.
  const warehousesToShow: Warehouse[] = warehouseFilter === "Todas" ? WAREHOUSE_NAMES : [warehouseFilter];
  const singleView = warehousesToShow.length === 1;
  const topLimit = singleView ? 8 : 4;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Bodegas</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>
          Existencias y valor de inventario calculados en tiempo real desde <code>data/db.json</code>.
          {warehouseFilter !== "Todas" && <> Mostrando solo <strong>{warehouseFilter}</strong> (bodega activa del selector).</>}
        </p>
      </div>

      <div className="inv-wh-grid" style={{ display: "grid", gridTemplateColumns: singleView ? "1fr" : "repeat(2, 1fr)", gap: 14 }}>
        {warehousesToShow.map((w) => {
          const withStock = products.filter((p) => (p.warehouses[w] ?? 0) > 0);
          const units = products.reduce((sum, p) => sum + (p.warehouses[w] ?? 0), 0);
          const totalValue = products.reduce((sum, p) => sum + inventoryValue(p, w), 0);
          const lowHere = products.filter((p) => (p.warehouses[w] ?? 0) > 0 && stockStatus(p) !== "in");
          const top = [...withStock].sort((a, b) => inventoryValue(b, w) - inventoryValue(a, w)).slice(0, topLimit);

          return (
            <div key={w} className="im-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0057D920", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <WarehouseIcon size={16} style={{ color: "#0057D9" }} />
                </div>
                <h2 className="im-display" style={{ fontSize: 15.5, fontWeight: 700 }}>{w}</h2>
              </div>

              <div style={{ display: "flex", gap: 20, marginBottom: 18, flexWrap: "wrap" }}>
                <div>
                  <div className="im-display" style={{ fontSize: 22, fontWeight: 700 }}>{units}</div>
                  <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Unidades</div>
                </div>
                <div>
                  <div className="im-display" style={{ fontSize: 22, fontWeight: 700 }}>{withStock.length}</div>
                  <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Productos con stock</div>
                </div>
                <div>
                  <div className="im-mono" style={{ fontSize: 20, fontWeight: 700 }}>{formatQ(totalValue)}</div>
                  <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Valor total</div>
                </div>
                <div>
                  <div className="im-display" style={{ fontSize: 22, fontWeight: 700, color: lowHere.length > 0 ? "#C9600A" : "inherit" }}>{lowHere.length}</div>
                  <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Con stock global bajo</div>
                </div>
              </div>

              <div className="im-ink-faint" style={{ fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" }}>Top productos por valor</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {top.length === 0 ? (
                  <div className="im-ink-faint" style={{ fontSize: 12.5 }}>Sin existencias registradas.</div>
                ) : top.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span className="im-mono im-ink-soft" style={{ flexShrink: 0 }}>{p.warehouses[w]} {p.unit}s · {formatQ(inventoryValue(p, w))}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@media (max-width: 700px) { .inv-wh-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
