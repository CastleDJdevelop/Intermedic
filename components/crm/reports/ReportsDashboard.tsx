"use client";

import { useMemo } from "react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Deal, Lead } from "@/lib/types";

function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT")}`;
}
function monthLabel(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-GT", { month: "short", year: "2-digit" });
}

const SOURCE_COLORS: Record<string, string> = {
  "Sitio web": "#0057D9",
  "WhatsApp": "#00998A",
  "Referido": "#C9600A",
  "Llamada entrante": "#7C5CFF",
  "Feria / evento": "#D65959",
};

interface ReportsDashboardProps {
  leads: Lead[];
  deals: Deal[];
}

export function ReportsDashboard({ leads, deals }: ReportsDashboardProps) {
  const won = deals.filter((d) => d.stage === "Ganado");
  const open = deals.filter((d) => d.stage !== "Ganado" && d.stage !== "Perdido");

  const salesByMonth = useMemo(() => {
    const map = new Map<string, { key: string; label: string; ventas: number }>();
    for (const d of won) {
      const key = d.closeDate.slice(0, 7);
      const existing = map.get(key);
      if (existing) existing.ventas += d.value;
      else map.set(key, { key, label: monthLabel(d.closeDate), ventas: d.value });
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [won]);

  const leadsBySource = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of leads) map.set(l.source, (map.get(l.source) ?? 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value, color: SOURCE_COLORS[name] ?? "#8494A3" }));
  }, [leads]);

  const repRows = useMemo(() => {
    const reps = new Set<string>();
    for (const d of deals) if (d.rep) reps.add(d.rep);
    return Array.from(reps).map((rep) => ({
      rep,
      won: won.filter((d) => d.rep === rep).length,
      wonValue: won.filter((d) => d.rep === rep).reduce((s, d) => s + d.value, 0),
      openValue: open.filter((d) => d.rep === rep).reduce((s, d) => s + d.value, 0),
    })).sort((a, b) => b.wonValue - a.wonValue);
  }, [deals, won, open]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="im-reports-grid">
        <div className="im-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Ventas ganadas por mes</div>
          <div className="im-ink-faint" style={{ fontSize: 12, marginBottom: 10 }}>
            Suma del valor de negocios en etapa "Ganado", agrupados por fecha de cierre estimada (dato disponible más cercano a la fecha real de venta)
          </div>
          {salesByMonth.length === 0 ? (
            <div className="im-ink-faint" style={{ fontSize: 13, padding: "30px 0", textAlign: "center" }}>Todavía no hay negocios ganados.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesByMonth} margin={{ left: -18, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--ink-faint)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v) => formatQ(Number(v))} contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
                <Line type="monotone" dataKey="ventas" stroke="var(--teal)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="im-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Leads por origen</div>
          <div className="im-ink-faint" style={{ fontSize: 12, marginBottom: 10 }}>Todos los leads registrados en la plataforma</div>
          {leadsBySource.length === 0 ? (
            <div className="im-ink-faint" style={{ fontSize: 13, padding: "30px 0", textAlign: "center" }}>Todavía no hay leads registrados.</div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ResponsiveContainer width="55%" height={190}>
                <PieChart>
                  <Pie data={leadsBySource} dataKey="value" nameKey="name" innerRadius={44} outerRadius={72} paddingAngle={2}>
                    {leadsBySource.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {leadsBySource.map((s) => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />
                    <span className="im-ink-soft">{s.name} ({s.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="im-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Desempeño por vendedor</div>
        {repRows.length === 0 ? (
          <div className="im-ink-faint" style={{ fontSize: 13 }}>Todavía no hay negocios con vendedor asignado.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr className="im-border-b im-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
                {["Vendedor", "Negocios ganados", "Valor cerrado", "En pipeline"].map((h) => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {repRows.map((r) => (
                <tr key={r.rep} className="im-border-b">
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{r.rep}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{r.won}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }} className="im-mono">{formatQ(r.wonValue)}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }} className="im-mono im-ink-soft">{formatQ(r.openValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@media (max-width: 900px) { .im-reports-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
