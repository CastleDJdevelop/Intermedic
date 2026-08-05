"use client";

import { useEffect, useMemo, useState } from "react";
import { Truck } from "lucide-react";
import type { Product } from "@/lib/types";
import { totalStock, inventoryValue } from "@/lib/stock";

function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT", { maximumFractionDigits: 0 })}`;
}

export default function InventarioProveedoresPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => { if (!r.ok) throw new Error("La API de productos respondió con error"); return r.json(); })
      .then((data: Product[]) => { if (!cancelled) setProducts(data); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "No se pudieron cargar los proveedores"); });
    return () => { cancelled = true; };
  }, []);

  // Los proveedores todavía no son una entidad propia (sin API/modelo dedicado):
  // se derivan de product.supplier, agrupando los productos reales existentes.
  const suppliers = useMemo(() => {
    if (!products) return [];
    const map = new Map<string, Product[]>();
    for (const p of products) {
      if (!map.has(p.supplier)) map.set(p.supplier, []);
      map.get(p.supplier)!.push(p);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error: {error}</div>;
  if (!products) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando proveedores…</div>;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Proveedores</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>{suppliers.length} proveedores, derivados de los productos registrados.</p>
      </div>

      <div className="inv-sup-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {suppliers.map(([supplier, items]) => {
          const units = items.reduce((sum, p) => sum + totalStock(p), 0);
          const value = items.reduce((sum, p) => sum + inventoryValue(p), 0);
          // Categorías que distribuye este proveedor — derivadas de product.category
          // de sus propios productos, no un campo propio del proveedor (no existe).
          const categories = [...new Set(items.map((p) => p.category))].sort();
          return (
            <div key={supplier} className="im-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#00998A20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Truck size={16} style={{ color: "#00998A" }} />
                </div>
                <h2 className="im-display" style={{ fontSize: 15, fontWeight: 700 }}>{supplier}</h2>
              </div>
              <div style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
                <div>
                  <div className="im-display" style={{ fontSize: 20, fontWeight: 700 }}>{items.length}</div>
                  <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Productos</div>
                </div>
                <div>
                  <div className="im-display" style={{ fontSize: 20, fontWeight: 700 }}>{units}</div>
                  <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Unidades en stock</div>
                </div>
                <div>
                  <div className="im-mono" style={{ fontSize: 18, fontWeight: 700 }}>{formatQ(value)}</div>
                  <div className="im-ink-faint" style={{ fontSize: 11.5 }}>Valor de inventario</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {categories.map((c) => (
                  <span key={c} className="im-badge" style={{ background: "var(--bg-soft)", color: "var(--ink-soft)" }}>{c}</span>
                ))}
              </div>
              <div className="im-border-t" style={{ paddingTop: 10 }}>
                <div className="im-ink-faint" style={{ fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".03em" }}>Productos asociados</div>
                <div className="im-ink-faint" style={{ fontSize: 12 }}>{items.map((p) => p.name).join(" · ")}</div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@media (max-width: 700px) { .inv-sup-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
