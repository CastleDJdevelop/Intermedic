"use client";

import type { LucideIcon } from "lucide-react";
import { UserPlus, Building2, Briefcase, CheckSquare } from "lucide-react";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
}

function KpiCard({ label, value, icon: Icon, accent }: Stat) {
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

interface DashboardStatsProps {
  totalLeads: number;
  totalCompanies: number;
  activeDeals: number;
  pendingTasks: number;
}

export function DashboardStats({ totalLeads, totalCompanies, activeDeals, pendingTasks }: DashboardStatsProps) {
  return (
    <div className="im-dash-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
      <KpiCard label="Total leads" value={totalLeads} icon={UserPlus} accent="#C9600A" />
      <KpiCard label="Total empresas" value={totalCompanies} icon={Building2} accent="#0057D9" />
      <KpiCard label="Deals activos" value={activeDeals} icon={Briefcase} accent="#00998A" />
      <KpiCard label="Tareas pendientes" value={pendingTasks} icon={CheckSquare} accent="#D65959" />
      <style>{`
        @media (max-width: 1100px) { .im-dash-kpi-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .im-dash-kpi-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
