"use client";

import type { Task } from "@/lib/types";

const PRIORITY_MAP: Record<Task["priority"], { bg: string; fg: string }> = {
  Alta: { bg: "var(--amber-soft)", fg: "var(--amber)" },
  Media: { bg: "var(--primary-soft)", fg: "var(--primary)" },
  Baja: { bg: "var(--teal-soft)", fg: "var(--teal)" },
};

export function TasksToday({ tasks }: { tasks: Task[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((t) => !t.done && t.due === today);

  return (
    <div className="im-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Tareas de hoy</div>
      <div className="im-ink-faint" style={{ fontSize: 12, marginBottom: 14 }}>
        {new Date(today + "T00:00:00").toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" })}
      </div>
      {dueToday.length === 0 ? (
        <div className="im-ink-faint" style={{ fontSize: 13 }}>No hay tareas pendientes para hoy.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {dueToday.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="im-badge" style={{ background: PRIORITY_MAP[t.priority].bg, color: PRIORITY_MAP[t.priority].fg }}>{t.priority}</span>
              <span style={{ fontSize: 13, flex: 1 }} className="im-line-clamp-2">{t.title}</span>
              <span className="im-ink-faint" style={{ fontSize: 12 }}>{t.rep}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
