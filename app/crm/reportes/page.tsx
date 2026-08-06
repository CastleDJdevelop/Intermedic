"use client";

import { useCallback, useEffect, useState } from "react";
import type { Deal, Lead } from "@/lib/types";
import { ReportsDashboard } from "@/components/crm/reports/ReportsDashboard";

export default function CRMReportsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [leadsRes, dealsRes] = await Promise.all([fetch("/api/leads"), fetch("/api/deals")]);
      if (!leadsRes.ok || !dealsRes.ok) throw new Error("Una o más APIs respondieron con error");
      const [leadsData, dealsData] = await Promise.all([leadsRes.json(), dealsRes.json()]);
      setLeads(leadsData);
      setDeals(dealsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los reportes");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error al cargar los reportes: {error}</div>;
  if (!leads || !deals) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando reportes…</div>;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Reportes</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>Indicadores de ventas, leads y desempeño del equipo — calculados desde los datos reales.</p>
      </div>
      <ReportsDashboard leads={leads} deals={deals} />
    </div>
  );
}
