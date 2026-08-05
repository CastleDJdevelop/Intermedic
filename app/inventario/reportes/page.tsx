"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Product, Movement, Warehouse } from "@/lib/types";
import { totalStock, stockStatus } from "@/lib/stock";

const WAREHOUSE_NAMES: Warehouse[] = ["Bodega Central", "Sucursal Zona 10", "Sucursal Quetzaltenango", "Sucursal Escuintla"];

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InventarioReportesPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [movements, setMovements] = useState<Movement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/api/products"), fetch("/api/movements")])
      .then(async ([pRes, mRes]) => {
        if (!pRes.ok || !mRes.ok) throw new Error("Una o más APIs respondieron con error");
        const [p, m] = await Promise.all([pRes.json(), mRes.json()]);
        if (!cancelled) { setProducts(p); setMovements(m); }
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "No se pudieron cargar los reportes"); });
    return () => { cancelled = true; };
  }, []);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error: {error}</div>;
  if (!products || !movements) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando reportes…</div>;

  const lowStockCount = products.filter((p) => stockStatus(p) === "low" || stockStatus(p) === "out").length;

  function exportStock() {
    const header = ["SKU", "Producto", "Categoría", "Proveedor", ...WAREHOUSE_NAMES, "Total", "Estado"];
    const rows = products!.map((p) => [
      p.sku, p.name, p.category, p.supplier,
      ...WAREHOUSE_NAMES.map((w) => p.warehouses[w] ?? 0),
      totalStock(p), stockStatus(p),
    ]);
    downloadCsv("inventario-stock.csv", [header, ...rows]);
  }

  function exportMovements() {
    const header = ["Fecha", "Tipo", "Producto SKU", "Cantidad", "De", "A", "Referencia", "Usuario"];
    const rows = movements!.map((m) => {
      const product = products!.find((p) => p.id === m.productId);
      return [m.date, m.type, product?.sku ?? m.productId, m.qty, m.from ?? "", m.to ?? "", m.ref, m.user];
    });
    downloadCsv("inventario-movimientos.csv", [header, ...rows]);
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Reportes</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>Exportes generados desde los datos reales de <code>data/db.json</code>.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }} className="inv-rep-grid">
        <div className="im-card" style={{ padding: 18 }}>
          <div className="im-ink-faint im-mono" style={{ fontSize: 11.5, textTransform: "uppercase", marginBottom: 8 }}>Productos</div>
          <div className="im-display" style={{ fontSize: 24, fontWeight: 700 }}>{products.length}</div>
        </div>
        <div className="im-card" style={{ padding: 18 }}>
          <div className="im-ink-faint im-mono" style={{ fontSize: 11.5, textTransform: "uppercase", marginBottom: 8 }}>Movimientos registrados</div>
          <div className="im-display" style={{ fontSize: 24, fontWeight: 700 }}>{movements.length}</div>
        </div>
        <div className="im-card" style={{ padding: 18 }}>
          <div className="im-ink-faint im-mono" style={{ fontSize: 11.5, textTransform: "uppercase", marginBottom: 8 }}>Bajo mínimo o agotados</div>
          <div className="im-display" style={{ fontSize: 24, fontWeight: 700, color: lowStockCount > 0 ? "#C9600A" : "inherit" }}>{lowStockCount}</div>
        </div>
      </div>

      <div className="im-card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 className="im-display" style={{ fontSize: 15, fontWeight: 700 }}>Exportar</h2>
        <button onClick={exportStock} className="im-btn im-focus" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", width: "fit-content" }}>
          <Download size={14} /> Exportar stock por bodega (CSV)
        </button>
        <button onClick={exportMovements} className="im-btn im-focus" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", width: "fit-content" }}>
          <Download size={14} /> Exportar movimientos (CSV)
        </button>
      </div>
      <style>{`@media (max-width: 900px) { .inv-rep-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
