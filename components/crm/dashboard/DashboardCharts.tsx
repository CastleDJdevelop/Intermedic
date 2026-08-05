"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Lead, Deal } from "@/lib/types";

function monthLabel(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-GT", { month: "short", year: "2-digit" });
}

function leadsByMonth(leads: Lead[]) {
  const counts = new Map<string, { key: string; label: string; leads: number }>();
  for (const lead of leads) {
    const key = lead.createdAt.slice(0, 7); // "YYYY-MM"
    const existing = counts.get(key);
    if (existing) existing.leads += 1;
    else counts.set(key, { key, label: monthLabel(lead.createdAt), leads: 1 });
  }
  return Array.from(counts.values()).sort((a, b) => a.key.localeCompare(b.key));
}

interface DashboardChartsProps {
  leads: Lead[];
  deals: Deal[];
}

export function DashboardCharts({ leads, deals }: DashboardChartsProps) {
  const data = useMemo(() => leadsByMonth(leads), [leads]);

  const repTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const deal of deals) {
      totals.set(deal.rep, (totals.get(deal.rep) ?? 0) + deal.value);
    }
    return Array.from(totals.entries())
      .map(([rep, total]) => ({ rep, total }))
      .sort((a, b) => b.total - a.total);
  }, [deals]);

  return (
    <div className="im-dash-charts-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
      <div className="im-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Leads por mes</div>
        <div className="im-ink-faint" style={{ fontSize: 12, marginBottom: 10 }}>Leads creados, agrupados por mes de creación</div>
        {data.length === 0 ? (
          <div className="im-ink-faint" style={{ fontSize: 13, padding: "40px 0", textAlign: "center" }}>Todavía no hay leads registrados.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ left: -18, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--ink-faint)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
              <Bar dataKey="leads" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="im-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Valor por vendedor</div>
        <div className="im-ink-faint" style={{ fontSize: 12, marginBottom: 14 }}>Suma del valor de los negocios asignados (todas las etapas)</div>
        {repTotals.length === 0 ? (
          <div className="im-ink-faint" style={{ fontSize: 13 }}>Todavía no hay negocios registrados.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {repTotals.map((r, i) => (
              <div key={r.rep} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="im-mono im-ink-faint" style={{ fontSize: 12, width: 14 }}>{i + 1}</span>
                <span style={{ fontSize: 13, flex: 1 }}>{r.rep}</span>
                <span className="im-mono" style={{ fontSize: 13, fontWeight: 600 }}>{`Q ${r.total.toLocaleString("es-GT")}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@media (max-width: 1100px) { .im-dash-charts-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
