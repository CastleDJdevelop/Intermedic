"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Company, Task } from "@/lib/types";

const PRIORITY_MAP: Record<Task["priority"], { bg: string; fg: string }> = {
  Alta: { bg: "var(--amber-soft)", fg: "var(--amber)" },
  Media: { bg: "var(--primary-soft)", fg: "var(--primary)" },
  Baja: { bg: "var(--teal-soft)", fg: "var(--teal)" },
};

function daysUntil(iso: string) {
  return Math.round((new Date(iso + "T00:00:00").getTime() - new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime()) / 86400000);
}

interface TasksListProps {
  tasks: Task[];
  companies: Company[];
  onToggled: () => void;
}

function Group({ label, items, tone, companyById, onToggle, toggling }: {
  label: string; items: Task[]; tone: string; companyById: Map<string, string>;
  onToggle: (id: string) => void; toggling: string | null;
}) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: tone }}>{label}</span>
        <span className="im-mono im-ink-faint" style={{ fontSize: 11.5 }}>({items.length})</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((t) => (
          <div key={t.id} className="im-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => onToggle(t.id)}
              disabled={toggling === t.id}
              className="im-focus"
              style={{
                width: 19, height: 19, borderRadius: 6, border: "1.5px solid var(--line-strong)",
                background: t.done ? "var(--teal)" : "none", borderColor: t.done ? "var(--teal)" : undefined,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
              }}
              aria-label={t.done ? "Marcar como no completada" : "Marcar como completada"}
            >
              {t.done && <Check size={12} color="#fff" strokeWidth={3} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--ink-faint)" : "var(--ink)" }}>{t.title}</div>
              <div className="im-ink-faint" style={{ fontSize: 11.5, marginTop: 2 }}>{t.type}{t.companyId ? ` · ${companyById.get(t.companyId) ?? "—"}` : ""}</div>
            </div>
            <span className="im-badge" style={{ background: PRIORITY_MAP[t.priority].bg, color: PRIORITY_MAP[t.priority].fg }}>{t.priority}</span>
            <span className="im-mono im-ink-faint" style={{ fontSize: 11.5, width: 70, textAlign: "right" }}>{t.due}</span>
            <span className="im-ink-faint" style={{ fontSize: 12, width: 90, textAlign: "right" }}>{t.rep}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasksList({ tasks, companies, onToggled }: TasksListProps) {
  const [toggling, setToggling] = useState<string | null>(null);
  const companyById = new Map(companies.map((c) => [c.id, c.name]));

  async function toggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setToggling(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done }),
      });
      if (res.ok) onToggled();
    } finally {
      setToggling(null);
    }
  }

  const overdue = tasks.filter((t) => !t.done && daysUntil(t.due) < 0);
  const today = tasks.filter((t) => !t.done && daysUntil(t.due) === 0);
  const upcoming = tasks.filter((t) => !t.done && daysUntil(t.due) > 0);
  const done = tasks.filter((t) => t.done);

  if (tasks.length === 0) {
    return <div className="im-card" style={{ padding: 40, textAlign: "center" }}><div className="im-ink-faint" style={{ fontSize: 13.5 }}>Todavía no hay tareas registradas.</div></div>;
  }

  return (
    <div>
      <Group label="Vencidas" items={overdue} tone="var(--red)" companyById={companyById} onToggle={toggle} toggling={toggling} />
      <Group label="Hoy" items={today} tone="var(--primary)" companyById={companyById} onToggle={toggle} toggling={toggling} />
      <Group label="Próximas" items={upcoming} tone="var(--ink-soft)" companyById={companyById} onToggle={toggle} toggling={toggling} />
      <Group label="Completadas" items={done} tone="var(--ink-faint)" companyById={companyById} onToggle={toggle} toggling={toggling} />
    </div>
  );
}
