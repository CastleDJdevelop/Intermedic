"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RepSelect } from "./RepSelect";

const SECTORS = ["Hospital", "Clínica", "Odontología", "Veterinaria", "Laboratorio", "Prospecto"];

export function CreateCompanyModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [sector, setSector] = useState(SECTORS[0]);
  const [city, setCity] = useState("");
  const [rep, setRep] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sector, city, rep }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "No se pudo crear la empresa");
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
        <h3 className="im-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, paddingRight: 30 }}>Nueva empresa</h3>

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Nombre de la empresa</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 14 }} placeholder="Ej. Clínica del Norte" />

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Sector</label>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Ciudad</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Ciudad de Guatemala" />
          </div>
        </div>

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Vendedor asignado</label>
        <RepSelect value={rep} onChange={setRep} style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 6 }} />

        {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12.5, marginTop: 8 }}>{error}</div>}

        <button type="submit" disabled={saving} className="im-btn im-btn-primary im-focus" style={{ width: "100%", padding: 12, fontSize: 13.5, marginTop: 14 }}>
          {saving ? "Creando…" : "Crear empresa"}
        </button>
      </form>
    </div>
  );
}
