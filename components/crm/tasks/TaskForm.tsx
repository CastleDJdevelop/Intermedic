"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Company, TaskPriority, TaskType } from "@/lib/types";
import { RepSelect } from "@/components/crm/companies/RepSelect";

const TYPES: TaskType[] = ["Llamada", "Correo", "Reunión", "Seguimiento"];
const PRIORITIES: TaskPriority[] = ["Alta", "Media", "Baja"];

export function TaskForm({ companies, onClose, onCreated }: { companies: Company[]; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("Llamada");
  const [companyId, setCompanyId] = useState("");
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<TaskPriority>("Media");
  const [rep, setRep] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !rep) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, companyId: companyId || undefined, due, priority, rep }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "No se pudo crear la tarea");
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.55)" }} />
      <form onSubmit={submit} className="im-surface im-shadow-lg im-fade-up" style={{ position: "relative", width: "min(440px,100%)", borderRadius: 16, padding: 26 }}>
        <button type="button" onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        <h3 className="im-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, paddingRight: 30 }}>Nueva tarea</h3>

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Título</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 14 }} placeholder="Ej. Llamar para confirmar entrega" />

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as TaskType)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Prioridad</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Empresa relacionada (opcional)</label>
        <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 14 }}>
          <option value="">Sin empresa</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Fecha límite</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Vendedor</label>
            <RepSelect value={rep} onChange={setRep} style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} />
          </div>
        </div>

        {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12.5, marginTop: 8 }}>{error}</div>}

        <button type="submit" disabled={saving} className="im-btn im-btn-primary im-focus" style={{ width: "100%", padding: 12, fontSize: 13.5, marginTop: 14 }}>
          {saving ? "Creando…" : "Crear tarea"}
        </button>
      </form>
    </div>
  );
}
