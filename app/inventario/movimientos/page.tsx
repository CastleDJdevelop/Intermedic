"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, RefreshCw } from "lucide-react";
import type { Product, Movement, MovementType } from "@/lib/types";
import { useWarehouseFilter } from "@/components/inventory/shared/InventoryContext";
import { MovementModal } from "@/components/inventory/movements/MovementModal";

const TYPE_COLOR: Record<string, string> = {
  Entrada: "var(--teal)",
  Salida: "var(--red)",
  Transferencia: "#0057D9",
  Ajuste: "#C9600A",
};

const MOVE_BUTTONS: { type: MovementType; label: string; icon: typeof ArrowDownToLine }[] = [
  { type: "Entrada", label: "Entrada", icon: ArrowDownToLine },
  { type: "Salida", label: "Salida", icon: ArrowUpFromLine },
  { type: "Transferencia", label: "Transferencia", icon: ArrowLeftRight },
  { type: "Ajuste", label: "Ajuste", icon: RefreshCw },
];

export default function InventarioMovimientosPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [movements, setMovements] = useState<Movement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<MovementType | null>(null);
  const { warehouseFilter } = useWarehouseFilter();

  const load = useCallback(() => {
    Promise.all([fetch("/api/products"), fetch("/api/movements")])
      .then(async ([pRes, mRes]) => {
        if (!pRes.ok || !mRes.ok) throw new Error("Una o más APIs respondieron con error");
        const [p, m] = await Promise.all([pRes.json(), mRes.json()]);
        setProducts(p);
        setMovements(m);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los movimientos"));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error: {error}</div>;
  if (!products || !movements) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando movimientos…</div>;

  const visible = warehouseFilter === "Todas"
    ? movements
    : movements.filter((m) => m.from === warehouseFilter || m.to === warehouseFilter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div>
          <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Movimientos</h1>
          <p className="im-ink-soft" style={{ fontSize: 13.5 }}>
            {visible.length} movimientos{warehouseFilter !== "Todas" ? <> relacionados con <strong>{warehouseFilter}</strong></> : null} — incluye los generados automáticamente al ganar negocios en el CRM.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MOVE_BUTTONS.map(({ type, label, icon: Icon }) => (
            <button key={type} onClick={() => setActiveModal(type)} className="im-btn im-btn-outline im-focus" style={{ padding: "8px 12px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="im-card im-scrollbar-none" style={{ overflowX: "auto", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
              {["Fecha", "Tipo", "Producto", "Cantidad", "De", "A", "Referencia", "Usuario"].map((h) => (
                <th key={h} className="im-ink-faint" style={{ padding: "10px 14px", fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...visible].reverse().map((m) => {
              const product = products.find((p) => p.id === m.productId);
              return (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td className="im-ink-faint" style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>{m.date}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ color: TYPE_COLOR[m.type] ?? "inherit", fontWeight: 700, fontSize: 12 }}>{m.type}</span>
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{product?.name ?? m.productId}</td>
                  <td style={{ padding: "10px 14px" }}>{m.qty > 0 ? "+" : ""}{m.qty}</td>
                  <td style={{ padding: "10px 14px" }}>{m.from ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>{m.to ?? "—"}</td>
                  <td className="im-ink-faint" style={{ padding: "10px 14px" }}>{m.ref}</td>
                  <td className="im-ink-faint" style={{ padding: "10px 14px" }}>{m.user}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeModal && (
        <MovementModal
          type={activeModal}
          products={products}
          onClose={() => setActiveModal(null)}
          onCreated={load}
        />
      )}
    </div>
  );
}
