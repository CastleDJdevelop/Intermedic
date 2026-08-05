"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Search } from "lucide-react";
import type { Product } from "@/lib/types";
import { totalStock, inventoryValue } from "@/lib/stock";
import { useWarehouseFilter } from "@/components/inventory/shared/InventoryContext";

function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT", { maximumFractionDigits: 0 })}`;
}

export default function InventarioCategoriasPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { warehouseFilter } = useWarehouseFilter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => { if (!r.ok) throw new Error("La API de productos respondió con error"); return r.json(); })
      .then((data: Product[]) => { if (!cancelled) setProducts(data); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "No se pudieron cargar las categorías"); });
    return () => { cancelled = true; };
  }, []);

  // Sin entidad Category ni array maestro: se agrupa dinámicamente por
  // product.category, el mismo campo real que ya usan Productos y Proveedores.
  const groups = useMemo(() => {
    if (!products) return [];
    const map = new Map<string, Product[]>();
    for (const p of products) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error: {error}</div>;
  if (!products) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando categorías…</div>;

  const filtered = groups.filter(([category]) => category.toLowerCase().includes(search.toLowerCase()));
  const activeWarehouse = warehouseFilter === "Todas" ? undefined : warehouseFilter;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Categorías</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>
          {groups.length} categorías, agrupadas dinámicamente desde los productos registrados.
          {warehouseFilter !== "Todas" && <> Stock y valor de <strong>{warehouseFilter}</strong>.</>}
        </p>
      </div>

      <div style={{ position: "relative", maxWidth: 320, marginBottom: 18 }}>
        <Search size={15} className="im-ink-faint" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría…"
          className="im-input im-focus"
          style={{ width: "100%", padding: "9px 12px 9px 34px", fontSize: 13.5 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="im-card" style={{ padding: 24 }}>
          <p className="im-ink-faint" style={{ fontSize: 13 }}>Ninguna categoría coincide con &quot;{search}&quot;.</p>
        </div>
      ) : (
        <div className="inv-cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {filtered.map(([category, items]) => {
            const units = items.reduce((sum, p) => sum + (activeWarehouse ? (p.warehouses[activeWarehouse] ?? 0) : totalStock(p)), 0);
            const value = items.reduce((sum, p) => sum + inventoryValue(p, activeWarehouse), 0);
            return (
              <div key={category} className="im-card" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#7C5CFF20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Layers size={16} style={{ color: "#7C5CFF" }} />
                  </div>
                  <h2 className="im-display" style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.25 }}>{category}</h2>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div>
                    <div className="im-display" style={{ fontSize: 20, fontWeight: 700 }}>{items.length}</div>
                    <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Producto{items.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div>
                    <div className="im-display" style={{ fontSize: 20, fontWeight: 700 }}>{units}</div>
                    <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Unidades</div>
                  </div>
                  <div>
                    <div className="im-mono" style={{ fontSize: 17, fontWeight: 700 }}>{formatQ(value)}</div>
                    <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Valor</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        @media (max-width: 1100px) { .inv-cat-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 700px) { .inv-cat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
