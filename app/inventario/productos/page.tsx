"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { totalStock, stockStatus } from "@/lib/stock";
import { useWarehouseFilter } from "@/components/inventory/shared/InventoryContext";
import { ProductDetail } from "@/components/inventory/products/ProductDetail";

const STATUS_LABEL: Record<string, string> = { in: "En stock", low: "Bajo mínimo", out: "Agotado" };
const STATUS_COLOR: Record<string, string> = { in: "var(--teal)", low: "#C9600A", out: "var(--red)" };

const PUBLISH_FILTERS = ["Todos", "Publicados", "No publicados"] as const;
type PublishFilter = (typeof PUBLISH_FILTERS)[number];

/** Misma regla que el Sitio (app/(site)/page.tsx): sin el campo, se considera publicado. */
function isPublished(p: Product) {
  return p.published !== false;
}

export default function InventarioProductosPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("Todos");
  const { warehouseFilter } = useWarehouseFilter();

  const load = useCallback(() => {
    fetch("/api/products")
      .then((r) => { if (!r.ok) throw new Error("La API de productos respondió con error"); return r.json(); })
      .then((data: Product[]) => setProducts(data))
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los productos"));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error: {error}</div>;
  if (!products) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando productos…</div>;

  const selected = selectedId ? products.find((p) => p.id === selectedId) ?? null : null;
  const visible = products.filter((p) => {
    if (publishFilter === "Publicados") return isPublished(p);
    if (publishFilter === "No publicados") return !isPublished(p);
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div>
          <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Productos</h1>
          <p className="im-ink-soft" style={{ fontSize: 13.5 }}>
            {visible.length} de {products.length} productos{warehouseFilter !== "Todas" ? <> · mostrando stock de <strong>{warehouseFilter}</strong></> : null}.
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {PUBLISH_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setPublishFilter(f)}
              className="im-focus"
              style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: publishFilter === f ? "var(--primary-soft)" : "transparent",
                color: publishFilter === f ? "var(--primary)" : "var(--ink-faint)",
                border: "1px solid " + (publishFilter === f ? "var(--primary)" : "var(--line)"),
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="im-card im-scrollbar-none" style={{ overflowX: "auto", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
              {["SKU", "Producto", "Categoría", "Proveedor", "Stock", "Estado", "Publicación", "Precio"].map((h) => (
                <th key={h} className="im-ink-faint" style={{ padding: "10px 14px", fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => {
              const status = stockStatus(p);
              const stock = warehouseFilter === "Todas" ? totalStock(p) : (p.warehouses[warehouseFilter] ?? 0);
              const published = isPublished(p);
              return (
                <tr key={p.id} onClick={() => setSelectedId(p.id)} style={{ borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
                  <td className="im-mono im-ink-faint" style={{ padding: "10px 14px" }}>{p.sku}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: "10px 14px" }}>{p.category}</td>
                  <td style={{ padding: "10px 14px" }}>{p.supplier}</td>
                  <td style={{ padding: "10px 14px" }}>{stock} {p.unit}s</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ color: STATUS_COLOR[status], fontWeight: 700, fontSize: 12 }}>{STATUS_LABEL[status]}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span className="im-badge" style={{ background: published ? "var(--teal-soft)" : "var(--bg-soft)", color: published ? "var(--teal)" : "var(--ink-faint)" }}>
                      {published ? "Publicado" : "No publicado"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>{p.price != null ? `Q ${p.price.toLocaleString("es-GT")}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <ProductDetail
          product={selected}
          onClose={() => setSelectedId(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
}
