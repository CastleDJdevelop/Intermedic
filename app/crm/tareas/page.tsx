"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Company, Task } from "@/lib/types";
import { TasksList } from "@/components/crm/tasks/TasksList";
import { TaskForm } from "@/components/crm/tasks/TaskForm";

export default function CRMTasksPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [tasksRes, companiesRes] = await Promise.all([fetch("/api/tasks"), fetch("/api/companies")]);
      if (!tasksRes.ok || !companiesRes.ok) throw new Error("Una o más APIs respondieron con error");
      const [tasksData, companiesData] = await Promise.all([tasksRes.json(), companiesRes.json()]);
      setTasks(tasksData);
      setCompanies(companiesData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las tareas");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error al cargar las tareas: {error}</div>;
  if (!tasks || !companies) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando tareas…</div>;

  return (
    <div>
      <div style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Tareas y seguimiento</h1>
          <p className="im-ink-soft" style={{ fontSize: 13.5 }}>Llamadas, correos, reuniones y recordatorios pendientes.</p>
        </div>
        <button onClick={() => setCreating(true)} className="im-btn im-btn-primary im-focus" style={{ padding: "9px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Nueva tarea
        </button>
      </div>

      <TasksList tasks={tasks} companies={companies} onToggled={load} />

      {creating && <TaskForm companies={companies} onClose={() => setCreating(false)} onCreated={load} />}
    </div>
  );
}
