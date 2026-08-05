"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { Product, Quote, QuoteStatus } from "@/lib/types";

function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT")}`;
}

const STATUS_TABS: (QuoteStatus | "Todas")[] = ["Todas", "Borrador", "Enviada", "Aprobada", "Rechazada", "Vencida"];

const STATUS_COLORS: Record<QuoteStatus, { bg: string; fg: string }> = {
  Borrador: { bg: "var(--bg-soft)", fg: "var(--ink-faint)" },
  Enviada: { bg: "var(--primary-soft)", fg: "var(--primary)" },
  Aprobada: { bg: "var(--teal-soft)", fg: "var(--teal)" },
  Rechazada: { bg: "var(--red-soft)", fg: "var(--red)" },
  Vencida: { bg: "var(--amber-soft)", fg: "var(--amber)" },
};

interface QuotesTableProps {
  quotes: Quote[];
  products: Product[];
  onNew: () => void;
}

export function QuotesTable({ quotes, products, onNew }: QuotesTableProps) {
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "Todas">("Todas");
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const filtered = statusFilter === "Todas" ? quotes : quotes.filter((q) => q.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const totalShown = sorted.reduce((s, q) => s + q.total, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setStatusFilter(t)}
              className="im-focus"
              style={{
                padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                border: "1px solid " + (statusFilter === t ? "var(--primary)" : "var(--line)"),
                background: statusFilter === t ? "var(--primary-soft)" : "var(--surface)",
                color: statusFilter === t ? "var(--primary)" : "var(--ink-soft)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={onNew} className="im-btn im-btn-primary im-focus" style={{ padding: "9px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Nueva cotización
        </button>
      </div>

      <div className="im-card" style={{ overflowX: "auto", marginBottom: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr className="im-border-b im-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
              {["Empresa / contacto", "Productos", "Total", "Estado", "Fecha", "Vendedor"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((q) => (
              <tr key={q.id} className="im-border-b">
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{q.companyName}</div>
                  <div className="im-ink-faint" style={{ fontSize: 12 }}>{q.contactName}</div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="im-ink-soft">
                  {q.items.map((it) => productById.get(it.productId)?.sku ?? it.productId).join(", ")}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13.5, fontWeight: 700 }} className="im-mono">{formatQ(q.total)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span className="im-badge" style={{ background: STATUS_COLORS[q.status].bg, color: STATUS_COLORS[q.status].fg }}>{q.status}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="im-mono im-ink-faint">{q.createdAt}</td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="im-ink-soft">{q.rep ?? "Sin asignar"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="im-ink-faint" style={{ padding: 40, textAlign: "center", fontSize: 13.5 }}>No hay cotizaciones que coincidan con el filtro.</div>
        )}
      </div>
      <div style={{ textAlign: "right", fontSize: 13 }} className="im-ink-soft">
        Total mostrado: <span className="im-mono im-ink" style={{ fontWeight: 700 }}>{formatQ(totalShown)}</span>
      </div>
    </div>
  );
}
