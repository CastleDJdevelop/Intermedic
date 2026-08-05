"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Package, AlertTriangle, XCircle, ArrowLeftRight } from "lucide-react";
import type { Product, Movement } from "@/lib/types";
import { totalStock, stockStatus } from "@/lib/stock";
import { useWarehouseFilter } from "@/components/inventory/shared/InventoryContext";

function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: LucideIcon; accent: string }) {
  return (
    <div className="im-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span className="im-ink-faint im-mono" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: accent + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div className="im-display" style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function InventarioDashboardPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [movements, setMovements] = useState<Movement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { warehouseFilter } = useWarehouseFilter();

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/api/products"), fetch("/api/movements")])
      .then(async ([pRes, mRes]) => {
        if (!pRes.ok || !mRes.ok) throw new Error("Una o más APIs respondieron con error");
        const [p, m] = await Promise.all([pRes.json(), mRes.json()]);
        if (!cancelled) { setProducts(p); setMovements(m); }
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "No se pudo cargar el dashboard"); });
    return () => { cancelled = true; };
  }, []);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error al cargar el dashboard: {error}</div>;
  if (!products || !movements) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando dashboard…</div>;

  const stockOf = (p: Product) => warehouseFilter === "Todas" ? totalStock(p) : (p.warehouses[warehouseFilter] ?? 0);
  const totalUnits = products.reduce((sum, p) => sum + stockOf(p), 0);
  const lowStock = products.filter((p) => stockStatus(p) === "low");
  const outOfStock = products.filter((p) => stockStatus(p) === "out");

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>
          Existencias reales de <code>data/db.json</code> — la misma fuente que consultan el Sitio y el CRM.
          {warehouseFilter !== "Todas" && <> Filtrado por <strong>{warehouseFilter}</strong>.</>}
        </p>
      </div>

      <div className="inv-dash-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Productos" value={products.length} icon={Package} accent="#0057D9" />
        <KpiCard label="Unidades en stock" value={totalUnits} icon={ArrowLeftRight} accent="#00998A" />
        <KpiCard label="Stock bajo" value={lowStock.length} icon={AlertTriangle} accent="#C9600A" />
        <KpiCard label="Sin stock" value={outOfStock.length} icon={XCircle} accent="#D65959" />
        <style>{`
          @media (max-width: 1100px) { .inv-dash-kpi-grid { grid-template-columns: repeat(2,1fr) !important; } }
          @media (max-width: 560px) { .inv-dash-kpi-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }} className="inv-dash-cols">
        <div className="im-card" style={{ padding: 18 }}>
          <h2 className="im-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Productos con stock bajo o agotado</h2>
          {lowStock.length + outOfStock.length === 0 ? (
            <p className="im-ink-faint" style={{ fontSize: 13 }}>No hay productos por debajo del mínimo.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...outOfStock, ...lowStock].map((p) => {
                const status = stockStatus(p);
                return (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                      <div className="im-ink-faint im-mono" style={{ fontSize: 11.5 }}>{p.sku}</div>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: status === "out" ? "var(--red)" : "#C9600A" }}>
                      {totalStock(p)} {p.unit}s {status === "out" ? "· agotado" : "· bajo mínimo"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="im-card" style={{ padding: 18 }}>
          <h2 className="im-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Últimos movimientos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...movements].reverse().slice(0, 8).map((m) => {
              const product = products.find((p) => p.id === m.productId);
              return (
                <div key={m.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: 12.5 }}>
                  <strong>{m.type}</strong> · {product?.name ?? m.productId} · {m.qty > 0 ? "+" : ""}{m.qty}
                  <div className="im-ink-faint" style={{ fontSize: 11 }}>{m.ref} · {m.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .inv-dash-cols { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
