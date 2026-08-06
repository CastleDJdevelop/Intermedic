"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Lead, LeadStatus, Product } from "@/lib/types";
import { ConvertLeadButton } from "./ConvertLeadButton";
import { AssignRepDropdown } from "./AssignRepDropdown";

const STATUS_TABS: (LeadStatus | "Todos")[] = ["Todos", "Nuevo", "Contactado", "Calificado", "Descartado"];

const STATUS_COLORS: Record<LeadStatus, { bg: string; fg: string }> = {
  Nuevo: { bg: "var(--primary-soft)", fg: "var(--primary)" },
  Contactado: { bg: "var(--amber-soft)", fg: "var(--amber)" },
  Calificado: { bg: "var(--teal-soft)", fg: "var(--teal)" },
  Descartado: { bg: "var(--red-soft)", fg: "var(--red)" },
};

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" });
}

interface LeadsTableProps {
  leads: Lead[];
  products: Product[];
  onRefetch: () => void;
}

export function LeadsTable({ leads, products, onRefetch }: LeadsTableProps) {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "Todos">("Todos");
  const [search, setSearch] = useState("");

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      const matchesStatus = statusFilter === "Todos" || l.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const productName = l.productId ? productById.get(l.productId)?.name ?? "" : "";
      return l.companyName.toLowerCase().includes(q) || l.contactName.toLowerCase().includes(q) || productName.toLowerCase().includes(q);
    });
  }, [leads, statusFilter, search, productById]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [filtered]);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
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
              {t} {t !== "Todos" && <span className="im-mono">({leads.filter((l) => l.status === t).length})</span>}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: 240 }}>
          <Search size={14} className="im-ink-faint" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por empresa o producto…"
            className="im-input im-focus"
            style={{ width: "100%", padding: "8px 10px 8px 32px", fontSize: 13 }}
          />
        </div>
      </div>

      <div className="im-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr className="im-border-b im-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".03em" }}>
              {["Empresa / contacto", "Producto", "Origen", "Fecha", "Estado", "Vendedor", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((l) => {
              const product = l.productId ? productById.get(l.productId) : undefined;
              return (
                <tr key={l.id} className="im-border-b">
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{l.companyName}</div>
                    <div className="im-ink-faint" style={{ fontSize: 12 }}>{l.contactName}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }} className="im-ink-soft">
                    {product ? product.name : <span className="im-ink-faint">—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }} className="im-ink-soft">{l.source}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="im-mono im-ink-faint">{formatDate(l.createdAt)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className="im-badge" style={{ background: STATUS_COLORS[l.status].bg, color: STATUS_COLORS[l.status].fg }}>{l.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <AssignRepDropdown lead={l} onAssigned={onRefetch} />
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <ConvertLeadButton lead={l} onConverted={onRefetch} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="im-ink-faint" style={{ padding: 40, textAlign: "center", fontSize: 13.5 }}>
            No hay leads que coincidan con el filtro.
          </div>
        )}
      </div>
    </div>
  );
}
