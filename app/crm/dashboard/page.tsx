"use client";

import { useEffect, useState } from "react";
import type { Lead, Company, Deal, Task } from "@/lib/types";
import { DashboardStats } from "@/components/crm/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/crm/dashboard/DashboardCharts";
import { TasksToday } from "@/components/crm/dashboard/TasksToday";

interface DashboardData {
  leads: Lead[];
  companies: Company[];
  deals: Deal[];
  tasks: Task[];
}

export default function CRMDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [leadsRes, companiesRes, dealsRes, tasksRes] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/companies"),
          fetch("/api/deals"),
          fetch("/api/tasks"),
        ]);
        if (!leadsRes.ok || !companiesRes.ok || !dealsRes.ok || !tasksRes.ok) {
          throw new Error("Una o más APIs respondieron con error");
        }
        const [leads, companies, deals, tasks] = await Promise.all([
          leadsRes.json(),
          companiesRes.json(),
          dealsRes.json(),
          tasksRes.json(),
        ]);
        if (!cancelled) setData({ leads, companies, deals, tasks });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "No se pudo cargar el dashboard");
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>
        Error al cargar el dashboard: {error}
      </div>
    );
  }

  if (!data) {
    return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando dashboard…</div>;
  }

  const activeDeals = data.deals.filter((d) => d.stage !== "Ganado").length;
  const pendingTasks = data.tasks.filter((t) => !t.done).length;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>Resumen general de leads, negocios y tareas — datos reales de la plataforma.</p>
      </div>

      <DashboardStats
        totalLeads={data.leads.length}
        totalCompanies={data.companies.length}
        activeDeals={activeDeals}
        pendingTasks={pendingTasks}
      />

      <DashboardCharts leads={data.leads} deals={data.deals} />

      <TasksToday tasks={data.tasks} />
    </div>
  );
}
